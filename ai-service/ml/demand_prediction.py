import numpy as np

def predict_demand(sales_history):
    """
    Predicts next month's medicine demand based on historical monthly sales array.
    Uses Scikit-Learn LinearRegression if available, otherwise falls back to numpy slope calculation.
    """
    if not sales_history or len(sales_history) < 2:
        avg_val = float(np.mean(sales_history)) if sales_history else 20.0
        return {
            "predictedDemand": round(avg_val * 1.1, 1),
            "trend": "STABLE",
            "confidence": 65
        }

    try:
        from sklearn.linear_model import LinearRegression
        X = np.array(range(len(sales_history))).reshape(-1, 1)
        y = np.array(sales_history)

        model = LinearRegression()
        model.fit(X, y)

        next_period = np.array([[len(sales_history)]])
        prediction = max(0.0, float(model.predict(next_period)[0]))

        slope = float(model.coef_[0])
        trend = "UPWARD" if slope > 0.5 else ("DOWNWARD" if slope < -0.5 else "STABLE")

        return {
            "predictedDemand": round(prediction, 1),
            "trend": trend,
            "confidence": 85
        }
    except ImportError:
        # Fallback NumPy linear trend estimation
        n = len(sales_history)
        x = np.array(range(n))
        y = np.array(sales_history)
        slope, intercept = np.polyfit(x, y, 1)
        prediction = max(0.0, float(slope * n + intercept))
        trend = "UPWARD" if slope > 0.5 else ("DOWNWARD" if slope < -0.5 else "STABLE")

        return {
            "predictedDemand": round(prediction, 1),
            "trend": trend,
            "confidence": 75,
            "note": "NumPy slope fallback active (install scikit-learn for full model)"
        }
