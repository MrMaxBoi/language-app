# backend/tests/persona_audit_logger.py
import json
from datetime import datetime

# Global counter for session order (you can inject current session ID)
_current_session_id = 0

def set_current_session(session_id):
    global _current_session_id
    _current_session_id = session_id

def log_selection(question_id, base_score, persona_bonus, final_score, topic, persona):
    entry = {
        "questionId": question_id,
        "baseScore": base_score,
        "personaBonus": persona_bonus,
        "finalScore": final_score,
        "topic": topic,
        "persona": persona,
        "sessionId": _current_session_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    with open("PERSONA_WEIGHT_AUDIT.json", "a") as f:
        f.write(json.dumps(entry) + "\n")

# Example usage in your engine (just for reference, not executed here):
# from persona_audit_logger import log_selection, set_current_session
# set_current_session(session.id)
# log_selection(q.id, base_score, persona_bonus, final_score, q.topic, persona_type)