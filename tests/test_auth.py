import unittest
import os
import tempfile
from pathlib import Path

# Override database path for clean isolated testing
os.environ["DATABASE_PATH"] = str(Path(tempfile.gettempdir()) / "test_rythu_mitra_auth.db")

from database import init_database, get_db_connection
from auth import hash_password, verify_password, register_user, login_user, get_current_user_from_token

class TestAuthModule(unittest.TestCase):
    def setUp(self):
        init_database()
        conn = get_db_connection()
        conn.execute("DELETE FROM sessions;")
        conn.execute("DELETE FROM users;")
        conn.commit()
        conn.close()

    def tearDown(self):
        conn = get_db_connection()
        conn.execute("DELETE FROM sessions;")
        conn.execute("DELETE FROM users;")
        conn.commit()
        conn.close()

    def test_password_hashing_and_verification(self):
        password = "FarmerSecret@2026"
        pwd_hash, salt = hash_password(password)
        self.assertIsNotNone(pwd_hash)
        self.assertIsNotNone(salt)
        self.assertTrue(verify_password(pwd_hash, salt, password))
        self.assertFalse(verify_password(pwd_hash, salt, "WrongPassword"))

    def test_user_registration_and_duplicate_prevention(self):
        farmer_data = {
            "name": "Ramulu Naidu",
            "phone": "9876543210",
            "password": "strongPassword123",
            "village": "Chennur",
            "district": "Warangal",
            "primary_crop": "Paddy / Rice",
            "land_acres": 4.5
        }
        # First registration must succeed
        success, res, code = register_user(farmer_data)
        self.assertTrue(success)
        self.assertEqual(code, 201)
        self.assertIn("token", res["user"])
        self.assertEqual(res["user"]["phone"], "9876543210")

        # Duplicate registration with same phone must be rejected (HTTP 409)
        dup_success, dup_res, dup_code = register_user(farmer_data)
        self.assertFalse(dup_success)
        self.assertEqual(dup_code, 409)

    def test_user_login(self):
        farmer_data = {
            "name": "Sita Devi",
            "phone": "9123456789",
            "password": "sitaPassword2026",
            "village": "Khammam Rural",
            "district": "Khammam",
            "primary_crop": "Cotton",
            "land_acres": 3.0
        }
        register_user(farmer_data)

        # Correct credentials
        success, res, code = login_user("9123456789", "sitaPassword2026")
        self.assertTrue(success)
        self.assertEqual(code, 200)
        self.assertIn("token", res["user"])

        # Token validation
        token = res["user"]["token"]
        user_info = get_current_user_from_token(token)
        self.assertIsNotNone(user_info)
        self.assertEqual(user_info["name"], "Sita Devi")

        # Wrong password
        wrong_success, _, wrong_code = login_user("9123456789", "incorrectPass")
        self.assertFalse(wrong_success)
        self.assertEqual(wrong_code, 401)

if __name__ == "__main__":
    unittest.main()
