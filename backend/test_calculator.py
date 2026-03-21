
import sys
import os

# Add the backend directory to sys.path to allow imports
sys.path.append(os.path.abspath('c:/Users/nithi/OneDrive/Desktop/Smart_Food_Diet_System/backend'))

try:
    from services.calculator_service import calculate_bmi
    
    # Test case for the gap between 24.9 and 25.0
    result1 = calculate_bmi(70, 167.5) # BMI approx 24.94
    print(f"BMI 24.94: {result1}")
    
    # Test case for the gap between 29.9 and 30.0
    result2 = calculate_bmi(85, 168.3) # BMI approx 29.98
    print(f"BMI 29.98: {result2}")

except Exception as e:
    print(f"Error: {e}")
