from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class RoleOut(BaseModel):
    id: int
    role_name: str
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role_name: str = Field(..., description="Role name: 'Administrator', 'Security Analyst', or 'SOC Manager'")

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)

class UserOut(UserBase):
    id: int
    is_active: bool
    role_id: int
    role: Optional[RoleOut] = None
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRoleUpdate(BaseModel):
    role_name: str

class UserStatusUpdate(BaseModel):
    is_active: bool

