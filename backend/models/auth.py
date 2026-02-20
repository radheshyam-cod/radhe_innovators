from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: str
    last_login: Optional[str] = None
