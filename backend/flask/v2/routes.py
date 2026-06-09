import os
import json
from flask import Blueprint, request, jsonify
from pydantic import BaseModel, Field
from typing import Optional
from google import genai

# Import your pre-configured AI variables from your local engine
from ai_engine import embeddings, supplies_store, services_store, chain, chat_history_list

# Automatically locate and read the .env file 
from dotenv import load_dotenv
load_dotenv()

# Initialize the Blueprint
api_blueprint = Blueprint('api', __name__)

# Initialize the Google GenAI Client (Reads GEMINI_API_KEY from .env)
client = genai.Client()

# 📐 Schema Definition for Gemini Structured Outputs
class IntentExtractionSchema(BaseModel):
    semanticQuery: str = Field(
        description="The clean name or description of the product or item requested, stripping away budget mentions. Example: 'mechanical keyboard'."
    )
    maxPrice: Optional[float] = Field(
        default=None,
        description="The absolute upper limit numerical limit of the budget if mentioned. Convert abbreviations like '1.5k' to 1500.0. If no price limit is mentioned, return null."
    )

# --- 1. INTENT EXTRACTION ROUTE ---
@api_blueprint.route('/api/v1/extract-intent', methods=['POST'])
def extract_intent():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                "success": False, 
                "message": "Missing 'text' property in JSON payload"
            }), 400
        
        user_input = data['text']

        # Call Gemini 2.5 Flash using Structured Outputs via Pydantic
        response = client.models.generate_content(
            model='gemini-2.5-flash', 
            contents=f"Extract search parameters from this statement: '{user_input}'",
            config={
                'response_mime_type': 'application/json',
                'response_schema': IntentExtractionSchema,
                'temperature': 0.0 
            },
        )

        # Parse string output into native python dict
        extracted_data = json.loads(response.text)

        return jsonify({
            "success": True,
            "data": extracted_data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False, 
            "error": "Failed to extract text structural entities", 
            "details": str(e)
        }), 500


# --- 2. EMBEDDING ROUTE ---
@api_blueprint.route('/api/v1/embed', methods=['POST'])
def generate_embedding():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"success": False, "error": "No text provided"}), 400
            
        text_to_embed = data.get("text")
        
        if not text_to_embed.strip():
            return jsonify({"success": False, "error": "Text payload cannot be empty."}), 400
        
        vector = embeddings.embed_query(text_to_embed)
        return jsonify({"success": True, "embedding": vector})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# --- 3. CORE CHAT & RAG ROUTE ---
@api_blueprint.route('/api/v1/chat', methods=['POST'])
def handle_chat_session():
    try:
        data = request.get_json() or {}
        question = data.get("question")   # Clean semantic query extracted from Express gateway
        max_price = data.get("maxPrice")   # Explicit numerical budget ceiling extracted by Gemini
        
        if not question:
            return jsonify({"success": False, "error": "Question is required."}), 400

        # 1. 🛠️ DYNAMIC PRE-FILTER SETUP (Fixed path target mapping to match your new schema layout)
        pre_filter_query = None
        if max_price is not None:
            pre_filter_query = {
                "metadata.price": {"$lte": float(max_price)}
            }

        # 2. Query the vector stores with Pre-Filtering
        supplies_with_scores = supplies_store.similarity_search_with_score(
            query=question, 
            k=5,
            pre_filter=pre_filter_query
        )
        services_with_scores = services_store.similarity_search_with_score(
            query=question, 
            k=5,
            pre_filter=pre_filter_query
        )
        all_matches = supplies_with_scores + services_with_scores

        # 3. 🔥 FILTER, SORT, AND DEDUPLICATE
        MATCH_THRESHOLD = 0.80 
        valid_matches = [(doc, float(score)) for doc, score in all_matches if float(score) >= MATCH_THRESHOLD]
        valid_matches.sort(key=lambda x: x[1], reverse=True)

        unique_branches = []
        seen_branch_ids = set()
        context_details_for_frontend = []
        context_chunks_for_ai = []
        
        for doc, score in valid_matches:
            branch_id = str(doc.metadata.get("branchId"))
            
            context_chunks_for_ai.append(doc.page_content)
            context_details_for_frontend.append({
                "text": doc.page_content,
                "confidenceScore": round(score, 4),
                "percentage": f"{round(score * 100, 2)}%"
            })
            
            if branch_id not in seen_branch_ids:
                seen_branch_ids.add(branch_id)
                unique_branches.append({
                    "businessId": str(doc.metadata.get("businessId")),
                    "branchId": branch_id,
                    "chunkId": str(doc.metadata.get("_id"))
                })
            
            if len(unique_branches) >= 3:
                break

        # 4. Prepare AI Context strings
        if len(unique_branches) > 0:
            context_chunks_str = "\n".join(context_chunks_for_ai)
            highest_score_found = valid_matches[0][1] 
        else:
            context_chunks_str = "EMPTY_NO_MATCH"
            highest_score_found = 0.0

        chat_history_text = "\n".join(chat_history_list)

        # 5. 🔥 UPDATE PROMPT WITH INJECTED CEILING INFORMATION
        budget_context = f"User Budget Limit: {max_price} PHP." if max_price else "User Budget Limit: None specified."
        formatted_question = f"{budget_context}\nUser Question: {question}"

        # Execute processing pipeline via Gemini
        ai_response = chain.invoke({
            "chat_history": chat_history_text,
            "context_chunks": context_chunks_str,
            "question": formatted_question
        })
        
        raw_text = getattr(ai_response, 'content', str(ai_response)).strip()
        
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        try:
            parsed_ai_data = json.loads(raw_text)
            reply_text = parsed_ai_data.get("reply", "I'm sorry, I couldn't process that.")
            wants_location = parsed_ai_data.get("wants_location", False)
            valid_context_match = parsed_ai_data.get("valid_context_match", False)
        except json.JSONDecodeError:
            reply_text = raw_text
            wants_location = False
            valid_context_match = False

        # 6. 🔥 THE TRIPLE-CHECK LOGIC GATE
        if len(unique_branches) > 0 and wants_location and valid_context_match:
            state_evaluated = "SEARCH_MATCH"
            has_relational_data = True
            final_branches_to_send = unique_branches 
        else:
            state_evaluated = "NORMAL_CONVERSATION"
            has_relational_data = False
            final_branches_to_send = []

        chat_history_list.append(f"User: {question}")
        chat_history_list.append(f"AI: {reply_text}")

        return jsonify({
            "success": True,
            "reply": reply_text,
            "stateEvaluated": state_evaluated,
            "highestScore": round(highest_score_found, 4),
            "hasRelationalData": has_relational_data,
            "matchedBranches": final_branches_to_send,
            "contextUsed": context_details_for_frontend
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500