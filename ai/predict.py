"""Command-line inference entry point for the student performance model.

Reads one JSON object from standard input and writes one JSON response to
standard output. Keeping the interface JSON-only makes it easy for the Node
backend to call without exposing the model file to the browser.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import pandas as pd


FEATURES = ("attendance", "previous_marks", "internal_marks")
MODEL_PATH = Path(__file__).with_name("student_performance_model.pkl")


def error(message: str) -> None:
    print(json.dumps({"success": False, "message": message}))
    raise SystemExit(1)


def main() -> None:
    try:
        payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else json.load(sys.stdin)
    except json.JSONDecodeError:
        error("Request must be valid JSON.")

    values: dict[str, float] = {}
    limits = {
        "attendance": (0, 100),
        "previous_marks": (0, 100),
        "internal_marks": (0, 30),
    }
    for feature in FEATURES:
        try:
            value = float(payload[feature])
        except (KeyError, TypeError, ValueError):
            error(f"{feature} is required and must be a number.")
        low, high = limits[feature]
        if not low <= value <= high:
            error(f"{feature} must be between {low} and {high}.")
        values[feature] = value

    if not MODEL_PATH.exists():
        error("Model file is missing. Run train_model.py first.")

    try:
        model = joblib.load(MODEL_PATH)
        sample = pd.DataFrame([[values[name] for name in FEATURES]], columns=FEATURES)
        prediction = str(model.predict(sample)[0])
        probabilities = dict(zip(model.classes_, model.predict_proba(sample)[0]))
        confidence = round(float(probabilities[prediction]) * 100, 1)
    except Exception as exc:  # Keep implementation details out of the API response.
        print(json.dumps({"success": False, "message": "The prediction model could not be loaded.", "detail": str(exc)}))
        raise SystemExit(1)

    suggestions = {
        "Excellent": "Maintain your study routine and continue challenging yourself.",
        "Good": "Keep attendance high and revise weak topics each week.",
        "Average": "Create a revision plan and ask faculty for support in difficult subjects.",
        "Poor": "Meet your faculty mentor soon and prioritise attendance and foundational revision.",
    }
    print(json.dumps({
        "success": True,
        "prediction": prediction,
        "confidence": confidence,
        "recommendation": suggestions[prediction],
        "features": values,
    }))


if __name__ == "__main__":
    main()
