import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Old connection details
OLD_URI = "mongodb+srv://nithinpandu9_db_user:bJPb5iFwDe3rfp0I@cluster0.1ryotkr.mongodb.net/?appName=Cluster0"
OLD_DB_NAME = "smart_diet_db"

# New connection details
NEW_URI = "mongodb+srv://nithinvandana560_db_user:jUnXLUsOAcjQcowi@smartdiet0.wb9iayo.mongodb.net/?retryWrites=true&w=majority&appName=Smartdiet0"
NEW_DB_NAME = "smart_diet_db"

async def migrate():
    print("Connecting to old database...")
    old_client = AsyncIOMotorClient(OLD_URI, serverSelectionTimeoutMS=15000)
    old_db = old_client[OLD_DB_NAME]

    print("Connecting to new database...")
    new_client = AsyncIOMotorClient(NEW_URI, serverSelectionTimeoutMS=15000)
    new_db = new_client[NEW_DB_NAME]

    # Test connections
    try:
        await old_client.admin.command('ping')
        print("✅ Old database connected!")
    except Exception as e:
        print(f"❌ Failed to connect to OLD database: {e}")
        return

    try:
        await new_client.admin.command('ping')
        print("✅ New database connected!")
    except Exception as e:
        print(f"❌ Failed to connect to NEW database: {e}")
        return

    collections = await old_db.list_collection_names()
    print(f"\nCollections to migrate: {collections}")

    for coll_name in collections:
        print(f"\n--- Migrating collection: {coll_name} ---")
        old_coll = old_db[coll_name]
        new_coll = new_db[coll_name]

        # Fetch all documents from old collection
        docs = await old_coll.find({}).to_list(length=None)

        if docs:
            # Clear existing data in new collection
            await new_coll.delete_many({})
            await new_coll.insert_many(docs)
            print(f"✅ Migrated {len(docs)} documents to '{coll_name}'.")
        else:
            print(f"⚠️ Collection '{coll_name}' is empty. Skipping.")

    print("\n✅ DATABASE MIGRATION COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(migrate())
