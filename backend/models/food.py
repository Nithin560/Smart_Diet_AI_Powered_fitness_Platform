from typing import Optional, Literal
from pydantic import BaseModel, Field

class FoodBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    calories: int = Field(..., gt=0)
    protein: float = Field(..., ge=0)
    carbs: float = Field(..., ge=0)
    fat: float = Field(..., ge=0)
    category: Literal["breakfast", "lunch", "dinner", "snack"]
    weather_type: Literal["hot", "cold", "rainy", "all"]
    diet_type: Optional[str] = None

class FoodCreate(FoodBase):
    pass

class FoodInDB(FoodBase):
    id: str = Field(alias="_id")

class FoodResponse(FoodBase):
    id: str
