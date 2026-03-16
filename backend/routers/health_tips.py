from fastapi import APIRouter, Depends, Query
from core.deps import get_current_user
from services.calculator_service import calculate_bmi
from services.weather_service import get_current_weather
from services.health_tips_service import generate_health_tips

router = APIRouter()

@router.get("/")
async def get_health_tips(
    city: str = Query("New York", description="City to fetch weather for"),
    current_user: dict = Depends(get_current_user)
):
    """Generate personalized health tips based on BMI, weather, and goals."""
    
    bmi_data = calculate_bmi(current_user["weight"], current_user["height"])
    weather = await get_current_weather(city)
    
    tips = generate_health_tips(
        bmi_category=bmi_data["category"],
        weather_type=weather["type"],
        goal=current_user["goal"]
    )
    
    return {"tips": tips}
