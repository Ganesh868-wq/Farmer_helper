import hashlib
import secrets
import re
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Optional, Dict, Any, Tuple
from flask import request, jsonify
from database import get_db_connection

# Password Hashing Constants
HASH_ALGORITHM = "sha256"
HASH_ITERATIONS = 100000
SALT_BYTES = 16

def hash_password(password: str) -> Tuple[str, str]:
    """Hashes a password with PBKDF2-HMAC-SHA256 and a cryptographically secure salt."""
    salt = secrets.token_hex(SALT_BYTES)
    key = hashlib.pbkdf2_hmac(
        HASH_ALGORITHM,
        password.encode("utf-8"),
        salt.encode("utf-8"),
        HASH_ITERATIONS
    )
    return key.hex(), salt

def verify_password(stored_hash: str, salt: str, password_attempt: str) -> bool:
    """Verifies a password against the stored hash and salt."""
    attempt_key = hashlib.pbkdf2_hmac(
        HASH_ALGORITHM,
        password_attempt.encode("utf-8"),
        salt.encode("utf-8"),
        HASH_ITERATIONS
    )
    return secrets.compare_digest(stored_hash, attempt_key.hex())

def clean_phone(phone: str) -> str:
    """Normalizes phone number to 10 digits."""
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    return digits

def validate_registration(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """Validates registration input fields."""
    name = (data.get("name") or "").strip()
    phone = clean_phone(data.get("phone") or "")
    password = data.get("password") or ""

    if not name or len(name) < 2:
        return False, "Farmer name must be at least 2 characters long."
    if not phone or len(phone) != 10:
        return False, "Please provide a valid 10-digit Indian mobile number."
    if not password or len(password) < 6:
        return False, "Password must be at least 6 characters long."

    return True, None

def register_user(data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any], int]:
    """Registers a new farmer into the database."""
    is_valid, error = validate_registration(data)
    if not is_valid:
        return False, {"error": error}, 400

    phone = clean_phone(data["phone"])
    name = data["name"].strip()
    password = data["password"]
    village = (data.get("village") or "").strip()
    district = (data.get("district") or "").strip()
    state = (data.get("state") or "Telangana").strip()
    primary_crop = (data.get("primary_crop") or "Paddy").strip()
    language = (data.get("preferred_language") or "te").strip()
    try:
        land_acres = float(data.get("land_acres") or 0.0)
    except (ValueError, TypeError):
        land_acres = 0.0

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check existing user
        cursor.execute("SELECT id FROM users WHERE phone = ?", (phone,))
        if cursor.fetchone():
            return False, {"error": "A farmer with this phone number is already registered. Please log in."}, 409

        pwd_hash, salt = hash_password(password)
        cursor.execute("""
            INSERT INTO users 
            (name, phone, password_hash, salt, village, district, state, primary_crop, land_acres, preferred_language)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, phone, pwd_hash, salt, village, district, state, primary_crop, land_acres, language))
        user_id = cursor.lastrowid

        # Generate auth session token
        token = secrets.token_hex(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        cursor.execute(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user_id, expires_at.isoformat())
        )
        conn.commit()

        user_data = {
            "id": user_id,
            "name": name,
            "phone": phone,
            "village": village,
            "district": district,
            "state": state,
            "primary_crop": primary_crop,
            "land_acres": land_acres,
            "preferred_language": language,
            "token": token
        }
        return True, {"message": "Registration successful", "user": user_data}, 201
    except Exception as e:
        conn.rollback()
        return False, {"error": f"Database error during registration: {str(e)}"}, 500
    finally:
        conn.close()

def login_user(phone_raw: str, password: str) -> Tuple[bool, Dict[str, Any], int]:
    """Authenticates farmer via phone and password."""
    phone = clean_phone(phone_raw)
    if not phone or len(phone) != 10:
        return False, {"error": "Please enter a valid 10-digit mobile number."}, 400
    if not password:
        return False, {"error": "Password is required."}, 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT id, name, phone, password_hash, salt, village, district, state, primary_crop, land_acres, preferred_language 
            FROM users WHERE phone = ?
        """, (phone,))
        user = cursor.fetchone()

        if not user:
            return False, {"error": "No account found with this phone number. Please register."}, 401

        if not verify_password(user["password_hash"], user["salt"], password):
            return False, {"error": "Incorrect password. Please check and try again."}, 401

        # Generate fresh session token
        token = secrets.token_hex(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        cursor.execute(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user["id"], expires_at.isoformat())
        )
        conn.commit()

        user_data = {
            "id": user["id"],
            "name": user["name"],
            "phone": user["phone"],
            "village": user["village"],
            "district": user["district"],
            "state": user["state"],
            "primary_crop": user["primary_crop"],
            "land_acres": user["land_acres"],
            "preferred_language": user["preferred_language"],
            "token": token
        }
        return True, {"message": "Login successful", "user": user_data}, 200
    except Exception as e:
        return False, {"error": f"Login server error: {str(e)}"}, 500
    finally:
        conn.close()

def get_current_user_from_token(token: str) -> Optional[Dict[str, Any]]:
    """Retrieves authenticated user details from a valid active session token."""
    if not token:
        return None

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT u.id, u.name, u.phone, u.village, u.district, u.state, u.primary_crop, u.land_acres, u.preferred_language, s.expires_at
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ?
        """, (token,))
        row = cursor.fetchone()
        if not row:
            return None

        # Check expiration
        expires_at = datetime.fromisoformat(row["expires_at"])
        if datetime.now(timezone.utc) > expires_at:
            cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
            conn.commit()
            return None

        return dict(row)
    except Exception:
        return None
    finally:
        conn.close()

def login_required(f):
    """Decorator to protect API endpoints requiring authenticated farmer session."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
        elif "x-session-token" in request.headers:
            token = request.headers.get("x-session-token", "").strip()

        if not token:
            return jsonify({"error": "Authentication token missing. Please log in."}), 401

        user = get_current_user_from_token(token)
        if not user:
            return jsonify({"error": "Session expired or invalid. Please log in again."}), 401

        request.current_user = user
        return f(*args, **kwargs)
    return decorated_function

def logout_user(token: str) -> bool:
    """Terminates an active session token."""
    if not token:
        return False
    conn = get_db_connection()
    try:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        return True
    except Exception:
        return False
    finally:
        conn.close()
