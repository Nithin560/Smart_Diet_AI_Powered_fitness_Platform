from fastapi import APIRouter, Depends, Query
from core.deps import get_current_user
from services.recommendation_service import generate_daily_meal_plan

router = APIRouter()

@router.get("/meal-plan")
async def get_meal_plan(
    city: str = Query("New York", description="City to fetch weather for"),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve a full day's meal plan factoring in user's BMI, current weather, and goals."""
    
    plan = await generate_daily_meal_plan(current_user, city)
    return plan
