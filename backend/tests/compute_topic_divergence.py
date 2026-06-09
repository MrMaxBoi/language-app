# backend/tests/compute_topic_divergence.py
import json
import numpy as np
from collections import Counter, defaultdict
from scipy.spatial.distance import jensenshannon, cosine

def load_session_data(filepath):
    with open(filepath) as f:
        return json.load(f)

def compute_topic_distributions(all_sessions):
    users = set(s['user'] for s in all_sessions)
    topic_counter = defaultdict(Counter)
    total = defaultdict(int)
    for s in all_sessions:
        topic_counter[s['user']][s['topic']] += 1
        total[s['user']] += 1
    distributions = {}
    for user in users:
        dist = {t: c / total[user] for t, c in topic_counter[user].items()}
        distributions[user] = dist
    return distributions, users

def compute_topic_divergence(all_sessions):
    distributions, users = compute_topic_distributions(all_sessions)
    all_topics = sorted(set(t for d in distributions.values() for t in d.keys()))
    
    results = {}
    for u1 in users:
        for u2 in users:
            if u1 >= u2:
                continue
            key = f"{u1}_vs_{u2}"
            p = np.array([distributions[u1].get(t, 0) for t in all_topics])
            q = np.array([distributions[u2].get(t, 0) for t in all_topics])
            js = jensenshannon(p, q, base=2) if p.sum() and q.sum() else 1.0
            cos = 1 - cosine(p, q) if (np.linalg.norm(p) and np.linalg.norm(q)) else 1.0
            results[key] = {
                "Jensen_Shannon_distance": round(float(js), 4),
                "Cosine_distance": round(float(cos), 4),
                "divergent": "Yes" if js > 0.15 else "No"
            }
    return results

if __name__ == "__main__":
    sessions = load_session_data("session_logs.json")
    divergence = compute_topic_divergence(sessions)
    with open("STRESS_TOPIC_DIVERGENCE.json", "w") as f:
        json.dump(divergence, f, indent=2)
    print("Written STRESS_TOPIC_DIVERGENCE.json")