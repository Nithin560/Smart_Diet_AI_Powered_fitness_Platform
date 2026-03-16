import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys

async def get_admin():
    uri = 'mongodb+srv://nithinpandu9_db_user:bJPb5iFwDe3rfp0I@cluster0.1ryotkr.mongodb.net/?appName=Cluster0'
    client = AsyncIOMotorClient(uri)
    db = client['smart_diet_db']
    admin = await db.users.find_one({'role': 'admin'})
    if admin:
        print(f"ADMIN_EMAIL: {admin.get('email')}")
    else:
        print('ADMIN_EMAIL: NONE')
    
if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(get_admin())
