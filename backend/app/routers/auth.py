from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.notification import AuditLog
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserPreferencesUpdate, TokenResponse
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

DEMO_ACCOUNTS_INFO = [
    {
        "role": "farmer",
        "email": "ramesh.farmer@krishidirect.in",
        "password": "Password123!",
        "name": "Ramesh Patel (Farmer)",
        "location": "Warangal, Telangana",
        "crops": "Tomatoes, Rice, Green Chillies"
    },
    {
        "role": "buyer",
        "email": "priya.buyer@krishidirect.in",
        "password": "Password123!",
        "name": "Priya Sharma (Retail Buyer)",
        "location": "Hyderabad, Telangana",
        "type": "Supermarket Sourcing Manager"
    },
    {
        "role": "agent",
        "email": "suresh.agent@krishidirect.in",
        "password": "Password123!",
        "name": "Suresh Rao (Village Agent)",
        "location": "Jangaon Cluster",
        "focus": "Farmer Onboarding & Harvest Pooling"
    },
    {
        "role": "transporter",
        "email": "vikram.transporter@krishidirect.in",
        "password": "Password123!",
        "name": "Vikram Logistics (Transporter)",
        "location": "Warangal-Hyderabad Corridor",
        "fleet": "Electric 3-Ton & 5-Ton Cargo"
    },
    {
        "role": "admin",
        "email": "admin@krishidirect.in",
        "password": "AdminPassword123!",
        "name": "Platform Administrator",
        "location": "Central Operations",
        "access": "Full System Governance"
    }
]

@router.get("/demo-accounts")
def get_demo_accounts():
    """Returns the pre-configured demo credentials for convenient prototype evaluation"""
    return DEMO_ACCOUNTS_INFO

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    clean_email = user_in.email.lower().strip()
    
    # Restrict permitted self-registration roles (admin cannot be self-registered)
    allowed_roles = ["farmer", "buyer", "agent", "transporter"]
    if user_in.role == "admin" or user_in.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Administrator accounts cannot be self-registered. Permitted roles: {', '.join(allowed_roles)}.",
        )
    
    existing = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead.",
        )
    
    hashed_pwd = hash_password(user_in.password)
    user = User(
        full_name=user_in.full_name.strip(),
        email=clean_email,
        hashed_password=hashed_pwd,
        role=user_in.role,
        phone=user_in.phone.strip() if user_in.phone else None,
        village=user_in.village.strip() if user_in.village else None,
        district=user_in.district.strip() if user_in.district else None,
        state=user_in.state or "Telangana",
        preferred_lang=user_in.preferred_lang or "en",
        speech_lang=user_in.speech_lang or "en-IN",
        voice_lang=user_in.voice_lang or "en-IN"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=user)

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin, db: Session = Depends(get_db)):
    clean_email = creds.email.lower().strip()
    user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials and try again.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently deactivated. Please contact platform support.",
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(access_token=token, user=user)

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/preferences", response_model=UserResponse)
def update_preferences(
    prefs: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if prefs.preferred_lang:
        current_user.preferred_lang = prefs.preferred_lang
    if prefs.speech_lang:
        current_user.speech_lang = prefs.speech_lang
    if prefs.voice_lang:
        current_user.voice_lang = prefs.voice_lang
    
    db.commit()
    db.refresh(current_user)
    return current_user
