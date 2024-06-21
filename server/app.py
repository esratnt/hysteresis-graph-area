from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route('/upload', methods=['POST'])
def upload_image():
    file = request.files['image']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Crop the image here
    cropped_images = crop_image(filepath)

    # Convert cropped image paths to URLs
    cropped_image_urls = [f'http://127.0.0.1:5000/uploads/{os.path.basename(path)}' for path in cropped_images]

    return jsonify({"cropped_images": cropped_image_urls})


def crop_image(image_path):
    # Load the image
    image = Image.open(image_path)
    image = image.convert('RGB')  # Ensure the image is in RGB mode
    image_np = np.array(image)

    # Coordinates for cropping
    coords = [(311, 164, 158, 158), (457, 166, 158, 158)]

    cropped_paths = []
    for i, (x, y, w, h) in enumerate(coords):
        cropped_image = image_np[y:y + h, x:x + w]
        cropped_image_pil = Image.fromarray(cropped_image)
        cropped_image_path = os.path.join(UPLOAD_FOLDER, f'cropped_{i + 1}.png')
        cropped_image_pil.save(cropped_image_path)
        cropped_paths.append(cropped_image_path)

    return cropped_paths


@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/process', methods=['POST'])
def process_image():
    image_path = request.json['image_path']
    image_path = os.path.join(UPLOAD_FOLDER, os.path.basename(image_path))

    # Process the image as per the provided code
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    _, thresh = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)
    h, w = thresh.shape
    mask = np.zeros((h + 2, w + 2), np.uint8)
    flood_filled = thresh.copy()
    cv2.floodFill(flood_filled, mask, (0, 0), 255)
    flood_filled_inv = cv2.bitwise_not(flood_filled)
    foreground = cv2.bitwise_or(thresh, flood_filled_inv)
    final_path = os.path.join(UPLOAD_FOLDER, 'final_foreground_mask.png')
    cv2.imwrite(final_path, foreground)
    white_area = np.sum(foreground == 255)
    image_height, image_width = image.shape[:2]
    total_area = image_height * image_width
    ratio = white_area / total_area
    final_image_url = f'http://127.0.0.1:5000/uploads/{os.path.basename(final_path)}'

    return jsonify({"final_image": final_image_url, "white_area": int(white_area), "total_area": total_area, "ratio": ratio})


if __name__ == '__main__':
    app.run(debug=True)
