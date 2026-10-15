#!/usr/bin/env python3
"""
==============================================================================
RYTHU MITRA AI (రైతు మిత్ర AI) — FIELD DRONE TELEMETRY BRIDGE
==============================================================================

This companion script bridges physical agricultural drones to the RythuMitra AI
cloud/local web application.

COMMUNICATION FLOW:
  [Agricultural Drone / AutoPilot]
              │ (MAVLink 2.0 / Serial / Radio / Companion PC)
              ▼
    [tools/drone_bridge.py] (Local GCS / Raspberry Pi / Field Laptop)
              │ (Secure HTTPS REST Telemetry Packets)
              ▼
   [RythuMitra AI Backend] (/api/drone/telemetry/ingest)
              │
              ▼
   [Farmer Browser 3D Digital Twin HUD]

SUPPORTED DRONE SYSTEMS:
  1. ArduPilot / PX4 Agricultural Drones (Hexacopters, Octocopters, Quadcopters)
     - Protocols: MAVLink 1.0 / 2.0 over Serial Telemetry Radio (SiK 433/915MHz)
     - UDP/TCP Telemetry from Mission Planner / QGroundControl / Companion PC
  2. DJI Agriculture Drones (DJI Agras T40, T30, T20P, T10)
     - Via DJI Cloud API webhook or Mobile SDK telemetry forwarder
  3. Field Test & Diagnostic Mode (--test-stream)
     - Simulates genuine hardware packet forwarding for cloud endpoint validation

USAGE EXAMPLES:
  # 1. Connect to local drone telemetry radio on Windows COM port:
  python tools/drone_bridge.py --connect COM3 --baud 57600 --url http://localhost:5000

  # 2. Connect to local MAVLink UDP stream from Mission Planner:
  python tools/drone_bridge.py --connect udp:127.0.0.1:14550 --url https://rythu-mitra-ai.onrender.com --api-key YOUR_KEY

  # 3. Test cloud connectivity without hardware:
  python tools/drone_bridge.py --test-stream --url http://localhost:5000
==============================================================================
"""

import sys
import os
import time
import json
import math
import argparse
from datetime import datetime, timezone

try:
    import urllib.request
    import urllib.error
except ImportError:
    pass

def post_telemetry(server_url: str, payload: dict, api_key: str = None) -> bool:
    """Sends JSON telemetry packet to RythuMitra backend ingest endpoint."""
    url = f"{server_url.rstrip('/')}/api/drone/telemetry/ingest"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    if api_key:
        req.add_header('X-Drone-Api-Key', api_key)

    try:
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            if resp.status == 200:
                return True
            else:
                print(f"[Bridge] HTTP Warning: {resp.status}")
                return False
    except urllib.error.HTTPError as e:
        print(f"[Bridge] HTTP Error {e.code}: {e.read().decode('utf-8', errors='ignore')}")
        return False
    except Exception as e:
        print(f"[Bridge] Connection failed to {url}: {e}")
        return False


def run_mavlink_bridge(connection_str: str, baud: int, server_url: str, api_key: str, device_name: str, model: str):
    """Bridges real MAVLink stream via pymavlink."""
    try:
        from pymavlink import mavutil
    except ImportError:
        print("\n[ERROR] pymavlink is required for hardware MAVLink radio connections.")
        print("Install it with: pip install pymavlink pyserial\n")
        print("Alternatively, test connectivity using: python tools/drone_bridge.py --test-stream")
        sys.exit(1)

    print(f"\n[Bridge] Connecting to MAVLink hardware at {connection_str} (baud {baud})...")
    mav = mavutil.mavlink_connection(connection_str, baud=baud)
    
    print("[Bridge] Waiting for drone heartbeat...")
    mav.wait_heartbeat()
    print(f"[Bridge] Heartbeat received from System {mav.target_system}, Component {mav.target_component}!")

    last_post = 0.0
    telem_cache = {
        "battery_pct": None,
        "battery_voltage": None,
        "gps_lat": None,
        "gps_lon": None,
        "satellites_visible": None,
        "gps_fix_type": None,
        "altitude_m": None,
        "altitude_msl_m": None,
        "ground_speed_mps": None,
        "heading_deg": None,
        "flight_mode": None,
        "signal_strength_pct": 95
    }

    device_info = {
        "name": device_name,
        "manufacturer": "Agricultural Drone Systems",
        "model": model,
        "device_id": f"MAV-{mav.target_system:03d}",
        "firmware_version": "ArduCopter / PX4",
        "protocol": "MAVLink 2.0"
    }

    try:
        while True:
            msg = mav.recv_match(blocking=False)
            if msg:
                msg_type = msg.get_type()

                if msg_type == "HEARTBEAT":
                    mode = mavutil.mode_string_v10(msg)
                    telem_cache["flight_mode"] = mode

                elif msg_type == "GLOBAL_POSITION_INT":
                    telem_cache["gps_lat"] = round(msg.lat / 1e7, 6)
                    telem_cache["gps_lon"] = round(msg.lon / 1e7, 6)
                    telem_cache["altitude_m"] = round(msg.relative_alt / 1000.0, 2)
                    telem_cache["altitude_msl_m"] = round(msg.alt / 1000.0, 2)
                    telem_cache["heading_deg"] = round(msg.hdg / 100.0, 1)

                elif msg_type == "VFR_HUD":
                    telem_cache["ground_speed_mps"] = round(msg.groundspeed, 2)
                    if telem_cache["heading_deg"] is None:
                        telem_cache["heading_deg"] = round(msg.heading, 1)

                elif msg_type == "SYS_STATUS":
                    if msg.battery_remaining != -1:
                        telem_cache["battery_pct"] = msg.battery_remaining
                    if msg.voltage_battery != 65535:
                        telem_cache["battery_voltage"] = round(msg.voltage_battery / 1000.0, 2)

                elif msg_type == "GPS_RAW_INT":
                    telem_cache["satellites_visible"] = msg.satellites_visible
                    fix_types = {0: "No GPS", 1: "No Fix", 2: "2D Fix", 3: "3D Fix", 4: "DGPS", 5: "RTK Float", 6: "RTK Fixed"}
                    telem_cache["gps_fix_type"] = fix_types.get(msg.fix_type, f"Type {msg.fix_type}")

            # Send batch every 1.0 second
            now = time.time()
            if now - last_post >= 1.0:
                payload = {
                    "device_info": device_info,
                    "telemetry": telem_cache
                }
                success = post_telemetry(server_url, payload, api_key)
                if success:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] Forwarded telemetry: Alt {telem_cache['altitude_m']}m, Bat {telem_cache['battery_pct']}%, Mode {telem_cache['flight_mode']}")
                last_post = now

            time.sleep(0.02)

    except KeyboardInterrupt:
        print("\n[Bridge] Drone bridge stopped by operator.")


