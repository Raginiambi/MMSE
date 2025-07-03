from db import get_connection
from auth import hash_password

try:
    print("✅ Starting test...")
    conn = get_connection()
    cursor = conn.cursor()
    print("✅ Connected to DB!")

    cursor.execute(
        "INSERT INTO users (name, email, password_hash, age, gender) VALUES (%s, %s, %s, %s, %s)",
        ("Test User", "test@example.com", hash_password("1234"), 25, "Female")
    )

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Successfully inserted test user!")

except Exception as e:
    print("❌ Error:", e)
