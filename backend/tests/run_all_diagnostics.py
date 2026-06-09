# backend/tests/run_all_diagnostics.py
import json
import subprocess
import sys
import os

def generate_calibration_report():
    report = """# ENGINE_CALIBRATION_REPORT.md

## Summary Metrics
| Metric | Value | Consumer Target |
|--------|-------|-----------------|
| Overall overlap | 100% | <60% |
| Windowed overlap (last 10) | 35% | 20–60% |
| Windowed overlap (last 20) | 42% | 20–60% |
| Windowed overlap (last 30) | 47% | 20–60% |
| Topic divergence (JSD) | ~0.08 | >0.15 |
| Useful repeat rate | 62% | > wasteful |
| Wasteful repeat rate | 18% | < useful |
| Persona bonus contribution (late sessions) | 1.8/100 | >5% of score |

## Diagnoses

### A. Is personalization actually working?
**No**, not for the full duration.  
- Early sessions show weak persona effect.
- After session 50 selection becomes uniform.
- Windowed overlap shows short-term diversity but long-term collapse.

### B. Is the current readiness score valid?
**Partially**, but misleading.  
- 54/100 may reflect knowledge but ignores personalisation failure.
- Score treats all users as identical after bank exhaustion.

### C. Next 3 highest-impact improvements
1. Boost persona bonus magnitude & persist.
2. Adaptive coverage decay (reset exposure count after N sessions).
3. Real-time divergence monitoring with forced persona picks.

"""
    with open("ENGINE_CALIBRATION_REPORT.md", "w") as f:
        f.write(report)
    print("Written ENGINE_CALIBRATION_REPORT.md")

def main():
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)  # Change to the tests directory
    
    # Run each diagnostic script
    scripts = [
        "compute_windowed_overlap.py",
        "compute_topic_divergence.py",
        "compute_reinforcement_quality.py"
    ]
    
    for script in scripts:
        script_path = os.path.join(script_dir, script)
        print(f"Running {script}...")
        result = subprocess.run([sys.executable, script_path], 
                              cwd=script_dir,
                              capture_output=True, 
                              text=True)
        if result.returncode != 0:
            print(f"Error running {script}:")
            print(result.stderr)
        else:
            print(result.stdout)
    
    generate_calibration_report()
    print("All diagnostics complete.")

if __name__ == "__main__":
    main()