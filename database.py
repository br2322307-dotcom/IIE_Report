import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(mongo_uri)

db = client["woco_db"]

workers_collection = db["workers"]
contractors_collection = db["contractors"]
otp_collection = db["otps"]
jobs_collection = db["jobs"]
applications_collection = db["applications"]
messages_collection = db["messages"]