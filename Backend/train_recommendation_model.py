import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# ===============================
# 1. Load Dataset
# ===============================

data = pd.read_csv("Crop_recommendation.csv")

print("Dataset loaded successfully")
print(data.head())

# ===============================
# 2. Separate Features and Labels
# ===============================

X = data[['N','P','K','temperature','humidity','ph','rainfall']]
y = data['label']

# ===============================
# 3. Train Test Split
# ===============================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

# ===============================
# 4. Create Model
# ===============================

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    random_state=42
)

# ===============================
# 5. Train Model
# ===============================

model.fit(X_train, y_train)

print("Model training completed")

# ===============================
# 6. Test Model
# ===============================

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\nModel Accuracy:", accuracy)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# ===============================
# 7. Save Model
# ===============================

joblib.dump(model, "crop_model.pkl")

print("\nModel saved as crop_model.pkl")

# ===============================
# 8. Test Prediction
# ===============================

sample = np.array([[90, 40, 40, 25, 80, 6.5, 200]])

prediction = model.predict(sample)

print("\nSample Prediction:", prediction[0])