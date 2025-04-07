import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

class NotificationService:
    def __init__(self):
        # In a real app, you would fetch these from environment variables or config
        self.email_enabled = False  # Set to True when email credentials are available
        self.sms_enabled = False    # Set to True when SMS credentials are available
        
        # Email settings
        self.email_sender = "farmsystem@example.com"
        self.email_password = "password"  # Would use environment variable in production
        self.smtp_server = "smtp.example.com"
        self.smtp_port = 587
        
        # SMS settings (using a hypothetical SMS gateway)
        self.sms_api_key = "sms-api-key"  # Would use environment variable in production
        self.sms_sender = "FARMSYS"
        
        # For simulation, we'll store notifications in a file
        self.notifications_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
        self.notifications_file = os.path.join(self.notifications_dir, 'notifications.json')
        
        # Create directory if it doesn't exist
        os.makedirs(self.notifications_dir, exist_ok=True)
        
        # Create notifications file if it doesn't exist
        if not os.path.exists(self.notifications_file):
            with open(self.notifications_file, 'w') as f:
                json.dump([], f)
    
    def send_email(self, recipient_email, subject, body):
        """Send an email notification"""
        if not self.email_enabled:
            print(f"Email notification would be sent to {recipient_email}")
            print(f"Subject: {subject}")
            print(f"Body: {body}")
            return self._store_notification('email', recipient_email, subject, body)
        
        try:
            message = MIMEMultipart()
            message['From'] = self.email_sender
            message['To'] = recipient_email
            message['Subject'] = subject
            
            # Attach the body of the message
            message.attach(MIMEText(body, 'plain'))
            
            # Connect to the SMTP server
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Secure the connection
                server.login(self.email_sender, self.email_password)
                server.send_message(message)
            
            return self._store_notification('email', recipient_email, subject, body)
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_sms(self, phone_number, message):
        """Send an SMS notification"""
        if not self.sms_enabled:
            print(f"SMS notification would be sent to {phone_number}")
            print(f"Message: {message}")
            return self._store_notification('sms', phone_number, 'Alert', message)
        
        try:
            # In a real app, this would use an SMS API client
            # Here we just simulate it
            print(f"Sending SMS to {phone_number}: {message}")
            
            return self._store_notification('sms', phone_number, 'Alert', message)
        except Exception as e:
            print(f"Error sending SMS: {e}")
            return False
    
    def _store_notification(self, type, recipient, subject, message):
        """Store notification in the simulated database"""
        try:
            # Read existing notifications
            with open(self.notifications_file, 'r') as f:
                notifications = json.load(f)
            
            # Add new notification
            notification = {
                'id': len(notifications) + 1,
                'type': type,
                'recipient': recipient,
                'subject': subject,
                'message': message,
                'timestamp': datetime.now().isoformat(),
                'status': 'sent'
            }
            notifications.append(notification)
            
            # Write back to file
            with open(self.notifications_file, 'w') as f:
                json.dump(notifications, f, indent=2)
            
            return True
        except Exception as e:
            print(f"Error storing notification: {e}")
            return False
    
    def get_notifications(self, limit=20):
        """Get recent notifications"""
        try:
            with open(self.notifications_file, 'r') as f:
                notifications = json.load(f)
            
            # Sort by timestamp descending and limit
            notifications.sort(key=lambda x: x['timestamp'], reverse=True)
            return notifications[:limit]
        except Exception as e:
            print(f"Error getting notifications: {e}")
            return []