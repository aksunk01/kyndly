from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database connection parameters
host = 'localhost'
database = 'postgres'
user = 'postgres'
password = 'jcpsAS4686'
port = '5432'

def get_connection():
    try:
        conn = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port,
            cursor_factory=RealDictCursor
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
    state = request.args.get("state")
    city = request.args.get("city")
    business_type = request.args.get("businessType")
    company_size = request.args.get("companySize")
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            query = """
                SELECT 
                    ack_id, 
                    sponsor_dfe_name as company,
                    spons_dfe_mail_us_city as city,
                    spons_dfe_mail_us_state as state,
                    business_code as businessType,
                    tot_active_partcp_cnt as companySize,
                    year,
                    pension_prem_paid_tot_amt as fee,
                    CONCAT('Q', CEIL(EXTRACT(MONTH FROM NOW())/3)) as quarter
                FROM company_2024
                WHERE 1=1
            """
            params = []

            # Add filters if provided
            if state:
                query += " AND spons_dfe_mail_us_state = %s"
                params.append(state)
            
            if city:
                query += " AND spons_dfe_mail_us_city = %s"
                params.append(city)
            
            if business_type:
                query += " AND business_code = %s"
                params.append(int(business_type))
            
            if company_size:
                query += " AND tot_active_partcp_cnt = %s"
                params.append(int(company_size))
            
            # Order by id
            query += " ORDER BY ack_id"
            
            cur.execute(query, params)
            results = cur.fetchall()
            
            # Process the data to match the frontend expectations
            data = []
            for row in results:
                # Calculate percentiles based on fee (for this example, using simple offsets)
                fee = row["fee"] if row["fee"] is not None else 0
                
                data.append({
                    "ack_id": row["ack_id"],
                    "state": row["state"],
                    "city": row["city"],
                    "businessType": row["businesstype"],
                    "companySize": row["companysize"],
                    "quarter": f"{row['year']} {row['quarter']}",
                    "percentile25": int(fee * 0.85),  # Simplified percentile calculation
                    "median": fee,
                    "percentile75": int(fee * 1.15)
                })
            
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
    # Get state parameter for city filtering
    state = request.args.get("state")
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            # Get unique states
            cur.execute("SELECT DISTINCT spons_dfe_mail_us_state FROM company_2024 WHERE spons_dfe_mail_us_state IS NOT NULL ORDER BY spons_dfe_mail_us_state")
            states = [row["spons_dfe_mail_us_state"] for row in cur.fetchall()]
            
            # Get cities (filtered by state if provided)
            if state:
                cur.execute("SELECT DISTINCT spons_dfe_mail_us_city FROM  company_2024 WHERE spons_dfe_mail_us_state = %s AND spons_dfe_mail_us_city IS NOT NULL ORDER BY spons_dfe_mail_us_city", [state])
            else:
                cur.execute("SELECT DISTINCT spons_dfe_mail_us_city FROM company_2024 WHERE spons_dfe_mail_us_city IS NOT NULL ORDER BY spons_dfe_mail_us_city")
            cities = [row["spons_dfe_mail_us_city"] for row in cur.fetchall()]
            
            # Get business types
            cur.execute("SELECT DISTINCT business_code FROM company_2024 WHERE business_code IS NOT NULL ORDER BY business_code")
            business_types = [row["business_code"] for row in cur.fetchall()]
            
            # Get company sizes
            cur.execute("SELECT DISTINCT tot_active_partcp_cnt FROM company_2024 WHERE tot_active_partcp_cnt IS NOT NULL ORDER BY tot_active_partcp_cnt")
            company_sizes = [row["tot_active_partcp_cnt"] for row in cur.fetchall()]
            
            return jsonify({
                "states": states,
                "cities": cities,
                "businessTypes": business_types,
                "companySizes": company_sizes
            })
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
    state = request.args.get("state")
    city = request.args.get("city")
    business_type = request.args.get("businessType")
    company_size = request.args.get("companySize")
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            query = """
                SELECT
                    year,
                    pension_prem_paid_tot_amt as fee
                FROM company_2024
                WHERE 1=1
            """
            params = []
            
            # Add filters if provided
            if state:
                query += " AND spons_dfe_mail_us_state = %s"
                params.append(state)
            
            if city:
                query += " AND spons_dfe_mail_us_city = %s"
                params.append(city)
            
            if business_type:
                query += " AND business_code = %s"
                params.append(int(business_type))
            
            if company_size:
                query += " AND tot_active_partcp_cnt = %s"
                params.append(int(company_size))
            
            # Order by year
            query += " ORDER BY year"
            
            cur.execute(query, params)
            results = [dict(row) for row in cur.fetchall()]
            
            if not results:
                return jsonify({
                    "barChart": [],
                    "lineChart": []
                })
            
            # Process data for charts
            fees_by_year = {}
            for row in results:
                year = row["year"]
                fee = row["fee"] if row["fee"] is not None else 0
                
                if year not in fees_by_year:
                    fees_by_year[year] = []
                
                fees_by_year[year].append(fee)
            
            # Calculate statistics for bar chart (latest year)
            bar_chart = []
            line_chart = []
            
            for year, fees in sorted(fees_by_year.items()):
                fees.sort()
                count = len(fees)
                
                if count > 0:
                    avg_fee = sum(fees) / count
                    percentile_25 = fees[int(count * 0.25)] if count >= 4 else fees[0]
                    median = fees[int(count * 0.5)] if count >= 2 else fees[0]
                    percentile_75 = fees[int(count * 0.75)] if count >= 4 else fees[-1]
                    
                    line_chart.append({
                        "quarter": f"{year} Q4",
                        "25th Percentile": percentile_25,
                        "Median": median,
                        "75th Percentile": percentile_75
                    })
            
            # Use the latest year for bar chart
            if line_chart:
                latest_data = line_chart[-1]
                bar_chart = [
                    {"name": "25th Percentile", "value": latest_data["25th Percentile"]},
                    {"name": "Median", "value": latest_data["Median"]},
                    {"name": "75th Percentile", "value": latest_data["75th Percentile"]}
                ]
            
            return jsonify({
                "barChart": bar_chart,
                "lineChart": line_chart
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
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            query = """
                SELECT
                    year,
                    pension_prem_paid_tot_amt as fee
                FROM company_2024
                WHERE pension_prem_paid_tot_amt IS NOT NULL
            """
            params = []
            
            # Add filters if provided
            if state:
                query += " AND spons_dfe_mail_us_state = %s"
                params.append(state)
            
            if city:
                query += " AND spons_dfe_mail_us_city = %s"
                params.append(city)
            
            if business_type:
                query += " AND business_code = %s"
                params.append(int(business_type))
            
            if company_size:
                query += " AND tot_active_partcp_cnt = %s"
                params.append(int(company_size))
            
            # Order by year
            query += " ORDER BY year"
            
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
            
            # Calculate insights based on fees
            fees = [item["fee"] for item in filtered_data]
            fees.sort()
            
            # Calculate percentiles
            percentile_25 = fees[int(len(fees) * 0.25)] if len(fees) >= 4 else fees[0]
            median = fees[int(len(fees) * 0.5)] if len(fees) >= 2 else fees[0]
            percentile_75 = fees[int(len(fees) * 0.75)] if len(fees) >= 4 else fees[-1]
            
            avg_median = sum(fees) / len(fees)
            min_fee = min(fees)
            max_fee = max(fees)
            
            # Group data by year for trend analysis
            data_by_year = {}
            for item in filtered_data:
                year = item["year"]
                if year not in data_by_year:
                    data_by_year[year] = []
                data_by_year[year].append(item["fee"])
            
            # Analyze trend if we have at least two years
            years = sorted(data_by_year.keys())
            if len(years) > 1:
                first_year = years[0]
                last_year = years[-1]
                
                first_year_avg = sum(data_by_year[first_year]) / len(data_by_year[first_year])
                last_year_avg = sum(data_by_year[last_year]) / len(data_by_year[last_year])
                
                if last_year_avg > first_year_avg:
                    trend_pct = ((last_year_avg - first_year_avg) / first_year_avg) * 100
                    trend_text = f"Fees have increased by {round(trend_pct)}% from {first_year} to {last_year}."
                else:
                    trend_pct = ((first_year_avg - last_year_avg) / first_year_avg) * 100
                    trend_text = f"Fees have decreased by {round(trend_pct)}% from {first_year} to {last_year}."
            else:
                trend_text = "Insufficient data to determine trend."
            
            # Fee analysis based on current fee
            alerts = []
            fee_analysis = "No current fee provided for analysis."
            
            if current_fee > 0:
                if current_fee < percentile_25:
                    fee_analysis = "Your current fee is below the 25th percentile for your selected criteria."
                    fee_status = "competitive"
                elif current_fee < median:
                    fee_analysis = "Your current fee is between the 25th percentile and median for your selected criteria."
                    fee_status = "average"
                elif current_fee < percentile_75:
                    fee_analysis = "Your current fee is between the median and 75th percentile for your selected criteria."
                    fee_status = "above average"
                else:
                    fee_analysis = "Your current fee is above the 75th percentile for your selected criteria."
                    fee_status = "high"
                    alerts.append(f"Warning: Your current fee of ${current_fee} is above the 75th percentile (${percentile_75})")
            
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
    port = int(os.environ.get("PORT", 5000))
    app.run(host = "0.0.0.0", port = port, debug = True)