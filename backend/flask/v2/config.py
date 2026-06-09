import os
from dotenv import load_dotenv
from pymongo import MongoClient

# --- INITIALIZE ENVIRONMENT ---
load_dotenv()

# --- APP CONFIG CONSTANTS ---
PORT = 8000
DEBUG = True
MATCH_THRESHOLD = 0.72
DB_NAME = "innovaDB"

# --- MONGOOSE PARITY CONNECTIVITY ---
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://darrylmacarandan01_db_user:szKCrJI7G4bTgOTu@backenddb.skb5zqx.mongodb.net/?retryWrites=true&w=majority&appName=backendDB"
)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

supplies_collection = db["supplies"]
services_collection = db["services"]