# train_crop_stress_model.py

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# -----------------------------
# 1️⃣ Dataset Loading
# -----------------------------
url = "https://raw.githubusercontent.com/nileshely/Crop-Recommendation/main/Crop_Recommendation.csv"
df = pd.read_csv(url)
print("✅ Dataset loaded. Shape:", df.shape)

# -----------------------------
# 2️⃣ Create Stress Label
# -----------------------------
def stress_label(row):
    """
    Label crops as stressed (1) if any of the key features are outside healthy range.
    """
    if row['Nitrogen'] < 50 or row['Nitrogen'] > 200 or \
       row['Phosphorus'] < 20 or row['Phosphorus'] > 100 or \
       row['Potassium'] < 20 or row['Potassium'] > 200 or \
       row['Temperature'] < 20 or row['Temperature'] > 35 or \
       row['Humidity'] < 30 or row['Humidity'] > 90 or \
       row['pH_Value'] < 5.5 or row['pH_Value'] > 7.5:
        return 1  # stressed/disease risk
    return 0  # healthy

df['stress_label'] = df.apply(stress_label, axis=1)
print("✅ Stress labels created. Sample:")
print(df[['Nitrogen','Phosphorus','Potassium','Temperature','Humidity','pH_Value','stress_label']].head())

# -----------------------------
# 3️⃣ Features & Target
# -----------------------------
features = ['Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Humidity', 'pH_Value']
X = df[features]
y = df['stress_label']

# -----------------------------
# 4️⃣ Train Random Forest
# -----------------------------
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X, y)
print("✅ Random Forest trained!")

# -----------------------------
# 5️⃣ Save Model
# -----------------------------
MODEL_PATH = "crop_stress_model.pkl"
joblib.dump(clf, MODEL_PATH)
print(f"✅ Model saved to {MODEL_PATH}")