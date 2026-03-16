from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from core.config import get_settings

settings = get_settings()


class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


db = Database()


async def connect_to_mongo() -> None:
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db.client = client
    db.db = client[settings.DATABASE_NAME]
    print("Connected to MongoDB")


async def close_mongo_connection() -> None:
    client = db.client
    if client is not None:
        client.close()
        db.client = None
        db.db = None
        print("Closed MongoDB connection")


