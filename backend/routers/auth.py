from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas.user import UserCreate, UserResponse
from utils.security import hash_password, verify_password, create_token
from utils.auth_deps import get_current_user, require_admin, require_manager
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


router = APIRouter(prefix="/auth", tags=["Auth"])
ADMIN_REGISTER_PASSWORD = os.getenv("ADMIN_REGISTER_PASSWORD", os.getenv("ADMIN_PASSWORD", "jadeglobal123"))
VALID_ROLES = {"admin", "manager", "employee"}


class LoginRequest(BaseModel):
    email: str
    password: str


class AdminRegisterRequest(UserCreate):
    admin_password: str


# register
@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: AdminRegisterRequest, db: Session = Depends(get_db)):
    if user_data.role != "admin":
        raise HTTPException(status_code=403, detail="Public registration is only for admins")
    if user_data.admin_password != ADMIN_REGISTER_PASSWORD:
        raise HTTPException(status_code=403, detail="Invalid admin registration password")

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/users", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    return db.query(User).all()


@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    if user_data.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



# login
@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):

    #Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check password
    if not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    #Create token with user info inside
    token = create_token({"user_id": user.id, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role
    }
    
    
    
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user





