from datetime import datetime

def predict_expiry_risk(expiry_date_str, current_quantity=10, avg_daily_sales=1):
    """
    Evaluates expiration risk by comparing remaining shelf life against sale velocity.
    """
    try:
        # Simple date parse
        formats = ["%Y-%m-%d", "%m/%Y", "%d/%m/%Y", "%m-%Y"]
        exp_date = None
        for fmt in formats:
            try:
                exp_date = datetime.strptime(expiry_date_str, fmt)
                break
            except ValueError:
                pass

        if not exp_date:
            return {"status": "UNKNOWN", "daysRemaining": None, "riskScore": 0}

        now = datetime.now()
        days_remaining = (exp_date - now).days

        if days_remaining <= 0:
            return {"status": "EXPIRED", "daysRemaining": 0, "riskScore": 100, "recommendation": "Dispose immediately"}

        days_to_sell_all = (current_quantity / avg_daily_sales) if avg_daily_sales > 0 else 999

        if days_remaining < 30 or days_to_sell_all > days_remaining:
            risk_score = round(min(100, (1 - (days_remaining / max(1, days_to_sell_all))) * 100))
            return {
                "status": "CRITICAL",
                "daysRemaining": days_remaining,
                "riskScore": max(60, risk_score),
                "recommendation": "Offer discount or prioritize sale"
            }
        elif days_remaining <= 90:
            return {
                "status": "WARNING",
                "daysRemaining": days_remaining,
                "riskScore": 40,
                "recommendation": "Monitor inventory closely"
            }
        else:
            return {
                "status": "HEALTHY",
                "daysRemaining": days_remaining,
                "riskScore": 10,
                "recommendation": "Stock level optimal"
            }
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}
