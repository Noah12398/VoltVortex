from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({"message": "Krishi-Net Backend Running"})

@app.route("/soil")
def soil():
    return jsonify({"ph":6.5, "recommendation":"Balanced NPK fertilizer"})

if __name__ == "__main__":
    app.run(debug=True)