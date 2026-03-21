from datetime import datetime
from typing import Optional, Literal, Dict, Any, List, cast
from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserResponse, UserBase, UserUpdate
from core.deps import get_current_user
from database.mongodb import db
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user details."""
    res_user = {**current_user}
    res_user["id"] = str(res_user["_id"])
    return res_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(user_in: UserUpdate, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Update current user profile metrics."""
    update_data = user_in.model_dump(exclude_unset=True)
    if not update_data:
        res_user = {**current_user}
        res_user["id"] = str(res_user["_id"])
        return res_user
        
    database = db.db
    if database is None:
        raise HTTPException(status_code=503, detail="Database not ready")

    # If weight is updated, append to history
    update_query = {"$set": update_data}
    if "weight" in update_data and update_data["weight"] != current_user.get("weight"):
        from datetime import datetime
        new_weight = update_data["weight"]
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        
        # We push to weight_history array
        history_entry = {"date": today_str, "weight": new_weight}
        update_query["$push"] = {"weight_history": history_entry}

    await database["users"].update_one(
        {"_id": current_user["_id"]},
        update_query
    )
    
    updated_user = await database["users"].find_one({"_id": current_user["_id"]})
    # Defensive cast to Dict[str, Any] to avoid union/Never issues in linter
    res_user = cast(Dict[str, Any], {**updated_user} if updated_user else {})
    if not res_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    res_user["id"] = str(res_user["_id"])
    return res_user

from pydantic import BaseModel
class WaterUpdate(BaseModel):
    water_intake: int

@router.post("/me/water", response_model=UserResponse)
async def update_user_water(water_in: WaterUpdate, current_user: dict = Depends(get_current_user)):
    """Update daily water intake."""
    database = db.db
    from datetime import datetime
    
    await database["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "water_intake": water_in.water_intake,
            "last_water_update": datetime.utcnow()
        }}
    )
    updated_user = await database["users"].find_one({"_id": current_user["_id"]})
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found after water update")
    
    res_user = dict(updated_user) if updated_user else {}
    res_user["id"] = str(res_user["_id"])
    return res_user

class MealLogIn(BaseModel):
    meal_type: Literal["breakfast", "lunch", "dinner", "snack"]
    name: str
    calories: int
    protein: int
    carbs: int
    fat: int

@router.post("/me/meals", response_model=UserResponse)
async def log_user_meal(meal_in: MealLogIn, current_user: dict = Depends(get_current_user)):
    """Log a meal to the user's daily record."""
    database = db.db
    from datetime import datetime
    
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    meal_entry = meal_in.model_dump()
    meal_entry["date"] = today_str
    meal_entry["timestamp"] = datetime.utcnow()
    
    await database["users"].update_one(
        {"_id": current_user["_id"]},
        {"$push": {"meal_logs": meal_entry}}
    )
    updated_user = await database["users"].find_one({"_id": current_user["_id"]})
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found after meal log")
    
    res_user = dict(updated_user) if updated_user else {}
    res_user["id"] = str(res_user["_id"])
    return res_user

@router.delete("/me/meals/today", response_model=UserResponse)
async def reset_today_meals(current_user: dict = Depends(get_current_user)):
    """Reset all meal logs for the current date."""
    database = db.db
    from datetime import datetime
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    await database["users"].update_one(
        {"_id": current_user["_id"]},
        {"$pull": {"meal_logs": {"date": today_str}}}
    )
    updated_user = await database["users"].find_one({"_id": current_user["_id"]})
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found after meal reset")
    
    res_user = dict(updated_user) if updated_user else {}
    res_user["id"] = str(res_user["_id"])
    return res_user

class FavoriteMealToggle(BaseModel):
    meal_name: str

@router.post("/me/favorites", response_model=UserResponse)
async def toggle_favorite_meal(fav_in: FavoriteMealToggle, current_user: dict = Depends(get_current_user)):
    """Toggle a meal in the user's favorites list."""
    database = db.db
    
    current_favorites = current_user.get("favorite_meals", [])
    if fav_in.meal_name in current_favorites:
        update_op = {"$pull": {"favorite_meals": fav_in.meal_name}}
    else:
        update_op = {"$push": {"favorite_meals": fav_in.meal_name}}
        
    await database["users"].update_one(
        {"_id": current_user["_id"]},
        update_op
    )
    updated_user = await database["users"].find_one({"_id": current_user["_id"]})
    if updated_user is None:
        raise HTTPException(status_code=404, detail="User not found after favorites toggle")
    
    res_user: Dict[str, Any] = {**updated_user}
    res_user["id"] = str(res_user["_id"])
    return res_user

@router.get("/", response_model=list[UserResponse])
async def read_all_users(current_user: dict = Depends(get_current_user)):
    """Get all users (Admin only)."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    database = db.db
    if database is None:
        raise HTTPException(status_code=503, detail="Database not ready")

    users_cursor = database["users"].find()
    users = await users_cursor.to_list(length=1000)
    
    # map _id to id and ensure legacy fields exist
    from datetime import datetime
    for user in users:
        user["id"] = str(user["_id"])
        if "created_at" not in user:
            user["created_at"] = datetime.utcnow()
        if "role" not in user:
            user["role"] = "user"
            
        # Ensure last_login exists in response, default to created_at if missing
        if "last_login" not in user:
            user["last_login"] = user.get("created_at", datetime.utcnow())
        
    return users

@router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get advanced analytics for the Admin Dashboard."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    database = db.db
    if database is None:
        raise HTTPException(status_code=503, detail="Database not ready")

    users_cursor = database["users"].find()
    users = await users_cursor.to_list(length=1000)
    
    total_users = len(users)
    if total_users == 0:
        return {"total_users": 0, "avg_bmi": 0, "goal_distribution": []}

    # Calculate average BMI
    total_bmi: float = 0.0
    valid_bmi_count: int = 0
    goal_counts = {"weight_loss": 0, "maintain": 0, "weight_gain": 0}

    user_list = cast(List[Dict[str, Any]], list(users))
    for u in user_list:
        # BMI Calculation
        height_m = float(u.get("height", 0)) / 100.0
        weight_kg = float(u.get("weight", 0))
        if height_m > 0 and weight_kg > 0:
            bmi_val = float(weight_kg) / (float(height_m) * float(height_m))
            total_bmi = float(total_bmi) + float(bmi_val)
            valid_bmi_count = int(valid_bmi_count) + 1
            
        # Goal Distribution
        goal_val = str(u.get("goal") or "maintain")
        if goal_val in goal_counts:
            # Use explicit cast to avoid 'dict[str, int]' indexing issues
            dc = cast(Dict[str, int], goal_counts)
            dc[goal_val] = int(dc[goal_val]) + 1

    avg_bmi = float(f"{(float(total_bmi) / float(valid_bmi_count)) if int(valid_bmi_count) > 0 else 0.0:.1f}")
    
    goal_distribution = [
        {"name": "Weight Loss", "value": goal_counts["weight_loss"]},
        {"name": "Maintain", "value": goal_counts["maintain"]},
        {"name": "Weight Gain", "value": goal_counts["weight_gain"]}
    ]

    return {
        "total_users": total_users,
        "avg_bmi": avg_bmi,
        "goal_distribution": goal_distribution
    }

@router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a user account (Admin only)."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    database = db.db
    if database is None:
        raise HTTPException(status_code=503, detail="Database not ready")

    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    if str(current_user["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    result = await database["users"].delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted successfully"}
