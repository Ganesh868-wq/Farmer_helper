import unittest
import os
import json
from datetime import datetime, timezone, timedelta
from app import app
from services.drone_service import drone_service

class DroneIntegrationTestCase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        drone_service.disconnect()

    def tearDown(self):
        drone_service.disconnect()
        if "DRONE_API_KEY" in os.environ:
            del os.environ["DRONE_API_KEY"]

    def test_initial_status_disconnected(self):
        """Initial drone state must be disconnected with clean 'Not available' metadata."""
        res = self.client.get('/api/drone/status')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['state'], 'disconnected')
        self.assertEqual(data['mode'], 'real')
        self.assertFalse(data['is_demo'])
        self.assertEqual(data['device_info']['name'], 'Not available')
        self.assertEqual(data['device_info']['model'], 'Not available')
        self.assertIsNone(data['telemetry']['battery_pct'])
        self.assertIsNone(data['telemetry']['gps_lat'])

    def test_demo_mode_activation_and_simulation(self):
        """Demo mode must activate simulated survey flight and clearly identify as demo."""
        res = self.client.post('/api/drone/connect', json={'mode': 'demo'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['status']['state'], 'connected')
        self.assertTrue(data['status']['is_demo'])
        self.assertEqual(data['status']['mode'], 'demo')
        
        # Check simulated telemetry values
        telem = data['status']['telemetry']
        self.assertIsNotNone(telem['gps_lat'])
        self.assertIsNotNone(telem['gps_lon'])
        self.assertGreater(telem['battery_pct'], 10.0)
        self.assertGreater(telem['altitude_m'], 5.0)
        self.assertIn('Demo', data['status']['device_info']['name'])

    def test_real_connect_without_telemetry_fails_safely(self):
        """Real connect must NOT fake connection when no hardware stream is active."""
        res = self.client.post('/api/drone/connect', json={'mode': 'real'})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data['success'])
        self.assertEqual(data['status']['state'], 'error')
        self.assertIn('tools/drone_bridge.py', data['message'])

    def test_telemetry_ingestion_from_hardware_bridge(self):
        """Ingest endpoint accepts genuine telemetry packets and marks drone as connected."""
        payload = {
            "device_info": {
                "name": "IoTechWorld Agribot 16L",
                "manufacturer": "IoTechWorld Avigation",
                "model": "Agribot-v4",
                "device_id": "IOT-AGRI-4091",
                "firmware_version": "ArduCopter 4.5.2",
                "protocol": "MAVLink v2.0"
            },
            "telemetry": {
                "battery_pct": 78.5,
                "battery_voltage": 22.8,
                "gps_lat": 17.971200,
                "gps_lon": 79.598300,
                "satellites_visible": 18,
                "gps_fix_type": "RTK Fixed",
                "altitude_m": 12.4,
                "altitude_msl_m": 277.4,
                "ground_speed_mps": 4.5,
                "heading_deg": 185.0,
                "flight_mode": "AUTO_SPRAY",
                "signal_strength_pct": 94,
                "latency_ms": 30
            }
        }
        res = self.client.post('/api/drone/telemetry/ingest', json=payload)
        self.assertEqual(res.status_code, 200)
        
        # Verify status now reflects real device telemetry
        status_res = self.client.get('/api/drone/status')
        status = status_res.get_json()
        self.assertEqual(status['state'], 'connected')
        self.assertEqual(status['mode'], 'real')
        self.assertFalse(status['is_demo'])
        self.assertEqual(status['device_info']['name'], "IoTechWorld Agribot 16L")
        self.assertEqual(status['device_info']['model'], "Agribot-v4")
        self.assertEqual(status['telemetry']['battery_pct'], 78.5)
        self.assertEqual(status['telemetry']['altitude_m'], 12.4)
        self.assertEqual(status['telemetry']['gps_lat'], 17.9712)

    def test_heartbeat_timeout_transitions_to_error(self):
        """Simulate loss of drone telemetry signal after 10 seconds."""
        payload = {
            "device_info": {"name": "Test Drone", "model": "T-100"},
            "telemetry": {"battery_pct": 90.0, "altitude_m": 10.0}
        }
        self.client.post('/api/drone/telemetry/ingest', json=payload)
        self.assertEqual(drone_service.state, 'connected')

        # Artificially age the heartbeat by 15 seconds
        drone_service.last_heartbeat = datetime.now(timezone.utc) - timedelta(seconds=15)
        
        status = self.client.get('/api/drone/status').get_json()
        self.assertEqual(status['state'], 'error')
        self.assertIn("Telemetry lost", status['error_message'])

    def test_api_key_authentication(self):
        """When DRONE_API_KEY is configured, unauthenticated ingest requests are rejected."""
        os.environ["DRONE_API_KEY"] = "secret-rythu-key-2026"

        payload = {"telemetry": {"battery_pct": 99.0}}
        
        # Unauthorized without header
        res_unauth = self.client.post('/api/drone/telemetry/ingest', json=payload)
        self.assertEqual(res_unauth.status_code, 401)

        # Authorized with header
        res_auth = self.client.post('/api/drone/telemetry/ingest', json=payload, headers={'X-Drone-Api-Key': 'secret-rythu-key-2026'})
        self.assertEqual(res_auth.status_code, 200)

    def test_disconnect_cleans_state(self):
        """Disconnect resets state and clears telemetry cache."""
        self.client.post('/api/drone/connect', json={'mode': 'demo'})
        res = self.client.post('/api/drone/disconnect')
        self.assertEqual(res.status_code, 200)
        
        status = self.client.get('/api/drone/status').get_json()
        self.assertEqual(status['state'], 'disconnected')
        self.assertIsNone(status['telemetry']['battery_pct'])

    def test_recent_heartbeat_connect_within_10s_succeeds(self):
        """Drone connect succeeds if telemetry arrived within the 10-second heartbeat window."""
        payload = {
            "device_info": {"name": "Test Drone", "model": "T-100"},
            "telemetry": {"battery_pct": 85.0, "altitude_m": 8.0}
        }
        self.client.post('/api/drone/telemetry/ingest', json=payload)
        # Heartbeat is 6 seconds old (would fail under old 5s check, but is valid within 10s timeout)
        drone_service.last_heartbeat = datetime.now(timezone.utc) - timedelta(seconds=6)
        
        res = self.client.post('/api/drone/connect', json={'mode': 'real'})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['status']['state'], 'connected')

    def test_telemetry_ingest_with_raw_payload(self):
        """Ingest endpoint accepts raw string payloads with non-standard content type."""
        raw_data = json.dumps({
            "device_info": {"name": "Micro-Bridge", "model": "MB-1"},
            "telemetry": {"battery_pct": 92.0, "gps_lat": 17.95, "gps_lon": 79.55}
        })
        res = self.client.post('/api/drone/telemetry/ingest', data=raw_data, content_type='text/plain')
        self.assertEqual(res.status_code, 200)
        status = self.client.get('/api/drone/status').get_json()
        self.assertEqual(status['state'], 'connected')
        self.assertEqual(status['device_info']['name'], 'Micro-Bridge')

if __name__ == '__main__':
    unittest.main()
