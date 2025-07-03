from db import get_connection

try:
    conn = get_connection()
    print("✅ DB connected successfully!")
    conn.close()
except Exception as e:
    print("❌ DB connection failed:", e)
