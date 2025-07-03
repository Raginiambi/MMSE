from db import get_connection

def load_mmse_questions():
    questions = [
        # Orientation
        ("What is the year?", "Orientation", 1),
        ("What is the season?", "Orientation", 1),
        ("What is the date today?", "Orientation", 1),
        ("What day of the week is it?", "Orientation", 1),
        ("What is the name of this place?", "Orientation", 1),
        
        # Registration
        ("I will name 3 objects. After I say them, repeat all three.", "Registration", 3),

        # Attention
        ("Subtract 7 from 100, and then keep subtracting 7 (5 times).", "Attention", 5),

        # Recall
        ("Can you recall the 3 objects I named earlier?", "Recall", 3),

        # Language
        ("Name the object I’m holding (e.g., pencil).", "Language", 1),
        ("Repeat this phrase: 'No ifs, ands, or buts.'", "Language", 1),
        ("Follow a 3-stage command: 'Take this paper in your right hand, fold it in half, and place it on the floor.'", "Language", 3),
        ("Read and obey this: 'Close your eyes.'", "Language", 1),
        ("Write a sentence of your choosing.", "Language", 1),
        ("Copy this drawing of intersecting pentagons.", "Language", 1)
    ]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.executemany(
        "INSERT INTO mmse_questions (question_text, category, max_score) VALUES (%s, %s, %s)",
        questions
    )

    conn.commit()
    cursor.close()
    conn.close()
    print(f"{len(questions)} MMSE questions loaded successfully.")

if __name__ == "__main__":
    load_mmse_questions()
