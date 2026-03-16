def generate_health_tips(bmi_category: str, weather_type: str, goal: str) -> list[str]:
    tips = []
    
    # BMI Base Tips
    if bmi_category == "Underweight":
        tips.append("Focus on nutrient-dense foods like nuts, seeds, and paneer.")
    elif bmi_category == "Overweight" or bmi_category == "Obese":
        tips.append("Prioritize portion control and incorporate at least 30 minutes of daily walking.")
        tips.append("Reduce intake of processed sugars and empty calories.")
    else:
        tips.append("Maintain your current balanced diet to sustain your healthy BMI.")
        
    # Weather Tips
    if weather_type == "hot":
        tips.append("It's hot outside! Drink at least 3-4 liters of water.")
        tips.append("Avoid excessively oily or heavy, spicy foods to keep your body cool.")
    elif weather_type == "cold":
        tips.append("Cold weather can suppress thirst. Remember to stay hydrated!")
        tips.append("Incorporate warm, protein-rich soups to maintain body heat.")
    elif weather_type == "rainy":
        tips.append("Boost your immunity with Vitamin C rich foods during the rainy season.")
        
    # Goal Tips
    if goal == "weight_loss":
        tips.append("Eat a high-protein breakfast to stay full longer and reduce cravings throughout the day.")
    elif goal == "weight_gain":
        tips.append("Snack consistently throughout the day to meet your caloric surplus goals.")
        
    return tips
