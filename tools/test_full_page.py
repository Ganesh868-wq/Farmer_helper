import sys
import os
import time
import json
import threading
import subprocess
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Override database for testing
os.environ["DATABASE_PATH"] = str(Path(os.environ.get("TEMP", ".")) / "test_full_page.db")

from database import init_database
from app import app

PORT = 5099
results = {
    "completed": False,
    "console_errors": [],
    "checks": {}
}

def start_server():
    init_database()
    app.run(host="127.0.0.1", port=PORT, debug=False, use_reloader=False)

def test_full_application():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1.5)
    print(f"[TEST] Flask app running on http://127.0.0.1:{PORT}")

    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    edge_binary = next((p for p in edge_paths if os.path.exists(p)), None)
    if not edge_binary:
        print("[TEST ERROR] Edge browser binary not found.")
        sys.exit(1)

    # Launch Edge with remote debugging
    DEBUG_PORT = 9333
    cmd = [
        edge_binary,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"--remote-debugging-port={DEBUG_PORT}",
        f"http://127.0.0.1:{PORT}"
    ]
    print(f"[TEST] Launching headless browser with CDP on port {DEBUG_PORT}")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2.5)

    # Query CDP target list
    import urllib.request
    try:
        req = urllib.request.urlopen(f"http://127.0.0.1:{DEBUG_PORT}/json", timeout=5)
        targets = json.loads(req.read().decode("utf-8"))
        print(f"[TEST] Found {len(targets)} browser target(s)")
        
        # Connect to page target via websocket if possible, or verify via HTTP dump
    except Exception as e:
        print(f"[TEST WARNING] CDP query: {e}")

    # Also test by fetching rendered page DOM via Edge dump-dom
    dump_cmd = [
        edge_binary,
        "--headless=new",
        "--disable-gpu",
        "--dump-dom",
        f"http://127.0.0.1:{PORT}"
    ]
    dump_proc = subprocess.run(dump_cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore", timeout=15)
    html_out = dump_proc.stdout

    checks = {
        "has_canvas": '<canvas id="farmCanvas"' in html_out,
        "has_crop_recs_container": 'id="cropRecsContainer"' in html_out,
        "has_schemes_container": 'id="schemesContainer"' in html_out,
        "has_recipes_container": 'id="recipesContainer"' in html_out,
        "has_schemes_category_bar": 'id="schemesCategoryBar"' in html_out,
        "has_recipes_category_bar": 'id="recipesCategoryBar"' in html_out,
        "has_three_script": 'three.min.js' in html_out,
        "has_farm3d_script": 'farm3d.js' in html_out
    }

    print("\n--- DOM CHECKS ---")
    for k, v in checks.items():
        print(f"  {k}: {'PASS' if v else 'FAIL'}")

    try:
        proc.kill()
    except Exception:
        pass

    all_passed = all(checks.values())
    if not all_passed:
        print("[FAILURE] Not all DOM elements were rendered properly.")
        sys.exit(1)
    else:
        print("\n[SUCCESS] Full production DOM test passed!")

if __name__ == "__main__":
    test_full_application()
