# backend/tests/compute_windowed_overlap.py
import json
from collections import defaultdict

def load_session_data(filepath):
    with open(filepath) as f:
        return json.load(f)

def compute_windowed_overlap(all_sessions):
    users = set(s['user'] for s in all_sessions)
    user_question_sequences = defaultdict(list)
    for s in all_sessions:
        user_question_sequences[s['user']].append(s['question_id'])
    
    results = {}
    for u1 in users:
        for u2 in users:
            if u1 >= u2:
                continue
            key = f"{u1}_vs_{u2}"
            seq1 = user_question_sequences[u1]
            seq2 = user_question_sequences[u2]
            # overall overlap
            set1 = set(seq1)
            set2 = set(seq2)
            overall = len(set1 & set2) / len(set1) * 100 if set1 else 0
            
            windows = {'last10': 10, 'last20': 20, 'last30': 30}
            windowed = {}
            for wname, wsize in windows.items():
                w1 = seq1[-wsize:] if len(seq1) >= wsize else seq1
                w2 = seq2[-wsize:] if len(seq2) >= wsize else seq2
                if not w1 or not w2:
                    overlap_window = 0
                else:
                    overlap_window = len(set(w1) & set(w2)) / len(set(w1)) * 100
                windowed[wname] = round(overlap_window, 2)
            
            results[key] = {
                "overall": round(overall, 2),
                **windowed
            }
    return results

if __name__ == "__main__":
    sessions = load_session_data("session_logs.json")
    win_overlap = compute_windowed_overlap(sessions)
    with open("STRESS_WINDOWED_OVERLAP.json", "w") as f:
        json.dump(win_overlap, f, indent=2)
    print("Written STRESS_WINDOWED_OVERLAP.json")