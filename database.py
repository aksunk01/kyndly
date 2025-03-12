import psycopg2
import pandas as pd
import numpy as np
import data as d
from sqlalchemy import create_engine


# Database connection details
host = 'localhost'
database = 'postgres'
user = 'postgres'
password = 'jcpsAS4686'
port = '5435'

create_table = '''
CREATE TABLE company_2024(
    id SERIAL PRIMARY KEY,
    ack_id VARCHAR(255),
    sponsor_dfe_name VARCHAR(100),
    spons_dfe_mail_us_city VARCHAR(100),
    spons_dfe_mail_us_state VARCHAR(2),
    tot_active_partcp_cnt INT,
    business_code INT,
    ins_carrier_name VARCHAR(255),
    plan_name VARCHAR(255),
    pension_prem_paid_tot_amt INT
)
'''
drop_table = "DROP TABLE IF EXISTS company_2024 CASCADE;"


try:
    connection = psycopg2.connect(
        host=host,
        database=database,
        user=user,
        password=password,
        port=port
    )
    cursor = connection.cursor()
    print("Connection established")
    print("Starting...")
    
  

    
    
    data_frame = d.get_data('f_5500_2024_latest.csv', 'F_SCH_A_2024_latest.csv')
    
    data_frame.columns = data_frame.columns.str.lower()
    
    db_url = f'postgresql://{user}:{password}@localhost:{port}/{database}'
    engine = create_engine(db_url)

    data_frame.to_sql('company_2024', engine, if_exists='append', index = False)
    print("Data inserted")
    
    

    connection.commit()
    print("Tables made")

    
except Exception as e:
    print(f"Error: {e}")

# Close connection
cursor.close()
connection.close()
print("Connection closed")
