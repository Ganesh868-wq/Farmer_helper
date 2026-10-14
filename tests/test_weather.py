import unittest
from services.weather_service import weather_service
from services.market_service import market_service
from services.schemes_service import schemes_service
from services.crop_service import crop_service
from services.guidance_service import guidance_service

class TestAgriServices(unittest.TestCase):
    def test_live_weather_service(self):
        # Test Warangal district
        res = weather_service.get_weather_for_district("warangal")
        self.assertTrue(res["success"])
        self.assertIn("current", res)
        self.assertIn("temperature", res["current"])
        self.assertIn("humidity", res["current"])
        self.assertIn("advisory", res)
        self.assertIn("spray_condition", res["advisory"])
        self.assertIn("alerts", res["advisory"])
        self.assertIn("telugu", res["audio_summaries"])

    def test_spray_advisory_logic(self):
        # Heavy rain case should warn against spraying
        rainy_adv = weather_service.generate_agro_advisory(temp=27.0, humidity=92.0, wind_speed=8.0, rain_sum=15.0, rain_prob=85)
        self.assertIn("Unfavorable", rainy_adv["spray_condition"])
        self.assertEqual(rainy_adv["spray_color"], "rose")

        # Calm optimal conditions
        optimal_adv = weather_service.generate_agro_advisory(temp=26.0, humidity=60.0, wind_speed=6.0, rain_sum=0.0, rain_prob=5)
        self.assertEqual(optimal_adv["spray_condition"], "Favorable")
        self.assertEqual(optimal_adv["spray_color"], "emerald")

    def test_market_service(self):
        res = market_service.get_all_prices()
        self.assertTrue(res["success"])
        self.assertGreaterEqual(res["total_count"], 8)
        self.assertIn("audio_summaries", res)

        # Filter by commodity
        paddy_res = market_service.get_all_prices(query="paddy")
        self.assertTrue(any("paddy" in c["name_en"].lower() for c in paddy_res["commodities"]))

    def test_crop_recommendation_logic(self):
        # Black soil in Kharif with canal irrigation
        rec = crop_service.get_recommendations(soil_type="black", season="kharif", water_source="canal", land_acres=3.0)
        self.assertTrue(rec["success"])
        top_crop = rec["recommendations"][0]
        self.assertGreater(top_crop["match_score"], 80)

    def test_schemes_directory(self):
        schemes = schemes_service.get_all_schemes()
        self.assertTrue(schemes["success"])
        self.assertGreaterEqual(schemes["total_count"], 5)

    def test_organic_guidance_recipes(self):
        guidance = guidance_service.get_organic_recipes()
        self.assertTrue(guidance["success"])
        recipe_names = [r["id"] for r in guidance["recipes"]]
        self.assertIn("jeevamrutham", recipe_names)
        self.assertIn("neemastra", recipe_names)
        self.assertIn("brahmastra", recipe_names)

if __name__ == "__main__":
    unittest.main()
