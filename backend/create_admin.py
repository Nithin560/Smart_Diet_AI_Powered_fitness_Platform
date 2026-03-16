import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv
from core.security import get_password_hash
from datetime import datetime

async def setup_admin():
    load_dotenv()
    uri = str(os.getenv('MONGODB_URI'))
    db_name = str(os.getenv('DATABASE_NAME'))
    
    if uri == "None" or db_name == "None":
        raise ValueError("MongoDB variables are not set in .env")
    
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client[db_name]
    
    admin_email = "nithinvandana560@gmail.com"
    admin_password = "9347388372pandu@"
    
    # Check if admin already exists
    existing_admin = await db["users"].find_one({"email": admin_email})
    
    if existing_admin:
        # Update existing to be an admin
        await db["users"].update_one(
            {"email": admin_email},
            {"$set": {"role": "admin"}}
        )
        print(f"Updated existing user {admin_email} to have the 'admin' role.")
    else:
        # Create a new admin user
        admin_user = {
            "name": "Super Admin",
            "email": admin_email,
            "age": 30,
            "gender": "other",
            "height": 170.0,
            "weight": 70.0,
            "activity_level": "moderate",
            "goal": "maintain",
            "role": "admin",
            "hashed_password": get_password_hash(admin_password),
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(admin_user)
        print(f"Created new admin user {admin_email}.")

if __name__ == "__main__":
    asyncio.run(setup_admin())
