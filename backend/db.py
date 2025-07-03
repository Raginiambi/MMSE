import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="R@g!n!22",
        database="mmse_db"
    )
