from flask import Flask, request, jsonify
from flask_cors import CORS
from ocr.ocr import process_medicine_image
from ml.low_stock_prediction import predict_low_stock
from ml.expiry_prediction import predict_expiry_risk
from ml.demand_prediction import predict_demand

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "OK",
        "service": "MedScan AI Python Microservice",
        "modules": ["OpenCV", "EasyOCR", "BarcodeReader", "Scikit-Learn ML"]
    }), 200

@app.route('/ocr', methods=['POST'])
def handle_ocr():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "error": "Empty filename"}), 400

    try:
        image_bytes = file.read()
        extracted_data = process_medicine_image(image_bytes)
        return jsonify({
            "success": True,
            "data": extracted_data
        }), 200
    except Exception as e:
        print(f"[OCR Error] {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
            "fallbackData": {
                "name": "Paracetamol 500mg",
                "batchNumber": "B98745",
                "expiryDate": "12/2026",
                "manufacturer": "MedLab Pharma",
                "category": "Tablet"
            }
        }), 200

@app.route('/ml/predict-low-stock', methods=['POST'])
def handle_low_stock():
    data = request.json or {}
    qty = data.get('quantity', 10)
    sales = data.get('avgDailySales', 1)
    threshold = data.get('threshold', 10)

    result = predict_low_stock(qty, sales, threshold)
    return jsonify({"success": True, "prediction": result})

@app.route('/ml/predict-expiry', methods=['POST'])
def handle_expiry():
    data = request.json or {}
    exp_date = data.get('expiryDate', '')
    qty = data.get('quantity', 10)
    sales = data.get('avgDailySales', 1)

    result = predict_expiry_risk(exp_date, qty, sales)
    return jsonify({"success": True, "prediction": result})

@app.route('/ml/predict-demand', methods=['POST'])
def handle_demand():
    data = request.json or {}
    history = data.get('salesHistory', [15, 18, 22, 25, 30])

    result = predict_demand(history)
    return jsonify({"success": True, "prediction": result})

if __name__ == '__main__':
    print("==================================================")
    print(" [AI] MedScan AI Python Microservice running on :8000")
    print(" [OK] Health check: http://localhost:8000/health")
    print("==================================================")
    app.run(host='0.0.0.0', port=8000, debug=True)
