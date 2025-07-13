from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Updated sample data with state and city fields instead of geography
sample_data = [
    {
        "id": 1,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Educational Services",
        "companySize": "150-200",
        "percentile25": 2500,
        "median": 3200,
        "percentile75": 4100,
        "quarter": "Q1 2024",
    },
    {
        "id": 2,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Educational Services",
        "companySize": "150-200",
        "percentile25": 2600,
        "median": 3300,
        "percentile75": 4200,
        "quarter": "Q2 2024",
    },
    {
        "id": 3,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Educational Services",
        "companySize": "150-200",
        "percentile25": 2700,
        "median": 3400,
        "percentile75": 4300,
        "quarter": "Q3 2024",
    },
    {
        "id": 4,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Healthcare",
        "companySize": "150-200",
        "percentile25": 3100,
        "median": 3900,
        "percentile75": 4800,
        "quarter": "Q1 2024",
    },
    {
        "id": 5,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Healthcare",
        "companySize": "150-200",
        "percentile25": 3200,
        "median": 4000,
        "percentile75": 4900,
        "quarter": "Q2 2024",
    },
    {
        "id": 6,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Healthcare",
        "companySize": "150-200",
        "percentile25": 3300,
        "median": 4100,
        "percentile75": 5000,
        "quarter": "Q3 2024",
    },
    {
        "id": 7,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Educational Services",
        "companySize": "200-250",
        "percentile25": 3200,
        "median": 4100,
        "percentile75": 5200,
        "quarter": "Q1 2024",
    },
    {
        "id": 8,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Educational Services",
        "companySize": "200-250",
        "percentile25": 3300,
        "median": 4200,
        "percentile75": 5300,
        "quarter": "Q2 2024",
    },
    {
        "id": 9,
        "state": "Texas",
        "city": "Dallas",
        "businessType": "Educational Services",
        "companySize": "200-250",
        "percentile25": 3400,
        "median": 4300,
        "percentile75": 5400,
        "quarter": "Q3 2024",
    },
    {
        "id": 10,
        "state": "Texas",
        "city": "Houston",
        "businessType": "Educational Services",
        "companySize": "150-200",
        "percentile25": 2300,
        "median": 3000,
        "percentile75": 3800,
        "quarter": "Q1 2024",
    },
    {
        "id": 11,
        "state": "Texas",
        "city": "Houston",
        "businessType": "Educational Services",
        "companySize": "150-200",
        "percentile25": 2400,
        "median": 3100,
        "percentile75": 3900,
        "quarter": "Q2 2024",
    },
    {
        "id": 12,
        "state": "Texas",
        "city": "Houston",
        "businessType": "Educational Services",
        "companySize": "150-200",
        "percentile25": 2500,
        "median": 3200,
        "percentile75": 4000,
        "quarter": "Q3 2024",
    },
    {
        "id": 13,
        "state": "California",
        "city": "Los Angeles",
        "businessType": "Educational Services",
        "companySize": "150-200",
        "percentile25": 3200,
        "median": 4100,
        "percentile75": 5200,
        "quarter": "Q1 2024",
    },
    {
        "id": 14,
        "state": "California",
        "city": "San Francisco",
        "businessType": "Healthcare",
        "companySize": "200-250",
        "percentile25": 4100,
        "median": 5200,
        "percentile75": 6300,
        "quarter": "Q2 2024",
    }
]


@app.route("/api/data", methods=["GET"])
def get_data():
    """
    Get all benchmark data, with optional filtering
    """
    # Extract query parameters
    state = request.args.get("state")
    city = request.args.get("city")
    business_type = request.args.get("businessType")
    company_size = request.args.get("companySize")
    
    # Start with all data
    filtered_data = sample_data.copy()
    
    # Apply filters if provided
    if state:
        filtered_data = [item for item in filtered_data if item["state"] == state]
    
    if city:
        filtered_data = [item for item in filtered_data if item["city"] == city]
    
    if business_type:
        filtered_data = [item for item in filtered_data if item["businessType"] == business_type]
    
    if company_size:
        filtered_data = [item for item in filtered_data if item["companySize"] == company_size]
    
    return jsonify(filtered_data)


@app.route("/api/filters", methods=["GET"])
def get_filters():
    """
    Get unique values for all filter options
    """
    # Extract unique values
    states = sorted(list(set(item["state"] for item in sample_data)))
    cities = sorted(list(set(item["city"] for item in sample_data)))
    business_types = sorted(list(set(item["businessType"] for item in sample_data)))
    company_sizes = sorted(list(set(item["companySize"] for item in sample_data)))
    
    filters = {
        "states": states,
        "cities": cities,
        "businessTypes": business_types,
        "companySizes": company_sizes
    }
    
    # Optional: Get cities specific to a state if state parameter is provided
    state_param = request.args.get("state")
    if state_param:
        state_cities = sorted(list(set(item["city"] for item in sample_data if item["state"] == state_param)))
        filters["cities"] = state_cities
    
    return jsonify(filters)


