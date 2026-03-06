from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase_client import supabase

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["POST"])
def sensor_data():
    data = request.json

    print("Received sensor data:")
    print(data)
 
    return jsonify({"status": "data received"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)