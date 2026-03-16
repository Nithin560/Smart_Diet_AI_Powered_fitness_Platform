from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.ai_service import chat_with_ai
from core.deps import get_current_user
from typing import List, Optional

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

@router.post("/chat")
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Endpoint for the AI Health Assistant.
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    response = await chat_with_ai(request.message, request.history)
    return {"message": response}
