from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection parameters
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "fee_benchmark")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_PORT = os.getenv("DB_PORT", "5432")

def get_db_connection():
    """Create a connection to the PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            cursor_factory=RealDictCursor  # Returns results as dictionaries
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

@app.route("/api/data", methods=["GET"])
def get_data():
    """
    Get all benchmark data, with optional filtering
    """
    # Extract query parameters
    geography = request.args.get("geography")
    business_type = request.args.get("businessType")
    company_size = request.args.get("companySize")
    
    # Start building the SQL query
    query = """
        SELECT 
            id, geography, business_type as "businessType", 
            company_size as "companySize", percentile_25 as "percentile25",
            median, percentile_75 as "percentile75", quarter
        FROM fee_benchmarks
        WHERE 1=1
    """
    params = []
    
    # Add filters if provided
    if geography:
        query += " AND geography = %s"
        params.append(geography)
    
    if business_type:
        query += " AND business_type = %s"
        params.append(business_type)
    
    if company_size:
        query += " AND company_size = %s"
        params.append(company_size)
    
    # Order by id
    query += " ORDER BY id"
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            results = cur.fetchall()
            # Convert RealDictRow objects to regular dictionaries
            data = [dict(row) for row in results]
            return jsonify(data)
    except Exception as e:
        print(f"Query error: {e}")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        conn.close()


@app.route("/api/filters", methods=["GET"])
def get_filters():
    """
    Get unique values for all filter options
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            # Get unique geographies
            cur.execute("SELECT DISTINCT geography FROM fee_benchmarks ORDER BY geography")
            geographies = [row["geography"] for row in cur.fetchall()]
            
            # Get unique business types
            cur.execute("SELECT DISTINCT business_type FROM fee_benchmarks ORDER BY business_type")
            business_types = [row["business_type"] for row in cur.fetchall()]
            
            # Get unique company sizes
            cur.execute("SELECT DISTINCT company_size FROM fee_benchmarks ORDER BY company_size")
            company_sizes = [row["company_size"] for row in cur.fetchall()]
            
            filters = {
                "geographies": geographies,
                "businessTypes": business_types,
                "companySizes": company_sizes
            }
            
            return jsonify(filters)
    except Exception as e:
        print(f"Query error: {e}")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        conn.close()


@app.route("/api/chart-data", methods=["GET"])
def get_chart_data():
    """
    Get data formatted for the charts
    """
    # Extract query parameters
    geography = request.args.get("geography")
    business_type = request.args.get("businessType")
    company_size = request.args.get("companySize")
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            # Start building the SQL query
            query = """
                SELECT 
                    id, geography, business_type as "businessType", 
                    company_size as "companySize", percentile_25 as "percentile25",
                    median, percentile_75 as "percentile75", quarter
                FROM fee_benchmarks
                WHERE 1=1
            """
            params = []
            
            # Add filters if provided
            if geography:
                query += " AND geography = %s"
                params.append(geography)
            
            if business_type:
                query += " AND business_type = %s"
                params.append(business_type)
            
            if company_size:
                query += " AND company_size = %s"
                params.append(company_size)
            
            # Order by quarter
            query += " ORDER BY quarter"
            
            cur.execute(query, params)
            filtered_data = [dict(row) for row in cur.fetchall()]
            
            # If no data after filtering, return empty response
            if not filtered_data:
                return jsonify({
                    "barChart": [],
                    "lineChart": []
                })
            
            # Get the latest quarter data for bar chart
            latest_quarter_query = """
                SELECT 
                    percentile_25 as "percentile25", median, 
                    percentile_75 as "percentile75", quarter
                FROM fee_benchmarks
                WHERE 1=1
            """
            latest_params = []
            
            # Add filters if provided
            if geography:
                latest_quarter_query += " AND geography = %s"
                latest_params.append(geography)
            
            if business_type:
                latest_quarter_query += " AND business_type = %s"
                latest_params.append(business_type)
            
            if company_size:
                latest_quarter_query += " AND company_size = %s"
                latest_params.append(company_size)
            
            latest_quarter_query += " ORDER BY quarter DESC LIMIT 1"
            
            cur.execute(latest_quarter_query, latest_params)
            latest = dict(cur.fetchone())
            
            bar_chart = [
                {"name": "25th Percentile", "value": latest["percentile25"]},
                {"name": "Median", "value": latest["median"]},
                {"name": "75th Percentile", "value": latest["percentile75"]}
            ]
            
            # Prepare trend data for line chart
            line_chart_query = """
                SELECT 
                    quarter, percentile_25 as "percentile25", 
                    median, percentile_75 as "percentile75"
                FROM fee_benchmarks
                WHERE 1=1
            """
            line_params = []
            
            # Add filters if provided
            if geography:
                line_chart_query += " AND geography = %s"
                line_params.append(geography)
            
            if business_type:
                line_chart_query += " AND business_type = %s"
                line_params.append(business_type)
            
            if company_size:
                line_chart_query += " AND company_size = %s"
                line_params.append(company_size)
            
            line_chart_query += " ORDER BY quarter"
            
            cur.execute(line_chart_query, line_params)
            trend_data = cur.fetchall()
            
            trends = []
            for row in trend_data:
                row_dict = dict(row)
                trends.append({
                    "quarter": row_dict["quarter"],
                    "25th Percentile": row_dict["percentile25"],
                    "Median": row_dict["median"],
                    "75th Percentile": row_dict["percentile75"]
                })
            
            return jsonify({
                "barChart": bar_chart,
                "lineChart": trends
            })
    except Exception as e:
        print(f"Query error: {e}")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        conn.close()


