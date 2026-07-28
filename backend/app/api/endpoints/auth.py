from typing import Any, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User, Role, AuditLog
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserOut, UserLogin, RoleOut

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(
    request: Request,
    user_in: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """Register a new user, assign a role, hash their password, and log the audit event."""
    # Check if email is already registered
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    # Check if username is already registered
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this username already exists in the system."
        )

    # Resolve role name to role_id
    role = db.query(Role).filter(Role.role_name == user_in.role_name).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{user_in.role_name}' does not exist. Choose from: Administrator, Security Analyst, SOC Manager."
        )

    # Create new User object
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        full_name=user_in.full_name,
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_password,
        role_id=role.id,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Log registration in Audit Log
    client_ip = request.client.host if request.client else "unknown"
    audit_entry = AuditLog(
        user_id=db_user.id,
        action=f"User Registration - Role: {role.role_name}",
        ip_address=client_ip
    )
    db.add(audit_entry)
    db.commit()

    return db_user

@router.post("/login", response_model=Token)
def login(
    request: Request,
    login_data: UserLogin,
    db: Session = Depends(get_db)
) -> Any:
    """Authenticate credentials (email or username), update last_login, return JWT, and log the audit event."""
    client_ip = request.client.host if request.client else "unknown"
    
    # User can login with either email or username
    user = db.query(User).filter(
        (User.email == login_data.email) | (User.username == login_data.email)
    ).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        # Audit Log failed login attempt if username existed
        if user:
            audit_entry = AuditLog(
                user_id=user.id,
                action="Failed Login - Invalid Credentials",
                ip_address=client_ip
            )
            db.add(audit_entry)
            db.commit()
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account."
        )

    # Update last login timestamp
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # Log successful login
    audit_entry = AuditLog(
        user_id=user.id,
        action="User Login - Successful",
        ip_address=client_ip
    )
    db.add(audit_entry)
    db.commit()

    # Generate JWT token containing username
    access_token = create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Log out user (front-end clears token) and write logout event to audit trail."""
    client_ip = request.client.host if request.client else "unknown"
    
    audit_entry = AuditLog(
        user_id=current_user.id,
        action="User Logout - Successful",
        ip_address=client_ip
    )
    db.add(audit_entry)
    db.commit()
    
    return {"message": "Successfully logged out"}

@router.get("/roles", response_model=List[RoleOut])
def get_roles(
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve all roles for user assignment."""
    return db.query(Role).all()
