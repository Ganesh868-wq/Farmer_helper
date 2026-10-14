import unittest
import os
import json
import tempfile
from pathlib import Path

# Override database path for clean isolated testing
os.environ["DATABASE_PATH"] = str(Path(tempfile.gettempdir()) / "test_rythu_mitra_api.db")

from database import init_database
from app import app

class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_database()
        cls.client = app.test_client()

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["database_connected"])
        self.assertIn("external_services", data)

    def test_weather_endpoints(self):
        # By district
        res = self.client.get("/api/weather/district/warangal")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("current", data)
        self.assertIn("advisory", data)
        self.assertIn("forecast_7day", data)

    def test_market_prices_endpoint(self):
        res = self.client.get("/api/market/prices")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(data["total_count"], 0)
        
        # Search query
        res_chilli = self.client.get("/api/market/prices?q=chilli")
        data_chilli = res_chilli.get_json()
        self.assertTrue(any("chilli" in c["name_en"].lower() for c in data_chilli["commodities"]))

    def test_crop_recommendations(self):
        res = self.client.get("/api/crops/recommendations?soil=black&season=kharif&water=canal&acres=3.0")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(data["total_matches"], 0)
        self.assertIn("match_score", data["recommendations"][0])

    def test_schemes_endpoint(self):
        res = self.client.get("/api/schemes")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(data["total_count"], 0)

    def test_farm_sectors_and_irrigation(self):
        res = self.client.get("/api/farm/sectors")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(len(data["sectors"]), 4)

        # Trigger irrigation
        res_irr = self.client.post("/api/farm/sectors/sec-1/irrigate")
        self.assertEqual(res_irr.status_code, 200)
        irr_data = res_irr.get_json()
        self.assertTrue(irr_data["success"])

if __name__ == "__main__":
    unittest.main()
