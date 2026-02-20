"""
GeneDose.ai Security Module

This module handles authentication, authorization, and security utilities
for the GeneDose.ai application, including JWT token management
and role-based access control.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer token (auto_error=False to support skip_auth without 403 on missing header)
security = HTTPBearer(auto_error=False)

# User roles
class UserRole:
    CLINICIAN = "clinician"
    PHARMACIST = "pharmacist"
    RESEARCHER = "researcher"
    ADMIN = "admin"

class SecurityService:
    """Service for handling security operations"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

# Mock user database for development (lazy initialization to avoid bcrypt issues at import time)
_MOCK_USERS_CACHE = None

def get_mock_users():
    """Lazy initialization of mock users to avoid bcrypt issues at import time."""
    global _MOCK_USERS_CACHE
    if _MOCK_USERS_CACHE is None:
        _MOCK_USERS_CACHE = {
            "clinician@example.com": {
                "id": "user_001",
                "email": "clinician@example.com",
                "name": "Dr. Sarah Chen",
                "role": UserRole.CLINICIAN,
                "hashed_password": SecurityService.get_password_hash("password123")
            },
            "pharmacist@example.com": {
                "id": "user_002", 
                "email": "pharmacist@example.com",
                "name": "Dr. Michael Park",
                "role": UserRole.PHARMACIST,
                "hashed_password": SecurityService.get_password_hash("password123")
            }
        }
    return _MOCK_USERS_CACHE

MOCK_USERS = property(lambda self: get_mock_users()) if False else None  # Placeholder, use get_mock_users() instead

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user credentials"""
    mock_users = get_mock_users()
    user = mock_users.get(email)
    if not user:
        return None
    if not SecurityService.verify_password(password, user["hashed_password"]):
        return None
    return user

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user from JWT token"""
    
    # Skip auth for development
    if settings.skip_auth:
        return {
            "sub": "dev_user",
            "role": UserRole.CLINICIAN,
            "name": "Development User"
        }
        
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = SecurityService.verify_token(credentials.credentials)
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        
        if user_id is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "sub": user_id,
            "role": role,
            "name": payload.get("name", ""),
            "email": payload.get("email", "")
        }
    
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_role(required_role: str):
    """Decorator to require specific user role"""
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        if current_user["role"] != required_role and current_user["role"] != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

def require_pharmacist_or_admin(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Require pharmacist or admin role"""
    if current_user["role"] not in [UserRole.PHARMACIST, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pharmacist or admin access required"
        )
    return current_user

def require_clinician_or_above(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Require clinician, pharmacist, or admin role"""
    if current_user["role"] not in [UserRole.CLINICIAN, UserRole.PHARMACIST, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clinician access or above required"
        )
    return current_user
