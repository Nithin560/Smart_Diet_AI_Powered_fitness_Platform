from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models.user import UserCreate, UserResponse, PasswordResetRequest, OTPRequest, OTPVerifyRequest
from services.auth_service import create_user, authenticate_user, reset_user_password, generate_and_store_otp, verify_otp_and_login
from core.security import create_access_token
from typing import Any

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate) -> Any:
    """
    Register a new user.
    """
    user = await create_user(user_in)
    # Map _id to id for UserResponse
    user["id"] = str(user["_id"])
    return user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = await authenticate_user(email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    
    # Update last_login
    from database.mongodb import db
    from datetime import datetime
    await db.db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: PasswordResetRequest) -> Any:
    """
    Reset user password using email.
    """
    success = await reset_user_password(request.email, request.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset failed. Please try again."
        )
    return {"message": "Password successfully reset."}

@router.post("/send-otp", status_code=status.HTTP_200_OK)
async def send_otp(request: OTPRequest) -> Any:
    """
    Generate an OTP and send it to the user's email.
    """
    # This will raise a 404 if the user doesn't exist.
    await generate_and_store_otp(request.email)
    return {"message": "OTP has been sent to your email."}

@router.post("/verify-otp", status_code=status.HTTP_200_OK)
async def verify_otp(request: OTPVerifyRequest) -> Any:
    """
    Verify the given OTP and log the user in, returning an access token.
    """
    user = await verify_otp_and_login(request.email, request.otp_code)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP."
        )
        
    # Update last_login
    from database.mongodb import db
    from datetime import datetime
    await db.db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}
