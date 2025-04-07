import random
import base64
import os
from datetime import datetime

class DiseaseDetectionService:
    def __init__(self):
        # Dictionary of common crop diseases by crop type
        self.crop_diseases = {
            'maize': [
                {
                    'name': 'Gray Leaf Spot',
                    'scientific_name': 'Cercospora zeae-maydis',
                    'symptoms': 'Rectangular lesions on leaves that are tan to gray and can coalesce to blight entire leaves.',
                    'treatment': 'Apply fungicides, rotate crops, and plant resistant varieties.',
                    'confidence': 0.92
                },
                {
                    'name': 'Northern Corn Leaf Blight',
                    'scientific_name': 'Exserohilum turcicum',
                    'symptoms': 'Long, elliptical lesions on leaves that are grayish-green to tan in color.',
                    'treatment': 'Apply fungicides, rotate crops, and plant resistant varieties.',
                    'confidence': 0.88
                },
                {
                    'name': 'Common Rust',
                    'scientific_name': 'Puccinia sorghi',
                    'symptoms': 'Small, circular to elongated, cinnamon-brown pustules on both leaf surfaces.',
                    'treatment': 'Apply fungicides and plant resistant varieties.',
                    'confidence': 0.85
                }
            ],
            'tomatoes': [
                {
                    'name': 'Late Blight',
                    'scientific_name': 'Phytophthora infestans',
                    'symptoms': 'Dark, water-soaked lesions on leaves, stems, and fruits that quickly enlarge and develop a white, fuzzy growth.',
                    'treatment': 'Apply fungicides, remove infected plants, and ensure proper air circulation.',
                    'confidence': 0.94
                },
                {
                    'name': 'Early Blight',
                    'scientific_name': 'Alternaria solani',
                    'symptoms': 'Dark, concentric rings on lower leaves that gradually move upward.',
                    'treatment': 'Apply fungicides, remove infected leaves, and mulch soil.',
                    'confidence': 0.87
                },
                {
                    'name': 'Septoria Leaf Spot',
                    'scientific_name': 'Septoria lycopersici',
                    'symptoms': 'Small, circular spots with dark borders and light gray centers on leaves.',
                    'treatment': 'Apply fungicides, remove infected leaves, and avoid overhead watering.',
                    'confidence': 0.91
                }
            ],
            'beans': [
                {
                    'name': 'Bean Rust',
                    'scientific_name': 'Uromyces appendiculatus',
                    'symptoms': 'Small, rusty-brown pustules on leaves, stems, and pods.',
                    'treatment': 'Apply fungicides, rotate crops, and plant resistant varieties.',
                    'confidence': 0.89
                },
                {
                    'name': 'Anthracnose',
                    'scientific_name': 'Colletotrichum lindemuthianum',
                    'symptoms': 'Dark, sunken lesions on pods, stems, and leaves with pink spore masses in the center.',
                    'treatment': 'Use disease-free seeds, apply fungicides, and rotate crops.',
                    'confidence': 0.86
                },
                {
                    'name': 'Bacterial Blight',
                    'scientific_name': 'Xanthomonas campestris pv. phaseoli',
                    'symptoms': 'Water-soaked spots on leaves that become brown with yellow borders.',
                    'treatment': 'Use disease-free seeds, avoid overhead watering, and rotate crops.',
                    'confidence': 0.82
                }
            ]
        }
        
        # Common pests
        self.crop_pests = {
            'maize': [
                {
                    'name': 'Fall Armyworm',
                    'scientific_name': 'Spodoptera frugiperda',
                    'symptoms': 'Ragged feeding damage on leaves and tassels, sawdust-like frass, and destruction of the growing point.',
                    'treatment': 'Apply appropriate insecticides, use biological controls, and plant resistant varieties.',
                    'confidence': 0.91
                },
                {
                    'name': 'Corn Earworm',
                    'scientific_name': 'Helicoverpa zea',
                    'symptoms': 'Feeding damage on ear tips and kernels.',
                    'treatment': 'Apply appropriate insecticides and use biological controls.',
                    'confidence': 0.87
                }
            ],
            'tomatoes': [
                {
                    'name': 'Tomato Hornworm',
                    'scientific_name': 'Manduca quinquemaculata',
                    'symptoms': 'Defoliation of plants and feeding damage on fruits.',
                    'treatment': 'Handpick, apply Bacillus thuringiensis (Bt), and encourage natural predators.',
                    'confidence': 0.95
                },
                {
                    'name': 'Whitefly',
                    'scientific_name': 'Bemisia tabaci',
                    'symptoms': 'Yellowing and wilting of leaves, sticky honeydew, and sooty mold.',
                    'treatment': 'Apply insecticidal soap, use yellow sticky traps, and introduce biological controls.',
                    'confidence': 0.89
                }
            ],
            'beans': [
                {
                    'name': 'Mexican Bean Beetle',
                    'scientific_name': 'Epilachna varivestis',
                    'symptoms': 'Lace-like feeding damage on leaves and damage to pods.',
                    'treatment': 'Apply appropriate insecticides, handpick, and use row covers.',
                    'confidence': 0.92
                },
                {
                    'name': 'Bean Aphid',
                    'scientific_name': 'Aphis fabae',
                    'symptoms': 'Stunted growth, curled leaves, and sticky honeydew.',
                    'treatment': 'Apply insecticidal soap, use strong water spray, and introduce beneficial insects.',
                    'confidence': 0.88
                }
            ]
        }
        
        # Create uploads directory if it doesn't exist
        self.upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
        os.makedirs(self.upload_dir, exist_ok=True)
    
    def analyze_image(self, image_data, crop_type='maize'):
        """
        Analyze an image for pest and disease detection
        
        Args:
            image_data: Base64 encoded image data
            crop_type: Type of crop in the image
        
        Returns:
            Dictionary with analysis results
        """
        # For simulation, decide if we'll return a disease or pest
        is_disease = random.choice([True, False, True])  # 2/3 chance of disease
        
        # Get the appropriate list for the crop type
        diseases = self.crop_diseases.get(crop_type.lower(), self.crop_diseases['maize'])
        pests = self.crop_pests.get(crop_type.lower(), self.crop_pests['maize'])
        
        # Randomly select a disease or pest
        if is_disease:
            detection = random.choice(diseases)
            detection_type = 'disease'
        else:
            detection = random.choice(pests)
            detection_type = 'pest'
        
        # Save the image if provided
        image_path = None
        if image_data:
            try:
                # Remove the prefix (e.g., "data:image/jpeg;base64,")
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                # Decode the image
                image_bytes = base64.b64decode(image_data)
                
                # Generate a filename
                filename = f"{crop_type}_{detection_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                image_path = os.path.join(self.upload_dir, filename)
                
                # Save the image
                with open(image_path, 'wb') as f:
                    f.write(image_bytes)
                
                # Make image_path relative for the response
                image_path = f"/uploads/{filename}"
            except Exception as e:
                print(f"Error saving image: {e}")
                image_path = None
        
        # Prepare the response
        response = {
            'detection_type': detection_type,
            'name': detection['name'],
            'scientific_name': detection['scientific_name'],
            'symptoms': detection['symptoms'],
            'treatment': detection['treatment'],
            'confidence': detection['confidence'],
            'image_path': image_path,
            'timestamp': datetime.now().isoformat()
        }
        
        return response