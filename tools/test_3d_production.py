import sys
import os
import time
import json
import threading
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

PORT = 8999
BASE_DIR = Path(__file__).resolve().parent.parent

# Shared test result container
test_results = {
    "completed": False,
    "errors": [],
    "3d_initialized": False,
    "sectors_count": 0,
    "crops_populated": False,
    "drone_created": False,
    "details": {}
}

class TestServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_POST(self):
        if self.path == "/api/test-report":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body)
            test_results.update(data)
            test_results["completed"] = True
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        # Silence normal HTTP access logs
        pass

def run_test():
    # 1. Create a test verification runner HTML that loads index.html's exact canvas & scripts
    test_runner_html = BASE_DIR / "tools" / "test_runner.html"
    test_runner_html.write_text("""<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>3D Farm & CapsuleGeometry Test</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body style="background:#06150e;">
  <canvas id="farmCanvas" width="800" height="600" style="width:800px;height:600px;"></canvas>

  <script>
    window.testErrors = [];
    window.addEventListener('error', function(e) {
      window.testErrors.push({
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
      console.error("PAGE_ERROR:", e.message, e.filename, e.lineno);
    });

    window.addEventListener('unhandledrejection', function(e) {
      window.testErrors.push({
        message: e.reason ? (e.reason.message || String(e.reason)) : 'Unknown rejection',
        stack: e.reason ? e.reason.stack : ''
      });
      console.error("UNHANDLED_REJECTION:", e.reason);
    });
  </script>

  <script src="/static/js/translations.js"></script>
  <script src="/static/js/voice.js"></script>
  <script src="/static/js/farm3d.js"></script>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        const report = {
          errors: window.testErrors,
          "3d_initialized": false,
          sectors_count: 0,
          crops_populated: false,
          drone_created: false,
          details: {}
        };

        try {
          const visualizer = new Farm3DVisualizer('farmCanvas');
          if (visualizer && visualizer.scene) {
            report["3d_initialized"] = true;
            report.sectors_count = visualizer.cropSectors ? visualizer.cropSectors.length : 0;
            report.drone_created = !!visualizer.drone;
            
            // Check if scene has meshes and children
            const childCount = visualizer.scene.children.length;
            report.crops_populated = childCount >= 10;
            report.details = {
              sceneChildrenCount: childCount,
              sensorPinsCount: visualizer.sensorPins.length,
              threeVersion: (typeof THREE !== 'undefined') ? THREE.REVISION : 'missing',
              capsuleGeometryAvailable: (typeof THREE !== 'undefined' && typeof THREE.CapsuleGeometry !== 'undefined')
            };
          }
        } catch (err) {
          report.errors.push({
            message: err.message,
            stack: err.stack
          });
        }

        // Send report to python test server
        fetch('/api/test-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        }).catch(function(e) {
          console.error("Report send failed:", e);
        });
      }, 500);
    });
  </script>
</body>
</html>
""", encoding="utf-8")

    server = HTTPServer(("127.0.0.1", PORT), TestServerHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    print(f"[TEST] Test HTTP Server running on http://127.0.0.1:{PORT}")

    # Launch Edge headless
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    edge_binary = next((p for p in edge_paths if os.path.exists(p)), None)
    if not edge_binary:
        print("[TEST ERROR] Edge browser binary not found.")
        sys.exit(1)

    url = f"http://127.0.0.1:{PORT}/tools/test_runner.html"
    cmd = [
        edge_binary,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--virtual-time-budget=8000",
        url
    ]
    print(f"[TEST] Running headless Edge against: {url}")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    # Wait for test results (up to 15 seconds)
    start_time = time.time()
    while time.time() - start_time < 15:
        if test_results["completed"]:
            break
        time.sleep(0.3)

    try:
        proc.kill()
    except Exception:
        pass
    server.shutdown()

    # Clean up test runner file
    try:
        test_runner_html.unlink()
    except Exception:
        pass

    print("\n--- 3D FARM TEST RESULTS ---")
    print(json.dumps(test_results, indent=2))

    if not test_results["completed"]:
        print("[FAILURE] Headless test timed out waiting for browser report.")
        sys.exit(1)

    errors = test_results.get("errors", [])
    relevant_errors = [e for e in errors if "favicon" not in str(e).lower()]
    if relevant_errors:
        print(f"[FAILURE] Found {len(relevant_errors)} errors in browser execution:")
        for err in relevant_errors:
            print("  - ", err)
        sys.exit(1)

    if not test_results.get("3d_initialized"):
        print("[FAILURE] Farm3DVisualizer failed to initialize in Three.js.")
        sys.exit(1)

    if test_results.get("sectors_count") != 4:
        print(f"[FAILURE] Expected 4 crop sectors, got {test_results.get('sectors_count')}")
        sys.exit(1)

    if not test_results.get("drone_created"):
        print("[FAILURE] Drone model was not created in 3D scene.")
        sys.exit(1)

    print("\n[SUCCESS] 3D Farm Visualizer initialized cleanly with 0 errors!")
    print(f"Three.js Revision: {test_results['details'].get('threeVersion')}")
    print(f"Scene Objects: {test_results['details'].get('sceneChildrenCount')}")
    print(f"Crop Sectors: {test_results.get('sectors_count')}")
    print(f"Sensor Pins: {test_results['details'].get('sensorPinsCount')}")

if __name__ == "__main__":
    run_test()
