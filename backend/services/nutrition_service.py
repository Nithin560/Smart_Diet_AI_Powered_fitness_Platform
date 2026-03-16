import os
import httpx
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# External Nutrition API details (Edamam example)
# To activate, user needs to add these to .env:
# EDAMAM_APP_ID="your_id"
# EDAMAM_APP_KEY="your_key"

EDAMAM_APP_ID = os.getenv("EDAMAM_APP_ID", "")
EDAMAM_APP_KEY = os.getenv("EDAMAM_APP_KEY", "")

async def get_nutrition_data(food_name: str) -> Optional[Dict]:
    """
    Fetches real nutrition data from Edamam API.
    If API keys are missing, returns None for fallback logic.
    """
    if not EDAMAM_APP_ID or not EDAMAM_APP_KEY:
        logger.warning("Edamam API keys missing. Skipping external nutrition lookup.")
        return None

    try:
        url = "https://api.edamam.com/api/food-database/v2/parser"
        params = {
            "app_id": EDAMAM_APP_ID,
            "app_key": EDAMAM_APP_KEY,
            "ingr": food_name
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "parsed" in data and data["parsed"]:
                food = data["parsed"][0]["food"]
                nutrients = food.get("nutrients", {})
                return {
                    "calories": int(nutrients.get("ENERC_KCAL", 0)),
                    "protein": int(nutrients.get("PROCNT", 0)),
                    "fat": int(nutrients.get("FAT", 0)),
                    "carbs": int(nutrients.get("CHOCDF", 0)),
                    "fiber": int(nutrients.get("FIBTG", 0))
                }
            return None
    except Exception as e:
        logger.error(f"Error fetching nutrition for {food_name}: {str(e)}")
        return None

async def validate_meal_macros(meal: Dict) -> Dict:
    """
    Updates a meal dictionary with verified data from Edamam if available.
    """
    verified = await get_nutrition_data(meal.get("name", ""))
    if verified:
        # We blend the AI's estimate with the verified data if the verified data is reliable
        # For now, we prefer verified data for macros if it exists
        meal["calories"] = verified["calories"]
        meal["protein"] = verified["protein"]
        meal["carbs"] = verified["carbs"]
        meal["fat"] = verified["fat"]
        if "benefits" not in meal:
            meal["benefits"] = []
        if verified.get("fiber") and verified["fiber"] > 2:
            meal["benefits"].append(f"High in Fiber ({verified['fiber']}g)")
            
    return meal
