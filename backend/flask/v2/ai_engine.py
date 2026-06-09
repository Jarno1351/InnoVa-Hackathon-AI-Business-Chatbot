from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_ollama import OllamaEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from config import supplies_collection, services_collection

embeddings = OllamaEmbeddings(model="mxbai-embed-large")
model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.0)

supplies_store = MongoDBAtlasVectorSearch(
    collection=supplies_collection,
    embedding=embeddings,
    index_name="vector_index",       
    text_key="textChunk",           
    embedding_key="vectorEmbedding" 
)

services_store = MongoDBAtlasVectorSearch(
    collection=services_collection,
    embedding=embeddings,
    index_name="vector_index",
    text_key="textChunk",
    embedding_key="vectorEmbedding"
)

# 🎯 Fixed layout format by escaping brackets cleanly for LangChain template parser
template = """<|system|>
You are an intelligent business network chatbot assistant for Valencia City. 

You must analyze the User's Query and the provided Context. 
Determine if the user is explicitly looking to FIND, BUY, LOCATE, or SOURCE a specific item or service. 

You MUST respond STRICTLY in the following JSON schema format. Do not add markdown blocks or extra text outside this structure:
{{
  "reply": "Your natural, helpful conversational response.",
  "wants_location": true_or_false,
  "valid_context_match": true_or_false
}}

⚠️ CRITICAL RULES FOR valid_context_match:
- Set "valid_context_match" to true ONLY if the "Context from Database" actually contains real inventory, supplies, or services that match the specific item the user is looking for.
- If the context contains items completely unrelated to the user's specific target (e.g., user asks for "apple" but the context only contains "wired keyboard" or "monitor"), you MUST set "valid_context_match" to false.
- If you have to say that you don't have information about their request in your database, you MUST set "valid_context_match" to false.

Context from Database:
{context_chunks}

History:
{chat_history}
<|user|>
Current Query: {question}
<|assistant|>"""

prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

chat_history_list = []