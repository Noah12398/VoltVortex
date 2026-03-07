from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
import joblib
import os
import random
from collections import deque
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# ─────────────────────────────────────────
# 1. INIT: Flask & Supabase
# ─────────────────────────────────────────
load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "YOUR_SUPABASE_URL":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Connected to Supabase!")
    except Exception as e:
        print(f"⚠️  Supabase Config Error: {e}")
else:
    print("⚠️  Supabase not configured in .env. Skipping DB inserts.")


# ─────────────────────────────────────────
# 2. In-Memory State Cache
# ─────────────────────────────────────────
# history buffer for the anomaly model and forecasting
history = deque(maxlen=50)

# The most recent fully-analyzed payload (served to frontend)
latest_reading = None


# ─────────────────────────────────────────
# 3. ML Models
# ─────────────────────────────────────────
MODEL_PATH = "crop_stress_model.pkl"
FEATURES = ["N", "P", "K", "temperature", "humidity", "ph"]
MODEL_FEATURES = ["Nitrogen", "Phosphorus", "Potassium", "Temperature", "Humidity", "pH_Value"]

ALIAS_TO_MODEL = {
    "N": "Nitrogen", "P": "Phosphorus", "K": "Potassium",
    "temperature": "Temperature", "humidity": "Humidity", "ph": "pH_Value"
}

def to_model_df(features_dict):
    renamed = {ALIAS_TO_MODEL[k]: features_dict[k] for k in FEATURES}
    return pd.DataFrame([renamed])

def stress_label(row):
    if (row["N"] < 50 or row["N"] > 200 or row["P"] < 20 or row["P"] > 100 or 
        row["K"] < 20 or row["K"] > 200 or row["temperature"] < 20 or row["temperature"] > 35 or
        row["humidity"] < 30 or row["humidity"] > 90 or row["ph"] < 5.5 or row["ph"] > 7.5): return 1
    return 0

if os.path.exists(MODEL_PATH):
    clf = joblib.load(MODEL_PATH)
    print("✅ Crop Stress Model Loaded!")
else:
    print("⚙️  Training Synthetic Crop Stress Model...")
    rng = np.random.RandomState(42)
    n = 1000
    synthetic = pd.DataFrame({
        "N": rng.randint(10, 250, n), "P": rng.randint(5, 150, n), "K": rng.randint(5, 250, n),
        "temperature": rng.uniform(10, 45, n), "humidity": rng.uniform(15, 100, n), "ph": rng.uniform(3.5, 9.5, n),
    })
    synthetic["stress_label"] = synthetic.apply(stress_label, axis=1)
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(synthetic[FEATURES], synthetic["stress_label"])
    joblib.dump(clf, MODEL_PATH)
    print("✅ Synthetic Model Saved!")


# ─────────────────────────────────────────
# 4. Utilities
# ─────────────────────────────────────────
def simulate_ph_npk(t, h, s):
    # Deterministic simulation driven by sensor data
    seed = int((t * 10 + h + s / 10)) % 10000
    rng = random.Random(seed)
    
    # pH based loosely on moisture
    moisture_factor = (s - 1500) / 1000 
    ph = round(max(5.0, min(8.0, 6.5 + moisture_factor * 0.5 + rng.uniform(-0.3, 0.3))), 2)
    
    # NPK driven by environment
    N = round(max(10, min(250, 80 + rng.uniform(-30, 30) + h * 0.3)), 1)
    P = round(max(5, min(120, 45 + rng.uniform(-15, 15) + t * 0.2)), 1)
    K = round(max(5, min(250, 60 + rng.uniform(-20, 20) + s * 0.01)), 1)
    
    return ph, N, P, K

def analyze_crop_health(fd):
    df = to_model_df(fd)
    pred = int(clf.predict(df)[0])
    prb = clf.predict_proba(df)[0]
    s_prob = float(prb[1])
    h_prob = float(prb[0])
    status = "High Risk" if s_prob >= 0.7 else "Moderate Risk" if s_prob >= 0.4 else "Healthy"
    color = "red" if s_prob >= 0.7 else "orange" if s_prob >= 0.4 else "green"
    return {
        "prediction": pred, "stress_probability": round(s_prob * 100, 1),
        "healthy_probability": round(h_prob * 100, 1), "status": status, "color": color
    }

