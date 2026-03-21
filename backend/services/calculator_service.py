
def calculate_bmi(weight: float, height_cm: float) -> dict:
    height_m = height_cm / 100
    bmi = float(f"{weight / (height_m ** 2):.2f}")
    
    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"
        
    return {"bmi": bmi, "category": category}

def calculate_bmr(user: dict) -> float:
    """Uses the Mifflin-St Jeor Equation"""
    # For men: BMR = 10W + 6.25H - 5A + 5
    # For women: BMR = 10W + 6.25H - 5A - 161
    
    weight = user.get("weight") or 70.0
    height = user.get("height") or 170.0
    age = user.get("age") or 30
    gender = (user.get("gender") or "other").lower()
    
    base_bmr = (10 * float(weight)) + (6.25 * float(height)) - (5 * int(age))
    
    if gender == "male":
        return float(f"{base_bmr + 5:.2f}")
    elif gender == "female":
        return float(f"{base_bmr - 161:.2f}")
    else:
        # Average it out if other
        return float(f"{base_bmr - 78:.2f}")

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
        
    return int(float(f"{target_calories:.0f}"))
