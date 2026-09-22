import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
from pathlib import Path

# Sample student training data
data = {
    "attendance": [
        95, 90, 85, 80, 75,
        70, 65, 60, 55, 50,
        92, 88, 82, 78, 72,
        68, 63, 58, 53, 48,
        97, 93, 87, 81, 76
    ],

    "previous_marks": [
        90, 85, 82, 78, 75,
        70, 68, 65, 60, 55,
        88, 84, 80, 76, 72,
        67, 62, 58, 54, 50,
        95, 91, 86, 79, 74
    ],

    "internal_marks": [
        28, 27, 26, 25, 24,
        23, 22, 21, 20, 18,
        27, 26, 25, 24, 23,
        22, 21, 19, 18, 17,
        29, 28, 27, 25, 24
    ],

    "performance": [
        "Excellent",
        "Excellent",
        "Excellent",
        "Good",
        "Good",
        "Good",
        "Average",
        "Average",
        "Poor",
        "Poor",
        "Excellent",
        "Excellent",
        "Good",
        "Good",
        "Good",
        "Average",
        "Average",
        "Poor",
        "Poor",
        "Poor",
        "Excellent",
        "Excellent",
        "Excellent",
        "Good",
        "Good"
    ]
}

df = pd.DataFrame(data)

# Input features
X = df[
    [
        "attendance",
        "previous_marks",
        "internal_marks"
    ]
]

# Target
y = df["performance"]

# Split training and testing data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Create ML model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

# Test model
predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(
    f"Model Accuracy: {accuracy * 100:.2f}%"
)

# Save trained model
model_path = Path(__file__).with_name("student_performance_model.pkl")
joblib.dump(model, model_path)

print(
    "AI model trained successfully!"
)

print(
    f"Model saved as {model_path.name}"
)
