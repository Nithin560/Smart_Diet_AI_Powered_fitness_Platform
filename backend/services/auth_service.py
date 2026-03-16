from database.mongodb import db
from models.user import UserCreate, UserInDB
from core.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status
from typing import Optional
from datetime import datetime, timedelta
import random
import string
import smtplib
from email.message import EmailMessage
from core.config import get_settings

async def get_user_by_email(email: str) -> Optional[dict]:
    database = db.db
    if database is None:
        raise HTTPException(status_code=503, detail="Database not ready")
    user = await database.users.find_one({"email": email})
    return user

async def create_user(user: UserCreate) -> dict:
    existing_user = await get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump(exclude={"password"})
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = datetime.utcnow()
    
    database = db.db
    if database is None:
        raise HTTPException(status_code=503, detail="Database not ready")
        
    # Initialize weight history with the starting weight
    user_dict["weight_history"] = [{
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "weight": user.weight
    }]
        
    result = await database.users.insert_one(user_dict)
    
    created_user = await database.users.find_one({"_id": result.inserted_id})
    return created_user

async def authenticate_user(email: str, password: str) -> dict:
    user = await get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

async def reset_user_password(email: str, new_password: str) -> bool:
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    hashed_password = get_password_hash(new_password)
    database = db.db
    
    result = await database.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"hashed_password": hashed_password}}
    )
    return result.modified_count > 0

async def generate_and_store_otp(email: str) -> str:
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    otp_code = ''.join(random.choices(string.digits, k=6))
    otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    database = db.db
    await database.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"otp_code": otp_code, "otp_expires_at": otp_expires_at}}
    )
    
    # SEND ACTUAL EMAIL
    settings = get_settings()
    if settings.SMTP_EMAIL and settings.SMTP_APP_PASSWORD:
        msg = EmailMessage()
        msg['Subject'] = "Your Smart Diet Login OTP"
        msg['From'] = settings.SMTP_EMAIL
        msg['To'] = email
        
        # HTML Email format for a better experience
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px;">
                <h2 style="color: #14b8a6;">Smart Diet App</h2>
                <p>Hello,</p>
                <p>You recently requested to login with an OTP. Here is your code:</p>
                <h1 style="font-size: 36px; letter-spacing: 5px; background: #f1f5f9; display: inline-block; padding: 10px 20px; border-radius: 8px; border: 2px dashed #14b8a6;">{otp_code}</h1>
                <p style="color: #888; font-size: 14px;">This code will expire in 5 minutes. Do not share it with anyone.</p>
                <p>Have a great day!</p>
            </body>
        </html>
        """
        msg.set_content(f"Your OTP is {otp_code}") # Plain text fallback
        msg.add_alternative(html_content, subtype='html')
        
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(settings.SMTP_EMAIL, settings.SMTP_APP_PASSWORD)
                smtp.send_message(msg)
            print(f"OTP email successfully sent to {email}")
        except Exception as e:
            print(f"Failed to send email: {e}")
            raise HTTPException(status_code=500, detail="Failed to deliver OTP via email. Try password login.")
    else:
        # Fallback if no SMTP configured
        print(f"!! MOCK EMAIL - SMTP NOT CONFIGURED !! OTP for {email}: {otp_code}")
    
    return otp_code

async def verify_otp_and_login(email: str, otp_code: str) -> dict:
    user = await get_user_by_email(email)
    if not user:
        return False
        
    # Check if OTP exists and matches
    stored_otp = user.get("otp_code")
    otp_expires_at = user.get("otp_expires_at")
    
    if not stored_otp or stored_otp != otp_code:
        print(f"DEBUG OTP: Mismatch! Stored: '{stored_otp}', Received: '{otp_code}'. Match: {stored_otp == otp_code}")
        return False
        
    if not otp_expires_at or datetime.utcnow() > otp_expires_at:
        print(f"DEBUG OTP: Expired! Expiry: {otp_expires_at}, Current: {datetime.utcnow()}")
        return False
        
    # OTP is valid. Clear it so it can't be reused.
    database = db.db
    await database.users.update_one(
        {"_id": user["_id"]},
        {"$unset": {"otp_code": "", "otp_expires_at": ""}}
    )
    
    return user
