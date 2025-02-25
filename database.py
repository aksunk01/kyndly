import psycopg2
from psycopg2 import sql
import pandas as pd

host = 'localhost'
database = 'postgres'
user = 'postgres'
password = 'jcpsAS4686'
port = '5435'


def load_to_table():
    print("hello")


try:
    connection = psycopg2.connect(
        host = host,
        database = database,
        user = user,
        password = password,
        port = port
    )
    print("Connection established")

    cursor = connection.cursor()
    
    create_table_query = '''
    CREATE TABLE IF NOT EXISTS form_5500_filings_2024(
        id SERIAL PRIMARY KEY,
        ack_id VARCHAR(50) UNIQUE NOT NULL,
        plan_year_being_date DATE NOT NULL,
        plan_year_end_date DATE NOT NULL,
        plan_name VARCHAR(255),
        sponsor_name VARCHAR(255),
        sponsor_state VARCHAR(2),
        sponsor_zip VARCHAR(10),
        buisness_code VARCHAR(10),
        naics_code VARCHAR(6),
        total_participants INTEGER,
        active_participants INTEGER,
        total_assets NUMERIC(18,2),
        total_contributions NUMERIC(18,2),
        broker_fees NUMERIC(18,2),
        insurance_contractfees NUMERIC(18,2),
        total_fees_paid NUMERIC(18,2)
        
    );

    
    CREATE TABLE form_5500_filings_2023 (LIKE form_5500_filings_2024 INCLUDING ALL);
    CREATE TABLE form_5500_filings_2022 (LIKE form_5500_filings_2024 INCLUDING ALL);    
    ''' 

    connection.commit()
    

except Exception as e:
    print(f"Error: {e}")
finally:
    if connection:
        cursor.close()
        connection.close()
        print("Connection closed")