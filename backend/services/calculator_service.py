from models.user import UserBase

def calculate_bmi(weight: float, height_cm: float) -> dict:
    height_m = height_cm / 100
    bmi = round(weight / (height_m ** 2), 2)
    
    if bmi < 18.5:
        category = "Underweight"
    elif 18.5 <= bmi <= 24.9:
        category = "Normal"
    elif 25.0 <= bmi <= 29.9:
        category = "Overweight"
    else:
        category = "Obese"
        
    return {"bmi": bmi, "category": category}

def calculate_bmr(user: dict) -> float:
    """Uses the Mifflin-St Jeor Equation"""
    # For men: BMR = 10W + 6.25H - 5A + 5
    # For women: BMR = 10W + 6.25H - 5A - 161
    
    weight = user.get("weight", 70.0)
    height = user.get("height", 170.0)
    age = user.get("age", 30)
    gender = user.get("gender", "other")
    
    base_bmr = (10 * weight) + (6.25 * height) - (5 * age)
    
    if gender == "male":
        return round(base_bmr + 5, 2)
    elif gender == "female":
        return round(base_bmr - 161, 2)
    else:
        # Average it out if other
        return round(base_bmr - 78, 2)

def calculate_daily_calories(bmr: float, activity_level: str, goal: str) -> int:
    activity_multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    
    multiplier = activity_multipliers.get(activity_level, 1.2)
    maintenance_calories = bmr * multiplier
    
    if goal == "weight_loss":
        target_calories = maintenance_calories - 500
    elif goal == "weight_gain":
        target_calories = maintenance_calories + 500
    else:
        target_calories = maintenance_calories
        
    return int(round(target_calories, 0))
