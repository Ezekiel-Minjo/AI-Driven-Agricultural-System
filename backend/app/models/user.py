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
    
    # Simulated user creation
    user['_id'] = str(uuid.uuid4())
    
    # In a real app, this would save to MongoDB
    # result = db['users'].insert_one(user)
    # user['_id'] = str(result.inserted_id)
    
    # Return user without password hash
    user_data = user.copy()
    user_data.pop('password_hash', None)
    
    # Add to simulated users
    get_all_users().append(user)
    
    return user_data

def get_user_by_id(user_id):
    """Get a user by ID"""
    users = get_all_users()
    for user in users:
        if str(user.get('_id')) == str(user_id):
            user_data = user.copy()
            user_data.pop('password_hash', None)
            return user_data
    return None

def get_user_by_username(username):
    """Get a user by username"""
    users = get_all_users()
    for user in users:
        if user.get('username') == username:
            return user
    return None

def get_user_by_email(email):
    """Get a user by email"""
    users = get_all_users()
    for user in users:
        if user.get('email') == email:
            return user
    return None

def authenticate_user(username_or_email, password):
    """Authenticate a user with username/email and password"""
    # Try to find user by username or email
    user = get_user_by_username(username_or_email) or get_user_by_email(username_or_email)
    
    if not user:
        return None
    
    # Check password
    if user.get('password_hash') == hash_password(password):
        # Return user without password hash
        user_data = user.copy()
        user_data.pop('password_hash', None)
        return user_data
    
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
    """Get all users (simulated)"""
    # This would typically query the database
    # For demo purposes, we'll use a static list
    return [
        {
            '_id': '1',
            'username': 'farmer1',
            'email': 'farmer1@example.com',
            'password_hash': hash_password('password123'),
            'name': 'John Farmer',
            'phone': '+254712345678',
            'role': 'farmer',
            'created_at': '2023-01-01T00:00:00.000Z',
            'updated_at': '2023-01-01T00:00:00.000Z'
        },
        {
            '_id': '2',
            'username': 'admin',
            'email': 'admin@example.com',
            'password_hash': hash_password('admin123'),
            'name': 'Admin User',
            'phone': '+254787654321',
            'role': 'admin',
            'created_at': '2023-01-01T00:00:00.000Z',
            'updated_at': '2023-01-01T00:00:00.000Z'
        }
    ]