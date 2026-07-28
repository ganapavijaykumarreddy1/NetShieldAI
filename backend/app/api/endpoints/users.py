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
