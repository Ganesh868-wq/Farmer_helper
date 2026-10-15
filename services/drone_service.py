import os
import time
import math
import secrets
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from config import config

class DroneConnectionService:
    """
    Agricultural Drone Connection & Telemetry Management Service.
    Supports MAVLink/ArduPilot gateways, DJI Cloud API, and an isolated Demo Mode.
    Strictly reports real hardware status without faking real connections.
    """

    def __init__(self):
        self.state = "disconnected"  # disconnected, connecting, connected, error
        self.mode = "real"  # "real" or "demo"
        self.last_heartbeat = None
        self.last_connection_time = None
        self.error_message = None
        
        # Real Drone Device Metadata
        self.device_info = {
            "name": None,
            "manufacturer": None,
            "model": None,
            "device_id": None,
            "firmware_version": None,
            "protocol": None
        }

        # Live Telemetry State
        self.telemetry = {
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
            "signal_strength_pct": None,
            "latency_ms": None
        }

        # Demo simulation state variables
        self._demo_start_time = None
        self._demo_battery = 98.0
        self._demo_step = 0

    def get_status(self) -> Dict[str, Any]:
        """Returns the current connection status, device information, and live telemetry."""
        now = datetime.now(timezone.utc)

        # In real mode, check heartbeat timeout (10 seconds timeout)
        if self.mode == "real" and self.state == "connected":
            if self.last_heartbeat:
                delta = (now - self.last_heartbeat).total_seconds()
                if delta > 10.0:
                    self.state = "error"
                    self.error_message = f"Telemetry lost: No heartbeat received for {int(delta)} seconds."
            else:
                self.state = "disconnected"

        # If in demo mode, compute simulated flight path
        if self.mode == "demo" and self.state == "connected":
            self._update_demo_telemetry()

        return {
            "success": True,
            "state": self.state,
            "mode": self.mode,
            "is_demo": (self.mode == "demo"),
            "last_heartbeat": self.last_heartbeat.isoformat() if self.last_heartbeat else None,
            "last_connection_time": self.last_connection_time.isoformat() if self.last_connection_time else None,
            "error_message": self.error_message,
            "device_info": {
                "name": self.device_info["name"] or "Not available",
                "manufacturer": self.device_info["manufacturer"] or "Not available",
                "model": self.device_info["model"] or "Not available",
                "device_id": self.device_info["device_id"] or "Not available",
                "firmware_version": self.device_info["firmware_version"] or "Not available",
                "protocol": self.device_info["protocol"] or "Not available"
            },
            "telemetry": {
                "battery_pct": self.telemetry["battery_pct"],
                "battery_voltage": self.telemetry["battery_voltage"],
                "gps_lat": self.telemetry["gps_lat"],
                "gps_lon": self.telemetry["gps_lon"],
                "satellites_visible": self.telemetry["satellites_visible"],
                "gps_fix_type": self.telemetry["gps_fix_type"] or "Not available",
                "altitude_m": self.telemetry["altitude_m"],
                "altitude_msl_m": self.telemetry["altitude_msl_m"],
                "ground_speed_mps": self.telemetry["ground_speed_mps"],
                "heading_deg": self.telemetry["heading_deg"],
                "flight_mode": self.telemetry["flight_mode"] or "Not available",
                "signal_strength_pct": self.telemetry["signal_strength_pct"],
                "latency_ms": self.telemetry["latency_ms"]
            },
            "server_time": now.isoformat()
        }

    def connect(self, mode: str = "real", protocol: str = "mavlink", endpoint: Optional[str] = None) -> Dict[str, Any]:
        """
        Attempts to initiate connection to a real drone or activates demo mode.
        Never marks real mode as connected unless genuine telemetry is verified.
        """
        self.mode = "demo" if mode == "demo" else "real"
        now = datetime.now(timezone.utc)
        self.error_message = None

        if self.mode == "demo":
            self.state = "connected"
            self.last_connection_time = now
            self.last_heartbeat = now
            self._demo_start_time = time.time()
            self._demo_battery = 98.0
            self._demo_step = 0
            
            self.device_info = {
                "name": "Rythu Agro-Surveyor (Demo Simulator)",
                "manufacturer": "ArduPilot / Hexacopter Simulator",
                "model": "Agri-Hexa 16L RTK",
                "device_id": "SIM-HEXA-AGRI-2026",
                "firmware_version": "ArduCopter v4.5.1-SIM",
                "protocol": "MAVLink v2.0 (Simulated)"
            }
            self._update_demo_telemetry()
            return {
                "success": True,
                "message": "Demo Mode activated: Simulating agricultural survey flight.",
                "status": self.get_status()
            }

        # Real Device Connection Attempt
        self.state = "connecting"
        self.device_info["protocol"] = protocol or self.device_info.get("protocol") or "mavlink"

        # Only reset telemetry and metadata if no heartbeat exists or transitioning from demo
        if not self.last_heartbeat:
            self._reset_telemetry()
            for k in ["name", "manufacturer", "model", "device_id", "firmware_version"]:
                self.device_info[k] = None

        # Check configured drone gateway or environment endpoint
        drone_endpoint = (endpoint or os.getenv("DRONE_CONNECTION_ENDPOINT", "")).strip()
        drone_api_key = os.getenv("DRONE_API_KEY", "").strip()

        # If an external HTTP/HTTPS drone gateway endpoint is provided, poll for telemetry
        if drone_endpoint and (drone_endpoint.startswith("http://") or drone_endpoint.startswith("https://")):
            try:
                import urllib.request
                import json
                headers = {"User-Agent": "RythuMitra-DroneGateway/1.0"}
                if drone_api_key:
                    headers["X-Drone-Api-Key"] = drone_api_key
                req = urllib.request.Request(drone_endpoint, headers=headers)
                with urllib.request.urlopen(req, timeout=3.0) as resp:
                    if resp.status == 200:
                        payload = json.loads(resp.read().decode("utf-8"))
                        if isinstance(payload, dict):
                            self.ingest_telemetry(payload)
                            return {
                                "success": True,
                                "message": f"Connected to drone gateway at {drone_endpoint}.",
                                "status": self.get_status()
                            }
            except Exception:
                pass

        # Verify if an active real-time telemetry stream is already sending heartbeats (10s timeout window)
        if self.last_heartbeat and (now - self.last_heartbeat).total_seconds() <= 10.0:
            self.state = "connected"
            self.last_connection_time = self.last_connection_time or now
            return {
                "success": True,
                "message": "Connected to active drone telemetry feed.",
                "status": self.get_status()
            }

        # If no active telemetry packets have arrived yet
        self.state = "error"
        self.error_message = (
            f"No live telemetry received from drone hardware. "
            f"Please ensure your drone or companion computer is running the gateway bridge "
            f"(tools/drone_bridge.py) pointing to this server."
        )
        return {
            "success": False,
            "message": self.error_message,
            "status": self.get_status()
        }

    def disconnect(self) -> Dict[str, Any]:
        """Gracefully disconnects from drone or deactivates demo mode."""
        self.state = "disconnected"
        self.mode = "real"
        self.error_message = None
        self.last_heartbeat = None
        self.last_connection_time = None
        self.device_info = {
            "name": None,
            "manufacturer": None,
            "model": None,
            "device_id": None,
            "firmware_version": None,
            "protocol": None
        }
        self._reset_telemetry()
        return {
            "success": True,
            "message": "Drone disconnected successfully.",
            "status": self.get_status()
        }

    def ingest_telemetry(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Receives genuine telemetry packets from a physical drone, companion computer,
        or telemetry gateway bridge (e.g., MAVProxy, DroneKit, or DJI Cloud API).
        """
        if not payload or not isinstance(payload, dict):
            return {"success": False, "error": "Invalid telemetry payload format"}

        now = datetime.now(timezone.utc)
        self.mode = "real"
        self.state = "connected"
        self.last_heartbeat = now
        if not self.last_connection_time:
            self.last_connection_time = now
        self.error_message = None

        # Update device metadata if provided in packet
        dev = payload.get("device_info", {})
        if dev:
            if dev.get("name"): self.device_info["name"] = str(dev.get("name"))
            if dev.get("manufacturer"): self.device_info["manufacturer"] = str(dev.get("manufacturer"))
            if dev.get("model"): self.device_info["model"] = str(dev.get("model"))
            if dev.get("device_id"): self.device_info["device_id"] = str(dev.get("device_id"))
            if dev.get("firmware_version"): self.device_info["firmware_version"] = str(dev.get("firmware_version"))
            if dev.get("protocol"): self.device_info["protocol"] = str(dev.get("protocol"))

        # Ingest telemetry values
        raw_tel = payload.get("telemetry", payload)

        if "battery_pct" in raw_tel:
            try: self.telemetry["battery_pct"] = round(float(raw_tel["battery_pct"]), 1)
            except (ValueError, TypeError): pass
        if "battery_voltage" in raw_tel:
            try: self.telemetry["battery_voltage"] = round(float(raw_tel["battery_voltage"]), 2)
            except (ValueError, TypeError): pass

        if "gps_lat" in raw_tel:
            try: self.telemetry["gps_lat"] = round(float(raw_tel["gps_lat"]), 6)
            except (ValueError, TypeError): pass
        if "gps_lon" in raw_tel:
            try: self.telemetry["gps_lon"] = round(float(raw_tel["gps_lon"]), 6)
            except (ValueError, TypeError): pass

        if "satellites_visible" in raw_tel:
            try: self.telemetry["satellites_visible"] = int(raw_tel["satellites_visible"])
            except (ValueError, TypeError): pass

        if "gps_fix_type" in raw_tel:
            self.telemetry["gps_fix_type"] = str(raw_tel["gps_fix_type"])

        if "altitude_m" in raw_tel:
            try: self.telemetry["altitude_m"] = round(float(raw_tel["altitude_m"]), 2)
            except (ValueError, TypeError): pass
        if "altitude_msl_m" in raw_tel:
            try: self.telemetry["altitude_msl_m"] = round(float(raw_tel["altitude_msl_m"]), 2)
            except (ValueError, TypeError): pass

        if "ground_speed_mps" in raw_tel:
            try: self.telemetry["ground_speed_mps"] = round(float(raw_tel["ground_speed_mps"]), 2)
            except (ValueError, TypeError): pass
        if "heading_deg" in raw_tel:
            try: self.telemetry["heading_deg"] = round(float(raw_tel["heading_deg"]) % 360, 1)
            except (ValueError, TypeError): pass

        if "flight_mode" in raw_tel:
            self.telemetry["flight_mode"] = str(raw_tel["flight_mode"])

        if "signal_strength_pct" in raw_tel:
            try: self.telemetry["signal_strength_pct"] = int(raw_tel["signal_strength_pct"])
            except (ValueError, TypeError): pass

        if "latency_ms" in raw_tel:
            try: self.telemetry["latency_ms"] = int(raw_tel["latency_ms"])
            except (ValueError, TypeError): pass

        return {"success": True, "message": "Telemetry accepted and synchronized"}

    def _update_demo_telemetry(self):
        """Generates authentic simulated survey path over the farm coordinates."""
        now_time = time.time()
        elapsed = now_time - (self._demo_start_time or now_time)
        self._demo_step += 1

        # Smooth flight pattern over farm coordinates (Warangal Agricultural Zone)
        base_lat = 17.968900
        base_lon = 79.594100
        radius = 0.00035

        lat = base_lat + (radius * math.sin(elapsed * 0.25))
        lon = base_lon + (radius * math.cos(elapsed * 0.25))

        # Battery slow drain
        self._demo_battery = max(12.0, 98.0 - (elapsed * 0.015))
        
        # Flight altitude and speed
        alt = 15.0 + (0.5 * math.sin(elapsed * 0.5))
        speed = 4.2 + (0.4 * math.sin(elapsed * 0.8))
        heading = (elapsed * 15.0) % 360

        self.telemetry = {
            "battery_pct": round(self._demo_battery, 1),
            "battery_voltage": round(22.2 * (self._demo_battery / 100.0), 2),
            "gps_lat": round(lat, 6),
            "gps_lon": round(lon, 6),
            "satellites_visible": 19,
            "gps_fix_type": "RTK Fixed (Demo)",
            "altitude_m": round(alt, 1),
            "altitude_msl_m": round(265.0 + alt, 1),
            "ground_speed_mps": round(speed, 1),
            "heading_deg": round(heading, 1),
            "flight_mode": "AUTO_SURVEY",
            "signal_strength_pct": 96,
            "latency_ms": 28
        }
        self.last_heartbeat = datetime.now(timezone.utc)

    def _reset_telemetry(self):
        """Resets telemetry state to unpopulated defaults."""
        self.telemetry = {
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
            "signal_strength_pct": None,
            "latency_ms": None
        }

drone_service = DroneConnectionService()
