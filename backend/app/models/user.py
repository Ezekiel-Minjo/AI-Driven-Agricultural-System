# app/models/user.py
import hashlib
import os
import uuid
from datetime import datetime, timedelta
import jwt
from app.models import get_timestamp
from app import db

# Salt for password hashing
SALT = os.environ.get('PASSWORD_SALT', 'developmentsalt')

# JWT secret key
JWT_SECRET = os.environ.get('JWT_SECRET', 'developmentsecret')
JWT_EXPIRATION = int(os.environ.get('JWT_EXPIRATION', 86400))  # 24 hours in seconds

def hash_password(password):
    """Hash a password with salt"""
    return hashlib.sha256((password + SALT).encode()).hexdigest()

def create_user(username, email, password, name, phone=None):
    """Create a new user"""
    # Check if user already exists
    if get_user_by_email(email) or get_user_by_username(username):
        return None
    
    user = {
        'username': username,
        'email': email,
        'password_hash': hash_password(password),
        'name': name,
        'phone': phone,
        'role': 'farmer',  # Default role
        'created_at': get_timestamp(),
        'updated_at': get_timestamp()
    }
    
    # Insert user into MongoDB
    result = db.users.insert_one(user)
    user['_id'] = str(result.inserted_id)
    
    # Return user without password hash
    user_data = user.copy()
    user_data.pop('password_hash', None)
    
    return user_data

def get_user_by_id(user_id):
    """Get a user by ID"""
    from bson.objectid import ObjectId
    
    try:
        user = db.users.find_one({'_id': ObjectId(user_id)})
    except:
        # If not a valid ObjectId, try as a string (for backwards compatibility)
        user = db.users.find_one({'_id': user_id})
    
    if user:
        user['_id'] = str(user['_id'])
        user_data = user.copy()
        user_data.pop('password_hash', None)
        return user_data
    
    return None

def get_user_by_username(username):
    """Get a user by username"""
    user = db.users.find_one({'username': username})
    if user:
        user['_id'] = str(user['_id'])
    return user

def get_user_by_email(email):
    """Get a user by email"""
    user = db.users.find_one({'email': email})
    if user:
        user['_id'] = str(user['_id'])
    return user

def authenticate_user(username_or_email, password):
    """Authenticate a user with username/email and password"""
    print(f"Attempting to authenticate: {username_or_email}")
    
    # Try to find user by username or email
    user = db.users.find_one({
        '$or': [
            {'username': username_or_email},
            {'email': username_or_email}
        ]
    })
    
    if not user:
        print(f"No user found with username/email: {username_or_email}")
        return None
    
    print(f"User found: {user.get('username')}")
    
    # Convert ObjectId to string
    user['_id'] = str(user['_id'])
    
    # Check password
    input_hash = hash_password(password)
    stored_hash = user.get('password_hash')
    print(f"Input password hash: {input_hash[:10]}...")
    print(f"Stored password hash: {stored_hash[:10]}...")
    
    if input_hash == stored_hash:
        print("Password match successful!")
        # Return user without password hash
        user_data = user.copy()
        user_data.pop('password_hash', None)
        
        try:
            # Update last login time
            from bson.objectid import ObjectId
            db.users.update_one(
                {'_id': ObjectId(user['_id'])},
                {'$set': {'last_login': get_timestamp()}}
            )
            print("Updated last login time")
        except Exception as e:
            print(f"Error updating last login time: {e}")
        
        return user_data
    else:
        print("Password does not match")
        return None

def generate_token(user_id):
    """Generate a JWT token for a user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(seconds=JWT_EXPIRATION)
    }
    
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    """Verify a JWT token and return the user ID if valid"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Invalid token
        return None

def get_all_users():
    """Get all users from MongoDB"""
    users = list(db.users.find())
    
    # Convert ObjectId to string for each user
    for user in users:
        user['_id'] = str(user['_id'])
    
    return users