import sys
import traceback

with open("python_error.log", "w") as f:
    sys.stderr = f
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        print("Success")
    except Exception as e:
        traceback.print_exc(file=f)
