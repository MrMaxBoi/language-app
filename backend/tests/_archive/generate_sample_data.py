# backend/tests/generate_sample_data.py
import json
import random

def generate_sample_data(num_users=3, num_sessions=100, num_questions=100):
    users = [f"User{chr(65+i)}" for i in range(num_users)]  # UserA, UserB, UserC
    topics = ["grammar", "vocabulary", "particles", "listening", "reading"]
    
    data = []
    for session in range(1, num_sessions + 1):
        for user in users:
            # Each user sees one question per session
            question_id = random.randint(1, num_questions)
            topic = random.choice(topics)
            mastery = round(random.uniform(0.3, 1.0), 2)
            memory_strength = round(random.uniform(0.2, 1.0), 2)
            # Determine if this is a repeat for the user (if they've seen it before)
            # For simplicity, random chance
            is_repeat = random.random() < 0.3  # 30% chance repeat
            data.append({
                "user": user,
                "session_id": session,
                "question_id": question_id,
                "topic": topic,
                "mastery": mastery,
                "memoryStrength": memory_strength,
                "isRepeat": is_repeat
            })
    
    return data

if __name__ == "__main__":
    data = generate_sample_data()
    with open("session_logs.json", "w") as f:
        json.dump(data, f, indent=2)
    print(f"Generated {len(data)} session entries.")