@app.route("/api/insights", methods=["GET"])
def get_insights():
    """
    Get analytical insights based on filtered data
    """
    # Extract query parameters
    geography = request.args.get("geography")
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
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            # Start building the SQL query
            query = """
                SELECT 
                    id, geography, business_type, company_size,
                    percentile_25, median, percentile_75, quarter
                FROM fee_benchmarks
                WHERE 1=1
            """
            params = []
            
            # Add filters if provided
            if geography:
                query += " AND geography = %s"
                params.append(geography)
            
            if business_type:
                query += " AND business_type = %s"
                params.append(business_type)
            
            if company_size:
                query += " AND company_size = %s"
                params.append(company_size)
            
            # Order by quarter for trend analysis
            query += " ORDER BY quarter"
            
            cur.execute(query, params)
            filtered_data = [dict(row) for row in cur.fetchall()]
            
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
            min_fee = min(item["percentile_25"] for item in filtered_data)
            max_fee = max(item["percentile_75"] for item in filtered_data)
            
            # Analyze trend if we have at least two quarters
            if len(filtered_data) > 1:
                first_median = filtered_data[0]["median"]
                last_median = filtered_data[-1]["median"]
                
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
                # Get the latest quarter data
                latest = sorted(filtered_data, key=lambda x: x["quarter"], reverse=True)[0]
                
                if current_fee < latest["percentile_25"]:
                    fee_analysis = "Your current fee is below the 25th percentile for your selected criteria."
                    fee_status = "competitive"
                elif current_fee < latest["median"]:
                    fee_analysis = "Your current fee is between the 25th percentile and median for your selected criteria."
                    fee_status = "average"
                elif current_fee < latest["percentile_75"]:
                    fee_analysis = "Your current fee is between the median and 75th percentile for your selected criteria."
                    fee_status = "above average"
                else:
                    fee_analysis = "Your current fee is above the 75th percentile for your selected criteria."
                    fee_status = "high"
                    alerts.append(f"Warning: Your current fee of ${current_fee} is above the 75th percentile (${latest['percentile_75']})")
            
            insights = {
                "averageMedian": round(avg_median),
                "feeRange": {"min": min_fee, "max": max_fee},
                "trendAnalysis": trend_text,
                "feeAnalysis": fee_analysis,
                "alerts": alerts
            }
            
            return jsonify(insights)
    except Exception as e:
        print(f"Query error: {e}")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)