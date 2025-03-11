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
    ack_id INT,
    name VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    size INT,
    code INT,
    provider VARCHAR(255),
    plan_name VARCHAR(255),
    paid INT
)
'''



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
    
    data_frame = d.get_data('f_5500_2024_latest.csv', 'F_SCH_A_2024_latest.csv')
    
    
    

    cursor.execute(create_table)
    

    connection.commit()
    print("Tables made")

    
except Exception as e:
    print(f"Error: {e}")

# Close connection
cursor.close()
connection.close()
print("Connection closed")
