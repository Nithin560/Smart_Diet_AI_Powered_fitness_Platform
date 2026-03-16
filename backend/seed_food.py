import asyncio
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import get_settings

settings = get_settings()

sample_foods = [
    # ---- HOT WEATHER (Refreshing/Cool Foods) ----
    {
        "name": "High-Protein Greek Yogurt Parfait",
        "calories": 320,
        "protein": 24.0,
        "carbs": 35.0,
        "fat": 8.0,
        "category": "breakfast",
        "weather_type": "hot", 
        "diet_type": "high_protein"
    },
    {
        "name": "Cold Quinoa & Lemon Chicken Salad",
        "calories": 420,
        "protein": 38.0,
        "carbs": 40.0,
        "fat": 12.0,
        "category": "lunch",
        "weather_type": "hot",
        "diet_type": "high_protein"
    },
    {
        "name": "Cold Tofu & Edamame Poke Bowl",
        "calories": 450,
        "protein": 32.0,
        "carbs": 45.0,
        "fat": 15.0,
        "category": "dinner",
        "weather_type": "hot",
        "diet_type": "high_protein"
    },
    {
        "name": "Chilled Cucumber Mint Protein Smoothie",
        "calories": 180,
        "protein": 22.0,
        "carbs": 15.0,
        "fat": 3.0,
        "category": "snack",
        "weather_type": "hot",
        "diet_type": "high_protein"
    },

    # ---- COLD WEATHER (Warming/Hot Foods) ----
    {
        "name": "Warm Spiced Protein Oatmeal",
        "calories": 350,
        "protein": 26.0,
        "carbs": 48.0,
        "fat": 6.0,
        "category": "breakfast",
        "weather_type": "cold",
        "diet_type": "high_protein"
    },
    {
        "name": "Spicy Lentil & Bone Broth Soup",
        "calories": 380,
        "protein": 35.0,
        "carbs": 42.0,
        "fat": 8.0,
        "category": "lunch",
        "weather_type": "cold",
        "diet_type": "high_protein"
    },
    {
        "name": "Grilled Chicken & Warm Brown Rice",
        "calories": 520,
        "protein": 54.0,
        "carbs": 50.0,
        "fat": 11.0,
        "category": "dinner",
        "weather_type": "cold",
        "diet_type": "high_protein"
    },
    {
        "name": "Warm Spiced Almond Protein Milk",
        "calories": 210,
        "protein": 20.0,
        "carbs": 12.0,
        "fat": 9.0,
        "category": "snack",
        "weather_type": "cold",
        "diet_type": "high_protein"
    },

    # ---- RAINY/ALL WEATHER (Versatile High Protein) ----
    {
        "name": "Scrambled Eggs & Whole-Wheat Toast",
        "calories": 380,
        "protein": 22.0,
        "carbs": 30.0,
        "fat": 18.0,
        "category": "breakfast",
        "weather_type": "all",
        "diet_type": "high_protein"
    },
    {
        "name": "Tuna Whole-Wheat Wrap",
        "calories": 420,
        "protein": 36.0,
        "carbs": 38.0,
        "fat": 10.0,
        "category": "lunch",
        "weather_type": "all",
        "diet_type": "high_protein"
    },
    {
        "name": "Paneer & Pea Curry with Roti",
        "calories": 480,
        "protein": 28.0,
        "carbs": 42.0,
        "fat": 20.0,
        "category": "dinner",
        "weather_type": "all",
        "diet_type": "high_protein"
    },
    {
        "name": "Roasted Chana & Boiled Eggs",
        "calories": 250,
        "protein": 18.0,
        "carbs": 22.0,
        "fat": 10.0,
        "category": "snack",
        "weather_type": "all",
        "diet_type": "high_protein"
    }
]

async def seed_db():
    print("Connecting to MongoDB...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]
    
    collection = db.foods
    
    # Always clear the database to update with new seeded payload
    print(f"Clearing food database...")
    await collection.delete_many({})
    print("Database cleared.")
        
    print(f"Seeding {len(sample_foods)} food items...")
    result = await collection.insert_many(sample_foods)
    
    print(f"Successfully inserted {len(result.inserted_ids)} food items.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_db())
