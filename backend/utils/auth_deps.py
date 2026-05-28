# from fastapi import Depends, HTTPException
# from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy.orm import Session
# from database import get_db
# from models import User
# from utils.security import decode_token


# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# logged in
# def get_current_user(
#     token:str = Depends(oauth2_scheme),
#     db: Session = Depends(get_db)
# )->User:
#     payload = decode_token(token)
#     if payload is None:
#         raise HTTPException(status_code=401,detail="Invalid or expired token")
    
#     user_id = payload.get("user_id")
#     user = db.query(User).filter(User.id == user_id).first()
#     if user is None:
#         raise HTTPException(status_code=401, detail="User not found")
#     return user


# admin
# def require_admin(current_user: User = Depends(get_current_user)) -> User:
#     if current_user.role != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
#     return current_user

# admin or manager 
# def require_manager(current_user: User = Depends(get_current_user)) -> User:
#     if current_user.role not in ["admin", "manager"]:
#         raise HTTPException(status_code=403, detail="Manager access required")
#     return current_user



from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User
from utils.security import decode_token

# Use HTTPBearer instead of OAuth2PasswordBearer
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# only for admin 
def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# admin or manager
def require_manager(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Manager access required")
    return current_user