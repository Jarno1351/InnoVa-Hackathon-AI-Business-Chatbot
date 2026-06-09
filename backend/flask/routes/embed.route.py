import os
from flask import Blueprint, request, jsonify
from langchain_google_genai import GoogleGenAIEmbeddings

# Define the isolated Blueprint hook
embed_blueprint = Blueprint('embed_api', __name__)

# Initialize your embedding engine globally within this module
embeddings = GoogleGenAIEmbeddings(model="models/text-embedding-004")

@embed_blueprint.route('/embed', methods=['POST'])
def generate_embedding():
    try:
        data = request.get_json()
        
        # Safe structural type checking
        if not data or "text" not in data:
            return jsonify({
                "success": False, 
                "error": "Initialization failure. Prompt field 'text' is missing."
            }), 400
            
        text_to_embed = data.get("text")
        
        if not text_to_embed.strip():
            return jsonify({
                "success": False, 
                "error": "Invalid operation. Prompt cannot be blank."
            }), 400
        
        # 🧠 Generate your text vectors
        vector = embeddings.embed_query(text_to_embed)
        
        return jsonify({
            "success": True, 
            "embedding": vector
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False, 
            "error": "Embedding pipeline computation barrier.",
            "details": str(e)
        }), 500