from app.core.database import SessionLocal
from app.models.user import User, Role
from app.core.security import get_password_hash

db = SessionLocal()
role = db.query(Role).filter_by(role_name="Administrator").first()

if not role:
    print("Administrator role not found!")
else:
    email = "vijay1sa@netshield.ai"
    existing = db.query(User).filter_by(email=email).first()
    if not existing:
        user = User(
            email=email,
            password_hash=get_password_hash("password123"),
            full_name="Vijay",
            role_id=role.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        print(f"User {email} created successfully with password: password123")
    else:
        print(f"User {email} already exists!")
db.close()
