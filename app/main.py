from flask import Flask, render_template, request, jsonify, send_from_directory
import requests
import os
import base64
import logging
import uuid
import time

app = Flask(__name__, static_url_path='/static', template_folder='templates', static_folder='static')

API_URL = "http://localhost:7861/sdapi/v1/txt2img"
OPTIONS_URL = "http://localhost:7861/sdapi/v1/options"
MODELS_URL = "http://localhost:7861/sdapi/v1/sd-models"
MODEL_PATH = os.path.join(os.getcwd(), "../models/dreamshaperXL_sfwLightningDPMSDE.safetensors")
MODEL_CONFIG = os.path.join(os.getcwd(), "../models/dreamshaperXL_sfwLightningDPMSDE.json")
OUTPUT_FOLDER = os.path.join(os.getcwd(), "../outputs")

if not os.path.exists(OUTPUT_FOLDER):
    os.makedirs(OUTPUT_FOLDER)

logging.basicConfig(level=logging.DEBUG)

# Get current options
opt_response = requests.get(url=OPTIONS_URL)
opt_json = opt_response.json()
print("Current Options:", opt_json)  # Print current options for debugging

# Set the model
opt_json['sd_model_checkpoint'] = "dreamshaperXL_sfwLightningDPMSDE.safetensors"  # Ensure this matches your model filename
set_opt_response = requests.post(url=OPTIONS_URL, json=opt_json)
if set_opt_response.status_code != 200:
    logging.error(f"Failed to set options: {set_opt_response.text}")

# Verify model list
response = requests.get(url=MODELS_URL)
models = response.json()
print("Available Models:", models)  # Print available models for debugging

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    prompt = request.form['prompt']

    model_info = {
        "title": "SDXL lightning",
        "model_name": "dreamshaperXL_sfwLightningDPMSDE",
        "hash": "706BD705",  # Replace with your model's hash (CRC32)
        "sha256": "832E7BB2302C3CD67C818CA4FE9DCBEDF696D3070DAB5463127263EC4DB9899F",  # Replace with your model's sha256
        "filename": MODEL_PATH,
        "config": MODEL_CONFIG  # Replace with your model's config path if applicable
    }

    data = {
        "prompt": prompt,
        "cfg_scale": 1,
        "steps": 4,
        "width": 512,
        "height": 512,
        "sampler_name": "DPM++ SDE",
        "scheduler": "Karras",
        "models": [model_info]  # Include the model information here
    }

    start_time = time.time()  # Record start time
    logging.debug(f"Sending request to API: {data}")
    response = requests.post(API_URL, json=data)
    end_time = time.time()  # Record end time
    generation_time = end_time - start_time
    logging.debug(f"Time taken to generate the image: {generation_time:.2f} seconds")

    if response.status_code == 200:
        logging.debug(f"API response: {response.json()}")
        print(response.json())  # Add this line to print the response data for debugging
        image_data = response.json().get('images', [None])[0]
        if image_data:
            try:
                unique_filename = f"generated_image_{uuid.uuid4().hex}.png"
                image_path = os.path.join(OUTPUT_FOLDER, unique_filename)
                with open(image_path, "wb") as f:
                    f.write(base64.b64decode(image_data))
                return jsonify({
                    'image_url': f'/outputs/{unique_filename}',
                    'generation_time': f'{generation_time:.2f} seconds'
                })
            except Exception as e:
                logging.error(f"Failed to decode and save image: {e}")
                return jsonify({'error': 'Failed to process image data'}), 500
        else:
            logging.error("No image data received in the response")
            return jsonify({'error': 'No image data received'}), 500
    else:
        logging.error(f"API request failed with status {response.status_code}: {response.text}")
        return jsonify({'error': 'Failed to generate image'}), 500

@app.route('/outputs/<filename>')
def serve_image(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)
