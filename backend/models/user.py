from datetime import datetime
from typing import Optional, Literal, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    age: int = Field(..., gt=0, lt=120)
    gender: Literal["male", "female", "other"]
    height: float = Field(..., gt=0, description="Height in cm")
    weight: float = Field(..., gt=0, description="Weight in kg")
    activity_level: Literal["sedentary", "light", "moderate", "active", "very_active"]
    goal: Literal["weight_loss", "maintain", "weight_gain"]
    role: Literal["user", "admin"] = "user"

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    water_intake: int = 0
    last_water_update: Optional[datetime] = None
    weight_history: List[Dict[str, Any]] = Field(default_factory=list)
    meal_logs: List[Dict[str, Any]] = Field(default_factory=list)
    favorite_meals: List[str] = Field(default_factory=list)

class UserResponse(UserBase):
    id: str
    created_at: datetime
    last_login: Optional[datetime] = None
    water_intake: int = 0
    weight_history: List[Dict[str, Any]] = Field(default_factory=list)
    meal_logs: List[Dict[str, Any]] = Field(default_factory=list)
    favorite_meals: List[str] = Field(default_factory=list)

class UserUpdate(BaseModel):
    weight: Optional[float] = Field(None, gt=0)
    height: Optional[float] = Field(None, gt=0)
    goal: Optional[Literal["weight_loss", "maintain", "weight_gain"]] = None
    activity_level: Optional[Literal["sedentary", "light", "moderate", "active", "very_active"]] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=10)

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