def analyze_nutrient_deficiency(N, P, K, ph):
    defs = []
    def check(val, low1, low2, hi, name):
        if val < low1: defs.append(name); return "Severe Deficiency", "red"
        if val < low2: defs.append(name); return "Mild Deficiency", "orange"
        if val > hi: return "Excess", "purple"
        return "Optimal", "green"
        
    ns, nc = check(N, 30, 50, 200, "Nitrogen")
    ps, pc = check(P, 15, 20, 100, "Phosphorus")
    ks, kc = check(K, 15, 20, 200, "Potassium")
    
    phw = "Soil too acidic" if ph < 5.5 else "Soil too alkaline" if ph > 7.5 else None
    
    return {
        "nutrients": {
            "N": {"value": N, "status": ns, "color": nc, "range": "50-200", "recommendation": "Adjust N" if ns!="Optimal" else "OK"},
            "P": {"value": P, "status": ps, "color": pc, "range": "20-100", "recommendation": "Adjust P" if ps!="Optimal" else "OK"},
            "K": {"value": K, "status": ks, "color": kc, "range": "20-200", "recommendation": "Adjust K" if ks!="Optimal" else "OK"}
        },
        "deficiencies_detected": defs, "ph_warning": phw,
        "overall_status": "Deficient" if defs else "Balanced"
    }

def analyze_irrigation(soil, t, h, N, P, K, ph):
    pct = max(0, min(100, 100 - (soil / 4095) * 100))
    if pct < 30:
        irg = {"action": "Irrigate Now", "urgency": "High", "detail": f"Moisture critically low ({pct:.0f}%).", "amount_liters_per_sqm": round((50-pct)*0.04, 2)}
    elif pct < 50:
        irg = {"action": "Irrigate Soon", "urgency": "Medium", "detail": f"Moisture moderate ({pct:.0f}%).", "amount_liters_per_sqm": round((50-pct)*0.03, 2)}
    else:
        irg = {"action": "No Irrigation", "urgency": "Low", "detail": f"Moisture adequate ({pct:.0f}%).", "amount_liters_per_sqm": 0}
        
    fert = []
    if N < 50: fert.append({"nutrient": "Nitrogen", "action": "Add Urea", "priority": "High"})
    if P < 20: fert.append({"nutrient": "Phosphorus", "action": "Add DAP", "priority": "High"})
    if K < 20: fert.append({"nutrient": "Potassium", "action": "Add MOP", "priority": "High"})
    if not fert: fert.append({"nutrient": "All", "action": "Balanced", "priority": "Low"})
    
    return {"soil_moisture_pct": round(pct,1), "irrigation": irg, "fertilization": fert}

def analyze_forecast(hist):
    if len(hist) < 2: return None
    import numpy as np
    def fcast(key):
        vals = [h[key] for h in hist]
        c = np.polyfit(np.arange(len(vals)), vals, 1)
        return float(round(c[0]*len(vals) + c[1], 2))
    return {
        "next_temperature": fcast("temperature"), "next_humidity": fcast("humidity"),
        "next_soil_moisture": fcast("soil_moisture"), "next_ph": fcast("ph"),
        "based_on_readings": len(hist), "note": "Linear trend"
    }

def analyze_anomaly(hist, curr):
    if len(hist) < 5:
        return {"is_anomaly": False, "score": None, "message": "Building baseline...", "anomalous_features": []}
    
    keys = ["temperature", "humidity", "soil_moisture", "ph", "N", "P", "K"]
    data = [[h.get(k,0) for k in keys] for h in list(hist)]
    c_vec = [[curr.get(k,0) for k in keys]]
    
    iso = IsolationForest(contamination=0.1, random_state=42)
    iso.fit(data)
    
    score = float(iso.score_samples(c_vec)[0])
    is_anomaly = iso.predict(c_vec)[0] == -1
    
    means = np.mean(data, axis=0); stds = np.std(data, axis=0) + 1e-9
    zs = np.abs((np.array(c_vec[0]) - means) / stds)
    anom_feats = [keys[i] for i, z in enumerate(zs) if z > 2.0]
    
    sev = "Normal"
    if is_anomaly: sev = "High Anomaly" if score < -0.2 else "Moderate Anomaly"
        
    return {
        "is_anomaly": bool(is_anomaly), "score": round(score, 3), "severity": sev,
        "anomalous_features": anom_feats, "message": f"🚩 Anomaly in {','.join(anom_feats)}" if anom_feats else "✅ Normal"
    }

