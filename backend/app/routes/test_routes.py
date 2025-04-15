from flask import Blueprint, jsonify, request
from datetime import datetime
from app import db

bp = Blueprint('test', __name__, url_prefix='/api/test')

@bp.route('/db-test', methods=['POST'])
def test_mongodb_write():
    try:
        # Get data from request or use default
        data = request.get_json() or {"test": "data", "timestamp": str(datetime.now())}
        
        # Insert data into a test collection
        result = db.test_collection.insert_one(data)
        
        # Return success with the inserted ID
        return jsonify({
            "success": True, 
            "message": "Data successfully stored in MongoDB",
            "inserted_id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to store data: {str(e)}"
        }), 500

@bp.route('/db-test', methods=['GET'])
def test_mongodb_read():
    try:
        # Retrieve all documents from the test collection
        data = list(db.test_collection.find())
        
        # Convert ObjectId to string for JSON serialization
        for item in data:
            item['_id'] = str(item['_id'])
            
        return jsonify({
            "success": True,
            "count": len(data),
            "data": data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to retrieve data: {str(e)}"
        }), 500