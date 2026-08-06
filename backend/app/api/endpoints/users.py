from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.core.security import get_password_hash
from app.models.user import User, AuditLog
from app.schemas.user import UserOut, UserUpdate

router = APIRouter()

@router.get("/profile", response_model=UserOut)
def read_user_profile(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve details of the currently authenticated active user."""
    return current_user

@router.put("/profile", response_model=UserOut)
def update_user_profile(
    request: Request,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update profile information of the current active user."""
    client_ip = request.client.host if request.client else "unknown"
    changes = []
    
    # Validation checks for email duplicates
    if user_in.email and user_in.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email address is already in use."
            )
        current_user.email = user_in.email
        changes.append("email")

    # Validation checks for username duplicates
    if user_in.username and user_in.username != current_user.username:
        existing_user = db.query(User).filter(User.username == user_in.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This username is already in use."
            )
        current_user.username = user_in.username
        changes.append("username")

    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
        changes.append("full_name")

    if user_in.password is not None:
        current_user.password_hash = get_password_hash(user_in.password)
        changes.append("password")

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    # Log profile modification event in Audit Log if changes occurred
    if changes:
        audit_entry = AuditLog(
            user_id=current_user.id,
            action=f"User Profile Update - Fields modified: {', '.join(changes)}",
            ip_address=client_ip
        )
        db.add(audit_entry)
        db.commit()

    return current_user

from typing import List
from app.api.deps import RoleChecker
from app.models.user import Role
from app.schemas.user import UserCreate, UserRoleUpdate, UserStatusUpdate

# Admin User Management Endpoints
admin_required = RoleChecker(["Administrator"])

@router.get("/", response_model=List[UserOut])
def list_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
) -> Any:
    """List all registered users (Administrator only)."""
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=UserOut)
def admin_create_user(
    user_in: UserCreate,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
) -> Any:
    """Create a new user account directly from Admin panel."""
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username is already taken.")
        
    role = db.query(Role).filter(Role.role_name == user_in.role_name).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{user_in.role_name}' does not exist.")
        
    new_user = User(
        full_name=user_in.full_name,
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role_id=role.id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role_in: UserRoleUpdate,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
) -> Any:
    """Update role for a specific user (Administrator only)."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    role = db.query(Role).filter(Role.role_name == role_in.role_name).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{role_in.role_name}' does not exist.")
        
    target_user.role_id = role.id
    db.add(target_user)
    db.commit()
    db.refresh(target_user)
    return target_user

@router.put("/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    status_in: UserStatusUpdate,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
) -> Any:
    """Toggle active/disabled status for a user (Administrator only)."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    target_user.is_active = status_in.is_active
    db.add(target_user)
    db.commit()
    db.refresh(target_user)
    return target_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(admin_required),
    db: Session = Depends(get_db)
) -> Any:
    """Delete a user account (Administrator only)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own administrator account.")
        
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(target_user)
    db.commit()
    return {"message": "User deleted successfully"}

