import os
from dotenv import load_dotenv

# Try root .env
load_dotenv()
root_key = os.getenv("GEMINI_API_KEY")

# Try backend .env
load_dotenv("backend/.env")
backend_key = os.getenv("GEMINI_API_KEY")

print(f"Root GEMINI_API_KEY: {root_key}")
print(f"Backend GEMINI_API_KEY: {backend_key}")
