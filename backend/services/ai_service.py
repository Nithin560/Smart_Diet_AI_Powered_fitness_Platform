import google.generativeai as genai
from core.config import get_settings
import json
import logging
from services.nutrition_service import validate_meal_macros

settings = get_settings()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

async def get_ai_recommendation(prompt: str) -> str:
    """
    General purpose AI response for health/diet queries.
    """
    if not model:
        return "AI Service is currently in offline mode. (Please provide a GEMINI_API_KEY in .env to enable full AI features)"
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"AI Error: {e}")
        return "The AI is feeling a bit shy right now. Please try again in a moment."

async def get_personalized_meal_insight(user_metrics: dict, weather: dict, current_meals: list) -> str:
    """
    Generates a personalized insight about the target meal plan.
    """
    if not model:
        return f"Based on the {weather['type']} weather, these meals provide a balanced intake of {user_metrics['target_protein']}g protein."

    prompt = f"""
    You are a professional nutritionist. 
    User Metrics: {json.dumps(user_metrics)}
    Current Weather: {json.dumps(weather)}
    Planned Meals: {json.dumps(current_meals)}
    
    Provide a short (2-sentence max), encouraging insight on why this meal plan is great for today's weather and the user's goals.
    Be punchy and professional.
    """
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except:
        return "This meal plan is perfectly balanced to hit your macros while keeping you energized for the day."

async def generate_unique_meal_plan(user: dict, weather: dict) -> dict:
    """
    Generates a 100% unique, structured daily meal plan using Gemini.
    Incorporates user traits and a dynamic seed to ensure 1000+ users get different results.
    """
    if not model:
        return None # Fallback to static DB logic in recommendation service

    # Extract user traits
    traits = {
        "name": user.get("username", "Guest"),
        "goal": user.get("goal"),
        "weight": user.get("weight"),
        "height": user.get("height"),
        "age": user.get("age"),
        "activity": user.get("activity_level"),
        "gender": user.get("gender")
    }

    import time
    seed = time.time()
    
    prompt = f"""
    You are an expert personalized nutritionist. 
    Current Time (Seed for uniqueness): {seed}
    Task: Generate a UNIQUE daily meal plan for a user with these traits: {json.dumps(traits)}
    Current Weather: {json.dumps(weather)}
    
    CRITICAL: 
    1. Every meal must be hyper-personalized and unique. Do not repeat meals across different requests.
    2. Use COMMON, FAMILIAR, and CULTURALLY RELEVANT meal names (e.g., focus on Indian/local style names like 'Paneer Rice', 'Dal Tadka', 'Chicken Curry' rather than foreign/exotic names like 'Quinoa Bowl' or 'Kale Smoothie').
    3. Provide 4 meals: Breakfast, Lunch, Dinner, Snack.
    4. For each meal, provide exactly these fields (lowercased keys): 
       name, description, benefits (list), ingredients (list), calories (int), protein (int), carbs (int), fat (int).
    5. Ensure the total calories align with a {traits['goal']} goal based on BMR/BMI principles.
    6. Ensure high diversity in ingredients and cooking styles while maps to common dishes.
    
    Response Format (Strict JSON only, no markdown markers like ```json):
    {{
      "breakfast": {{"name": "...", "description": "...", "benefits": [], "ingredients": [], "calories": 0, "protein": 0, "carbs": 0, "fat": 0}},
      "lunch": {{...}},
      "dinner": {{...}},
      "snack": {{...}}
    }}
    """

    try:
        response = await model.generate_content_async(prompt)
        # Clean the response to ensure it's valid JSON
        text = response.text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        return json.loads(text)
    except Exception as e:
        print(f"Gemini Meal Generation Error: {e}")
        return None

async def chat_with_ai(user_query: str, chat_history: list = None) -> str:
    """
    Conversational AI for the Health Chatbot.
    """
    if not model:
        return "I am the SmartDiet Offline Assistant. I can help with basic navigation, but for deep nutritional insights, please enable the Gemini AI integration."

    # Preparing context
    system_instruction = "You are a helpful, encouraging health and diet assistant for the SmartDiet system. Keep answers concise, medically safe, and nutritional-focused."
    
    try:
        # Simple implementation for now
        response = await model.generate_content_async(f"{system_instruction}\n\nUser: {user_query}")
        return response.text
    except Exception as e:
        print(f"Chat AI Error: {e}")
        return "I'm having trouble connecting to my brain. Let's try that again?"
