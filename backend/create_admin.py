from app.core.database import SessionLocal
from app.models.user import User, Role
from app.core.security import get_password_hash

db = SessionLocal()
role = db.query(Role).filter_by(role_name="Administrator").first()

if not role:
    print("Administrator role not found!")
else:
    email = "admin@netshield.ai"
    existing = db.query(User).filter_by(email=email).first()
    if not existing:
        user = User(
            username="admin",
            email=email,
            password_hash=get_password_hash("Admin@123"),
            full_name="NetShield Administrator",
            role_id=role.id,
            is_active=True
        )
        db.add(user)
        db.commit()
        print(f"User {email} created successfully with password: Admin@123")
    else:
        print(f"User {email} already exists!")
db.close()
