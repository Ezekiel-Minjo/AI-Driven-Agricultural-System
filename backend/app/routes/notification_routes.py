from flask import Blueprint, request, jsonify
from app.services.notification_service import NotificationService

bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

# Initialize notification service
notification_service = NotificationService()

@bp.route('/email', methods=['POST'])
def send_email():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')
    
    if not email or not subject or not message:
        return jsonify({'error': 'Email, subject, and message are required'}), 400
    
    success = notification_service.send_email(email, subject, message)
    
    if success:
        return jsonify({'success': True, 'message': 'Email notification sent'})
    else:
        return jsonify({'error': 'Failed to send email notification'}), 500

@bp.route('/sms', methods=['POST'])
def send_sms():
    data = request.json
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    phone = data.get('phone')
    message = data.get('message')
    
    if not phone or not message:
        return jsonify({'error': 'Phone and message are required'}), 400
    
    success = notification_service.send_sms(phone, message)
    
    if success:
        return jsonify({'success': True, 'message': 'SMS notification sent'})
    else:
        return jsonify({'error': 'Failed to send SMS notification'}), 500

@bp.route('/history', methods=['GET'])
def get_notification_history():
    limit = request.args.get('limit', 20, type=int)
    
    notifications = notification_service.get_notifications(limit)
    
    return jsonify(notifications)