def run_test_stream(server_url: str, api_key: str, device_name: str, model: str):
    """Simulates active field drone transmitting to the server to verify cloud connectivity."""
    print(f"\n==================================================================")
    print(f" RYTHU MITRA AI — TEST FIELD DRONE TRANSMITTER")
    print(f" Target Server : {server_url}")
    print(f" Device Name   : {device_name} ({model})")
    print(f" Frequency     : 1.0 Hz (Live Stream)")
    print(f"==================================================================\n")

    base_lat = 17.968900
    base_lon = 79.594100
    battery = 95.0
    step = 0

    device_info = {
        "name": device_name,
        "manufacturer": "Rythu Agro Drones Ltd.",
        "model": model,
        "device_id": "RAD-TX-2026-088",
        "firmware_version": "ArduAgri v4.5.3-PRO",
        "protocol": "MAVLink v2.0 (Bridge Forwarded)"
    }

    try:
        while True:
            t = step * 0.2
            lat = base_lat + (0.00028 * math.sin(t))
            lon = base_lon + (0.00028 * math.cos(t))
            alt = round(14.5 + (1.2 * math.sin(t * 1.5)), 2)
            speed = round(3.8 + (0.5 * math.cos(t)), 2)
            hdg = round((step * 4) % 360, 1)
            battery = max(15.0, battery - 0.02)

            telemetry = {
                "battery_pct": round(battery, 1),
                "battery_voltage": round(22.2 * (battery / 100.0), 2),
                "gps_lat": round(lat, 6),
                "gps_lon": round(lon, 6),
                "satellites_visible": 21,
                "gps_fix_type": "RTK Fixed",
                "altitude_m": alt,
                "altitude_msl_m": round(265.0 + alt, 2),
                "ground_speed_mps": speed,
                "heading_deg": hdg,
                "flight_mode": "SPRAY_AUTO",
                "signal_strength_pct": 98,
                "latency_ms": 32
            }

            payload = {
                "device_info": device_info,
                "telemetry": telemetry
            }

            ok = post_telemetry(server_url, payload, api_key)
            if ok:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] OK -> Server accepted packet: Alt={alt}m, Bat={battery:.1f}%, GPS=({lat:.6f}, {lon:.6f})")
            else:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] FAIL -> Could not deliver packet to {server_url}")

            step += 1
            time.sleep(1.0)

    except KeyboardInterrupt:
        print("\n[Bridge] Test transmitter stopped.")


def main():
    parser = argparse.ArgumentParser(description="RythuMitra AI Agricultural Drone Telemetry Gateway Bridge")
    parser.add_argument("--url", default=os.getenv("SERVER_URL", "http://localhost:5000"), help="RythuMitra backend base URL")
    parser.add_argument("--connect", default=None, help="MAVLink connection string (e.g. COM3, /dev/ttyUSB0, udp:127.0.0.1:14550)")
    parser.add_argument("--baud", type=int, default=57600, help="Serial baud rate for telemetry radio (default: 57600)")
    parser.add_argument("--api-key", default=os.getenv("DRONE_API_KEY", ""), help="Drone authentication secret key")
    parser.add_argument("--name", default="Agri-Kisan 10L Hexacopter", help="Drone Name")
    parser.add_argument("--model", default="Kisan-Drone-V2", help="Drone Model")
    parser.add_argument("--test-stream", action="store_true", help="Run test field telemetry transmitter to verify end-to-end cloud ingestion")

    args = parser.parse_args()

    if args.test_stream or not args.connect:
        if not args.connect and not args.test_stream:
            print("[Info] No physical connection specified. Starting diagnostic test transmitter (--test-stream).")
            print("[Info] To connect a real radio, specify: --connect COMx or --connect udp:127.0.0.1:14550\n")
        run_test_stream(args.url, args.api_key, args.name, args.model)
    else:
        run_mavlink_bridge(args.connect, args.baud, args.url, args.api_key, args.name, args.model)

if __name__ == "__main__":
    main()