@app.route("/api/chart-data", methods=["GET"])
def get_chart_data():
    """
    Get data formatted for the charts
    """
    # Extract query parameters
    state = request.args.get("state")
    city = request.args.get("city")
    business_type = request.args.get("businessType")
    company_size = request.args.get("companySize")
    
    # Start with all data
    filtered_data = sample_data.copy()
    
    # Apply filters if provided
    if state:
        filtered_data = [item for item in filtered_data if item["state"] == state]
    
    if city:
        filtered_data = [item for item in filtered_data if item["city"] == city]
    
    if business_type:
        filtered_data = [item for item in filtered_data if item["businessType"] == business_type]
    
    if company_size:
        filtered_data = [item for item in filtered_data if item["companySize"] == company_size]
    
    # If no data after filtering, return empty response
    if not filtered_data:
        return jsonify({
            "barChart": [],
            "lineChart": []
        })
    
    # Get the latest quarter data for bar chart
    latest = sorted(filtered_data, key=lambda x: x["quarter"], reverse=True)[0]
    bar_chart = [
        {"name": "25th Percentile", "value": latest["percentile25"]},
        {"name": "Median", "value": latest["median"]},
        {"name": "75th Percentile", "value": latest["percentile75"]}
    ]
    
    # Prepare trend data for line chart
    quarters = sorted(list(set(item["quarter"] for item in filtered_data)))
    trends = []
    
    for quarter in quarters:
        quarter_data = next((item for item in filtered_data if item["quarter"] == quarter), None)
        if quarter_data:
            trends.append({
                "quarter": quarter,
                "25th Percentile": quarter_data["percentile25"],
                "Median": quarter_data["median"],
                "75th Percentile": quarter_data["percentile75"]
            })
    
    return jsonify({
        "barChart": bar_chart,
        "lineChart": trends
    })


@app.route("/api/insights", methods=["GET"])
def get_insights():
    """
    Get analytical insights based on filtered data
    """
    # Extract query parameters
    state = request.args.get("state")
    city = request.args.get("city")
    business_type = request.args.get("businessType")
    company_size = request.args.get("companySize")
    current_fee = request.args.get("currentFee")
    
    # Convert current_fee to float if provided
    if current_fee:
        try:
            current_fee = float(current_fee)
        except ValueError:
            current_fee = 0
    else:
        current_fee = 0
    
    # Start with all data
    filtered_data = sample_data.copy()
    
    # Apply filters if provided
    if state:
        filtered_data = [item for item in filtered_data if item["state"] == state]
    
    if city:
        filtered_data = [item for item in filtered_data if item["city"] == city]
    
    if business_type:
        filtered_data = [item for item in filtered_data if item["businessType"] == business_type]
    
    if company_size:
        filtered_data = [item for item in filtered_data if item["companySize"] == company_size]
    
    # If no data after filtering, return empty insights
    if not filtered_data:
        return jsonify({
            "averageMedian": 0,
            "feeRange": {"min": 0, "max": 0},
            "trendAnalysis": "Insufficient data to determine trend.",
            "feeAnalysis": "No data available for comparison.",
            "alerts": []
        })
    
    # Calculate insights
    avg_median = sum(item["median"] for item in filtered_data) / len(filtered_data)
    min_fee = min(item["percentile25"] for item in filtered_data)
    max_fee = max(item["percentile75"] for item in filtered_data)
    
    # Sort by quarter for trend analysis
    sorted_data = sorted(filtered_data, key=lambda x: x["quarter"])
    
    # Analyze trend if we have at least two quarters
    if len(sorted_data) > 1:
        first_median = sorted_data[0]["median"]
        last_median = sorted_data[-1]["median"]
        
        if last_median > first_median:
            trend_pct = ((last_median - first_median) / first_median) * 100
            trend_text = f"Fees have increased by {round(trend_pct)}% over the displayed period."
        else:
            trend_pct = ((first_median - last_median) / first_median) * 100
            trend_text = f"Fees have decreased by {round(trend_pct)}% over the displayed period."
    else:
        trend_text = "Insufficient data to determine trend."
    
    # Fee analysis based on current fee
    alerts = []
    fee_analysis = "No current fee provided for analysis."
    
    if current_fee > 0 and filtered_data:
        latest = sorted(filtered_data, key=lambda x: x["quarter"], reverse=True)[0]
        
        if current_fee < latest["percentile25"]:
            fee_analysis = "Your current fee is below the 25th percentile for your selected criteria."
            fee_status = "competitive"
        elif current_fee < latest["median"]:
            fee_analysis = "Your current fee is between the 25th percentile and median for your selected criteria."
            fee_status = "average"
        elif current_fee < latest["percentile75"]:
            fee_analysis = "Your current fee is between the median and 75th percentile for your selected criteria."
            fee_status = "above average"
        else:
            fee_analysis = "Your current fee is above the 75th percentile for your selected criteria."
            fee_status = "high"
            alerts.append(f"Warning: Your current fee of ${current_fee} is above the 75th percentile (${latest['percentile75']})")
    
    insights = {
        "averageMedian": round(avg_median),
        "feeRange": {"min": min_fee, "max": max_fee},
        "trendAnalysis": trend_text,
        "feeAnalysis": fee_analysis,
        "alerts": alerts
    }
    
    return jsonify(insights)


if __name__ == "__main__":
    app.run(debug=True, port=5000)