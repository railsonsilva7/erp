import sys
from database import SessionLocal, engine
import models
import auth

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

def create_user(username, password, full_name=None):
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.username == username).first()
        if existing_user:
            print(f"User {username} already exists.")
            return

        hashed_password = auth.get_password_hash(password)
        user = models.User(
            username=username,
            hashed_password=hashed_password,
            full_name=full_name
        )
        db.add(user)
        db.commit()
        print(f"User {username} created successfully.")
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_user.py <username> <password> [full_name]")
        sys.exit(1)
    
    username = sys.argv[1]
    password = sys.argv[2]
    full_name = sys.argv[3] if len(sys.argv) > 3 else None
    
    create_user(username, password, full_name)
