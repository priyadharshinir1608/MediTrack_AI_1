def predict_low_stock(current_quantity, avg_daily_sales, threshold=10):
    """
    Predicts stock-out risk based on current inventory and daily consumption rate.
    """
    if avg_daily_sales <= 0:
        days_until_stockout = 999
    else:
        days_until_stockout = round(current_quantity / avg_daily_sales, 1)

    is_low_stock = current_quantity <= threshold or days_until_stockout <= 7
    urgency = "HIGH" if current_quantity <= threshold / 2 or days_until_stockout <= 3 else ("MEDIUM" if is_low_stock else "LOW")

    return {
        "isLowStock": is_low_stock,
        "daysUntilStockout": days_until_stockout if days_until_stockout < 999 else "N/A",
        "recommendedReorderQty": max(0, (threshold * 3) - current_quantity),
        "urgency": urgency
    }
