from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from core.config import get_settings

settings = get_settings()


class Database:
    def __init__(self):
        self._client: Optional[AsyncIOMotorClient] = None
        self._db: Optional[AsyncIOMotorDatabase] = None

    @property
    def client(self) -> AsyncIOMotorClient:
        if self._client is None:
            raise RuntimeError("Database client not initialized.")
        return self._client

    @client.setter
    def client(self, value: Optional[AsyncIOMotorClient]):
        self._client = value

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            raise RuntimeError("Database not initialized.")
        return self._db

    @db.setter
    def db(self, value: Optional[AsyncIOMotorDatabase]):
        self._db = value


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


