# backend/tests/compute_reinforcement_quality.py
import json

def load_session_data(filepath):
    with open(filepath) as f:
        return json.load(f)

def compute_repeat_quality(all_sessions, mastery_threshold=0.8, strength_threshold=0.7):
    users = set(s['user'] for s in all_sessions)
    results = {}
    for user in users:
        user_sessions = [s for s in all_sessions if s['user'] == user]
        total_repeats = sum(1 for s in user_sessions if s.get('isRepeat', False))
        if total_repeats == 0:
            continue
        useful = sum(1 for s in user_sessions 
                     if s.get('isRepeat', False) and 
                     (s.get('mastery', 1) < mastery_threshold or 
                      s.get('memoryStrength', 1) < strength_threshold))
        results[user] = {
            "repeatRate": round(total_repeats / len(user_sessions) * 100, 2),
            "usefulRepeatRate": round(useful / total_repeats * 100, 2),
            "wastefulRepeatRate": round((total_repeats - useful) / total_repeats * 100, 2)
        }
    return results

if __name__ == "__main__":
    sessions = load_session_data("session_logs.json")
    quality = compute_repeat_quality(sessions)
    with open("STRESS_REINFORCEMENT_QUALITY.json", "w") as f:
        json.dump(quality, f, indent=2)
    print("Written STRESS_REINFORCEMENT_QUALITY.json")