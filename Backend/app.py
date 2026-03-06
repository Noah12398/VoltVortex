from flask import Flask, jsonify
from flask_cors import CORS
from supabase_client import supabase

app = Flask(__name__)
CORS(app)

try:
    response = supabase.table("sensor_data").select("*").limit(1).execute()
    print("Connected to Supabase!")
    print(response.data)

except Exception as e:
    print("Connection failed:", e)
    
@app.route("/")
def home():
    return jsonify({"message": "Krishi-Net Backend Running"})

@app.route("/soil")
def soil():
    return jsonify({"ph":6.5, "recommendation":"Balanced NPK fertilizer"})

if __name__ == "__main__":
    app.run(debug=True)