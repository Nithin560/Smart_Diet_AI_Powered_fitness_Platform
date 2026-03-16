import asyncio
import os
from dotenv import load_dotenv
import motor.motor_asyncio

async def check():
    load_dotenv()
    uri = str(os.getenv('MONGODB_URI'))
    db_name = str(os.getenv('DATABASE_NAME'))
    
    if uri == "None" or db_name == "None":
        raise ValueError("MongoDB variables are not set in .env")
    
    print(f"Connecting to URI: {uri[:30]}...")
    print(f"Database: {db_name}")
    
    client = motor.motor_asyncio.AsyncIOMotorClient(uri)
    db = client[db_name]
    
    try:
        count = await db["users"].count_documents({})
        users = await db["users"].find().to_list(10)
        
        print('\n--- DATABASE CHECK ---')
        print(f'Total Users in DB: {count}')
        if count > 0:
            print('Recent Users:')
            for u in users:
                print(f' - {u.get("name")} ({u.get("email")})')
        print('----------------------\n')
    except Exception as e:
        print(f"Error querying DB: {e}")

if __name__ == "__main__":
    asyncio.run(check())
