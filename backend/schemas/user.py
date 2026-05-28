from pydantic import BaseModel


# created schema
class UserCreate(BaseModel):
    name: str
    email: str
    password: str        
    role: str

# response schema
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

# converts ORM object into JSON automatically
    class Config:
        from_attributes = True   