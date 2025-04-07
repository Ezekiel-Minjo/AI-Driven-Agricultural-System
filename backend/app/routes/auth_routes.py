from flask import Blueprint, request, jsonify
from app.models import user as user_model
import re

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['username', 'email', 'password', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate username
    username = data['username']
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
        return jsonify({'error': 'Username must be 3-20 characters and contain only letters, numbers, and underscores'}), 400
    
    # Validate email
    email = data['email']
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password
    password = data['password']
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400
    
    # Check if user already exists
    if user_model.get_user_by_email(email) or user_model.get_user_by_username(username):
        return jsonify({'error': 'Username or email already in use'}), 400
    
    # Create user
    user = user_model.create_user(
        username=username,
        email=email,
        password=password,
        name=data['name'],
        phone=data.get('phone')
    )
    
    if not user:
        return jsonify({'error': 'Failed to create user'}), 500
    
    # Generate token
    token = user_model.generate_token(user['_id'])
    
    return jsonify({
        'user': user,
        'token': token
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    username_or_email = data.get('username') or data.get('email')
    password = data.get('password')
    
    if not username_or_email or not password:
        return jsonify({'error': 'Username/email and password are required'}), 400
    
    # Authenticate user
    user = user_model.authenticate_user(username_or_email, password)
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate token
    token = user_model.generate_token(user['_id'])
    
    return jsonify({
        'user': user,
        'token': token
    })

@bp.route('/me', methods=['GET'])
def get_current_user():
    # Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'No token provided'}), 401
    
    token = auth_header.split(' ')[1]
    
    # Verify token
    user_id = user_model.verify_token(token)
    
    if not user_id:
        return jsonify({'error': 'Invalid or expired token'}), 401
    
    # Get user
    user = user_model.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user)