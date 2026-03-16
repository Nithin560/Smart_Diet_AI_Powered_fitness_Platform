from fastapi import APIRouter, Depends, Query
from core.deps import get_current_user
from services.weather_service import get_current_weather

router = APIRouter()

@router.get("/")
async def get_weather(
    city: str = Query("New York", description="City to fetch weather for"),
    current_user: dict = Depends(get_current_user)
):
    """Fetch current weather constraints based on user location preference."""
    weather = await get_current_weather(city)
    return weather
