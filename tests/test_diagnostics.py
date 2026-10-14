import unittest
import os
import io
import tempfile
from pathlib import Path
from PIL import Image

# Override database path for clean isolated testing
os.environ["DATABASE_PATH"] = str(Path(tempfile.gettempdir()) / "test_rythu_mitra_diag.db")

from database import init_database
from app import app
from services.disease_service import disease_service

class TestDiagnosticService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_database()
        cls.client = app.test_client()

    def test_voice_text_diagnosis_telugu(self):
        payload = {
            "crop": "Paddy / Rice (వరి)",
            "symptoms": "ఆకుల మీద కండె ఆకారపు మచ్చలు వచ్చాయి, అగ్గి తెగులు లక్షణాలు కనిపిస్తున్నాయి",
            "input_method": "voice_speech"
        }
        res = self.client.post("/api/diagnose/text", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        diag = data["diagnosis"]
        self.assertTrue("Blast" in diag["disease_name"] or "blast" in diag["disease_name"].lower())
        self.assertTrue("అగ్గి తెగులు" in diag["disease_name_te"] or "Blast" in diag["disease_name"])
        self.assertIn("audio_summaries", diag)
        self.assertIn("telugu", diag["audio_summaries"])

    def test_image_upload_diagnosis(self):
        # Create a synthetic test leaf image using PIL
        img = Image.new("RGB", (200, 200), color=(34, 139, 34)) # forest green
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)

        data = {
            "crop": "Cotton (పత్తి)",
            "symptoms": "Boll borer and leaf curl",
            "input_method": "photo_upload",
            "photo": (img_bytes, "test_leaf.jpg")
        }

        res = self.client.post(
            "/api/diagnose/image",
            data=data,
            content_type="multipart/form-data"
        )
        self.assertEqual(res.status_code, 200)
        json_data = res.get_json()
        self.assertTrue(json_data["success"])
        diag = json_data["diagnosis"]
        self.assertIsNotNone(diag["disease_name"])
        self.assertIsNotNone(diag["treatment_organic"])
        self.assertIsNotNone(diag["treatment_chemical"])
        self.assertIsNotNone(diag["cv_metrics"])

if __name__ == "__main__":
    unittest.main()
