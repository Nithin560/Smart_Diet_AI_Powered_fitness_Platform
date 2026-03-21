from services.calculator_service import calculate_bmi, calculate_bmr, calculate_daily_calories
from services.weather_service import get_current_weather
from services.ai_service import get_personalized_meal_insight
from typing import List, Dict, Any, Optional, cast
from database.mongodb import db
import random

def calculate_health_score(target_calories: float, planned_calories: float, target_protein: float, planned_protein: float, weather_type: str) -> dict:
    """
    Calculates a daily health score (0-100) based on calorie/protein alignment and weather.
    """
    score = 50 # Base score
    
    # 1. Calorie Alignment (+/- 20 points)
    # Target range: within 10% of target
    cal_diff_pct = abs(planned_calories - target_calories) / target_calories if target_calories > 0 else 0
    if cal_diff_pct <= 0.1:
        score += 20
    elif cal_diff_pct <= 0.2:
        score += 10
    else:
        score -= min(10, int(cal_diff_pct * 10))
        
    # 2. Protein Balance (+15 points)
    if planned_protein >= target_protein * 0.9:
        score += 15
    elif planned_protein >= target_protein * 0.7:
        score += 7
        
    # 3. Weather Adjustment (+5 points)
    # Heuristic: Hydrating/Warm foods for specific weather
    # In this simplified version, we assume the query filtered correctly, so we award points if weather is known
    if weather_type in ["hot", "cold", "rainy"]:
        score += 5
        
    # 4. Exercise baseline (+10 points) - assuming a baseline for now
    score += 10 
    
    # Clamp score
    final_score = max(0, min(100, score))
    
    return {
        "score": final_score,
        "rating": "Excellent" if final_score >= 85 else "Good" if final_score >= 70 else "Average" if final_score >= 50 else "Poor",
        "description": f"Your plan meets {int((1-cal_diff_pct)*100)}% of your calorie target and {'hits' if planned_protein >= target_protein else 'approaches'} your protein goals."
    }

async def generate_daily_meal_plan(user: dict, city: str = "New York") -> dict:
    # 1. Calculate Health Metrics
    bmi_data = calculate_bmi(user["weight"], user["height"])
    bmr = calculate_bmr(user)
    target_calories = calculate_daily_calories(bmr, user["activity_level"], user["goal"])
    
    # Calculate Daily Protein Target (1.6g per kg of body weight)
    target_protein = float(f"{user.get('weight', 70.0) * 1.6:.1f}")
    
    # 2. Get Weather
    weather = await get_current_weather(city)
    weather_type = weather["type"]
    
    # 3. Attempt Gemini AI Meal Generation (Prioritized)
    from services.ai_service import generate_daily_meal_plan_ai
    ai_meals = await generate_daily_meal_plan_ai(user, weather)

    if ai_meals:
        plan = ai_meals
        total_planned_calories = sum(m.get("calories", 0) for m in plan.values() if m)
        total_planned_protein = sum(m.get("protein", 0.0) for m in plan.values() if m)
    else:
        # Fallback to DB logic if AI fails or is not configured
        query = {"weather_type": {"$in": [weather_type, "all"]}}
        foods_cursor = db.db.foods.find(query)
        all_foods = await foods_cursor.to_list(length=100)
        
        categorized_foods = {"breakfast": [], "lunch": [], "dinner": [], "snack": []}
        for food in all_foods:
            category = food.get("category")
            if category in categorized_foods:
                food["id"] = str(food.pop("_id"))
                categorized_foods[category].append(food)
                
        plan: Dict[str, Any] = {}
        total_planned_calories: int = 0
        total_planned_protein: float = 0.0
        
        for category in ["breakfast", "lunch", "dinner", "snack"]:
            if categorized_foods[category]:
                category_list = cast(List[Dict[str, Any]], list(categorized_foods[category]))
                sorted_by_protein = sorted(category_list, key=lambda x: float(str(x.get("protein", 0))), reverse=True)
                top_choices = cast(List[Dict[str, Any]], sorted_by_protein[0:2])
                selected = cast(Dict[str, Any], random.choice(top_choices))
                plan[category] = selected
                total_planned_calories = int(total_planned_calories) + int(selected.get("calories", 0))
                total_planned_protein = float(total_planned_protein) + float(selected.get("protein", 0.0))
            else:
                plan[category] = None
            
    # 4. Calculate Algorithm Score
    health_score_data = calculate_health_score(
        float(target_calories), 
        float(total_planned_calories), 
        float(target_protein), 
        float(total_planned_protein), 
        str(weather_type)
    )
    
    # 5. Get AI Insight (Quick 2-sentence summary)
    ai_insight = await get_personalized_meal_insight(
        {
            "target_calories": target_calories,
            "target_protein": target_protein,
            "bmi_category": bmi_data["category"]
        },
        weather,
        [m for m in plan.values() if m]
    )
            
    return {
        "user_metrics": {
            "bmi": bmi_data["bmi"],
            "bmi_category": bmi_data["category"],
            "bmr": bmr,
            "target_calories": target_calories,
            "target_protein": target_protein
        },
        "weather": weather,
        "total_planned_calories": total_planned_calories,
        "total_planned_protein": float(f"{total_planned_protein:.1f}"),
        "health_score": health_score_data,
        "ai_insight": ai_insight,
        "meals": plan
    }