def get_feat_importances():
    ims = clf.feature_importances_
    m_to_a = {v: k for k, v in ALIAS_TO_MODEL.items()}
    f_names = getattr(clf, "feature_names_in_", MODEL_FEATURES)
    return [{"feature": m_to_a.get(f, f), "importance": round(float(i)*100, 2)}
            for f, i in sorted(zip(f_names, ims), key=lambda x: x[1], reverse=True)]


# ─────────────────────────────────────────
# 5. Routes
# ─────────────────────────────────────────

@app.route("/sensor-data", methods=["POST"])
def receive_data():
    """Endpoint for the physical ARIES device to push data."""
    global latest_reading
    
    raw = request.json
    print("\n⚡ [ARIES] SENSOR DATA RECEIVED:", raw)
    
    try:
        t = float(raw.get("temperature", 25.0))
        h = float(raw.get("humidity", 60.0))
        s = float(raw.get("soil_moisture", 1500))
        did = raw.get("device_id", "unknown")
        
        # Determine actual or simulated additional fields
        if all(k in raw for k in ("ph", "N", "P", "K")):
            ph, N, P, K = float(raw["ph"]), float(raw["N"]), float(raw["P"]), float(raw["K"])
            sim = False
        else:
            ph, N, P, K = simulate_ph_npk(t, h, s)
            sim = True
            
        fd = {"temperature": t, "humidity": h, "soil_moisture": s, "ph": ph, "N": N, "P": P, "K": K}
        
        # Build analyses
        crop = analyze_crop_health(fd)
        nutr = analyze_nutrient_deficiency(N, P, K, ph)
        irg = analyze_irrigation(s, t, h, N, P, K, ph)
        fcast = analyze_forecast(history)
        anom = analyze_anomaly(history, fd)
        imps = get_feat_importances()
        
        timestamp = datetime.now().isoformat()
        
        # Cache for anomaly/forecasting
        history.append({**fd, "device_id": did, "timestamp": timestamp, "simulated_npk_ph": sim})

        # Assemble final payload
        payload = {
            "device_id": did,
            "timestamp": timestamp,
            "sensor_readings": {**fd, "simulated_npk_ph": sim},
            "crop_health": crop,
            "nutrient_deficiency": nutr,
            "irrigation_fertilization": irg,
            "forecast": fcast,
            "anomaly": anom,
            "feature_importance": imps
        }
        
        latest_reading = payload
        
        # Optional: Save raw readings to Supabase
        if supabase:
            try:
                # Assuming table 'sensor_readings' exists with these columns
                supabase.table("sensor_readings").insert({
                    "device_id": did,
                    "temperature": t, "humidity": h, "soil_moisture": s,
                    "ph": ph, "nitrogen": N, "phosphorus": P, "potassium": K,
                    "simulated": sim,
                    "stress_risk": crop["stress_probability"],
                    "anomaly_detected": anom["is_anomaly"]
                }).execute()
                print("☁️ DB Insert successful.")
            except Exception as e:
                print(f"⚠️ DB Insert failed (check table/schema): {e}")

        return jsonify({"status": "Success", "analyzed": True, "saved_to_db": bool(supabase)})
        
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 400


@app.route("/latest", methods=["GET"])
def get_latest():
    """Frontend requests this to render the UI."""
    if not latest_reading:
        return jsonify({"message": "No data available yet"})
    return jsonify(latest_reading)


@app.route("/history", methods=["GET"])
def get_history():
    return jsonify(list(history))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)