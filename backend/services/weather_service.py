import httpx
from core.config import get_settings

settings = get_settings()

async def get_current_weather(city: str = "New York") -> dict:
    """
    Fetch weather data from OpenWeatherMap API for a given city.
    """
    if not settings.OPENWEATHER_API_KEY:
        # Fallback for development if no key is provided
        return {
            "temperature": 25.0,
            "condition": "sunny",
            "type": "hot", 
            "city": city
        }

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        
        if response.status_code != 200:
            # Fallback on error
            return {
                "temperature": 25.0,
                "condition": "unknown",
                "type": "all",
                "city": city
            }
            
        data = response.json()
        temp = data["main"]["temp"]
        condition = data["weather"][0]["main"].lower()
        
        # Determine weather type for food recommendations
        weather_type = "all"
        if temp < 20:
            weather_type = "cold"
        elif temp >= 30:
            weather_type = "hot"
            
        if "rain" in condition or "drizzle" in condition or "thunderstorm" in condition:
             weather_type = "rainy"
             
        return {
            "temperature": temp,
            "condition": condition,
            "type": weather_type,
            "city": city
        }
