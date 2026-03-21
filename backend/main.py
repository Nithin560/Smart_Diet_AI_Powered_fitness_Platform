from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.mongodb import connect_to_mongo, close_mongo_connection
from routers import auth, user, weather, recommendations, health_tips, ai

app = FastAPI(title="Smart Diet & Weather-Based Recommendation API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smartDietPlatform.com", "http://localhost:5173"], # Production domain and local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(user.router, prefix="/api/users", tags=["users"])
app.include_router(weather.router, prefix="/api/weather", tags=["weather"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(health_tips.router, prefix="/api/health-tips", tags=["health-tips"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Welcome to Smart Diet & Weather-Based Recommendation API"}
