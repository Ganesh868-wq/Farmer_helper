import os
import uuid
from pathlib import Path
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import config
from database import get_db_connection, init_database
from auth import register_user, login_user, get_current_user_from_token, login_required, logout_user
from services.disease_service import disease_service
from services.weather_service import weather_service
from services.market_service import market_service
from services.crop_service import crop_service
from services.schemes_service import schemes_service
from services.guidance_service import guidance_service

# Initialize Flask app
app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["SECRET_KEY"] = config.SECRET_KEY
app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

# Enable Cross-Origin Resource Sharing
CORS(app)

# Ensure upload directory exists
config.UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

# Helper function to validate image extensions
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS

# ==============================================================
# UI ROUTE
# ==============================================================
@app.route("/")
@app.route("/index.html")
def index():
    """Serves the main Rythu Mitra AI Single Page Web Application."""
    return render_template("index.html")

@app.route("/uploads/scans/<path:filename>")
def serve_upload(filename):
    """Securely serves uploaded disease scan photos."""
    return send_from_directory(config.UPLOAD_FOLDER, filename)

# ==============================================================
# HEALTH & CONFIG STATUS
# ==============================================================
@app.route("/api/health", methods=["GET"])
def health_check():
    """System health check and external services configuration report."""
    db_ok = False
    try:
        conn = get_db_connection()
        conn.execute("SELECT 1;")
        conn.close()
        db_ok = True
    except Exception:
        db_ok = False

    return jsonify({
        "status": "healthy" if db_ok else "degraded",
        "app_name": "Rythu Mitra AI (రైతు మిత్ర AI)",
        "version": "2.0.0",
        "database_connected": db_ok,
        "external_services": {
            "gemini_ai_configured": bool(config.GEMINI_API_KEY and len(config.GEMINI_API_KEY) > 5),
            "openweather_configured": bool(config.OPENWEATHER_API_KEY and len(config.OPENWEATHER_API_KEY) > 5),
            "datagov_configured": bool(config.DATA_GOV_IN_API_KEY and len(config.DATA_GOV_IN_API_KEY) > 5),
        },
        "mode": "Dual Engine (Cloud AI + Built-in Agronomic Expert System)"
    }), 200

# ==============================================================
# AUTHENTICATION API
# ==============================================================
@app.route("/api/auth/register", methods=["POST"])
def api_register():
    data = request.get_json() or {}
    success, result, status_code = register_user(data)
    return jsonify(result), status_code

@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}
    phone = data.get("phone", "")
    password = data.get("password", "")
    success, result, status_code = login_user(phone, password)
    return jsonify(result), status_code

@app.route("/api/auth/me", methods=["GET"])
@login_required
def api_get_profile():
    return jsonify({
        "success": True,
        "user": request.current_user
    }), 200

@app.route("/api/auth/logout", methods=["POST"])
def api_logout():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ", 1)[1].strip() if auth_header.startswith("Bearer ") else request.headers.get("x-session-token", "")
    logout_user(token)
    return jsonify({"success": True, "message": "Successfully logged out."}), 200

# ==============================================================
# CROP DISEASE DIAGNOSIS API
# ==============================================================
@app.route("/api/diagnose/image", methods=["POST"])
def api_diagnose_image():
    """Diagnoses crop disease from uploaded photo or direct camera capture."""
    if "photo" not in request.files:
        return jsonify({"error": "No image file provided in request."}), 400

    file = request.files["photo"]
    if file.filename == "":
        return jsonify({"error": "Empty file uploaded."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported image format. Please upload PNG, JPG, or WEBP."}), 400

    crop_name = request.form.get("crop", "Paddy / Rice").strip()
    symptom_text = request.form.get("symptoms", "").strip()
    input_method = request.form.get("input_method", "photo_upload")

    # Get optional user from token if authenticated
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ", 1)[1].strip() if auth_header.startswith("Bearer ") else request.headers.get("x-session-token", "")
    user = get_current_user_from_token(token) if token else None
    user_id = user["id"] if user else None

    # Save image securely with unique filename
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"scan_{uuid.uuid4().hex[:12]}.{ext}"
    saved_path = config.UPLOAD_FOLDER / unique_filename
    file.save(str(saved_path))

    result = disease_service.diagnose_crop(
        crop_name=crop_name,
        image_path=saved_path,
        symptom_text=symptom_text,
        input_method=input_method,
        user_id=user_id
    )

    return jsonify({"success": True, "diagnosis": result}), 200

@app.route("/api/diagnose/text", methods=["POST"])
def api_diagnose_text():
    """Diagnoses crop disease from voice input or typed symptoms in Telugu, Hindi, or English."""
    data = request.get_json() or {}
    crop_name = data.get("crop", "Paddy / Rice").strip()
    symptom_text = data.get("symptoms", "").strip()
    input_method = data.get("input_method", "voice_speech")

    if not symptom_text:
        return jsonify({"error": "Please describe the crop problem or symptoms."}), 400

    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ", 1)[1].strip() if auth_header.startswith("Bearer ") else request.headers.get("x-session-token", "")
    user = get_current_user_from_token(token) if token else None
    user_id = user["id"] if user else None

    result = disease_service.diagnose_crop(
        crop_name=crop_name,
        image_path=None,
        symptom_text=symptom_text,
        input_method=input_method,
        user_id=user_id
    )

    return jsonify({"success": True, "diagnosis": result}), 200

@app.route("/api/diagnose/history", methods=["GET"])
def api_diagnose_history():
    """Retrieves recent diagnostic scans."""
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ", 1)[1].strip() if auth_header.startswith("Bearer ") else request.headers.get("x-session-token", "")
    user = get_current_user_from_token(token) if token else None

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if user:
            cursor.execute("""
                SELECT id, crop_name, image_path, symptom_description, input_method,
                       disease_name, disease_name_te, disease_name_hi, confidence, severity, 
                       ai_provider, api_configured, created_at
                FROM disease_scans
                WHERE user_id = ?
                ORDER BY created_at DESC LIMIT 20
            """, (user["id"],))
        else:
            cursor.execute("""
                SELECT id, crop_name, image_path, symptom_description, input_method,
                       disease_name, disease_name_te, disease_name_hi, confidence, severity, 
                       ai_provider, api_configured, created_at
                FROM disease_scans
                ORDER BY created_at DESC LIMIT 10
            """)
        scans = [dict(row) for row in cursor.fetchall()]
        return jsonify({"success": True, "scans": scans}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve scan history: {str(e)}"}), 500
    finally:
        conn.close()

# ==============================================================
# LIVE WEATHER & AGRO-FORECAST API
# ==============================================================
@app.route("/api/weather/live", methods=["GET"])
def api_weather_live():
    """Returns live weather and spray advisory by latitude/longitude."""
    try:
        lat = float(request.args.get("lat", 17.9689))
        lon = float(request.args.get("lon", 79.5941))
        name = request.args.get("location_name", "Local Farm")
    except (ValueError, TypeError):
        lat, lon, name = 17.9689, 79.5941, "Warangal Agri-Zone"

    weather = weather_service.get_live_weather(lat, lon, name)
    return jsonify(weather), 200

@app.route("/api/weather/district/<district_key>", methods=["GET"])
def api_weather_district(district_key):
    """Returns live weather for a specific agricultural district."""
    weather = weather_service.get_weather_for_district(district_key)
    return jsonify(weather), 200

# ==============================================================
# MANDI MARKET PRICES & MSP API
# ==============================================================
@app.route("/api/market/prices", methods=["GET"])
def api_market_prices():
    """Returns live APMC rates, MSP comparison, trends, and selling advice."""
    query = request.args.get("q")
    filter_mandi = request.args.get("mandi")
    data = market_service.get_all_prices(query, filter_mandi)
    return jsonify(data), 200

# ==============================================================
# CROP RECOMMENDATION API
# ==============================================================
@app.route("/api/crops/recommendations", methods=["GET"])
def api_crop_recommendations():
    """Calculates suitable crops according to soil, season, and irrigation."""
    soil = request.args.get("soil", "black")
    season = request.args.get("season", "kharif")
    water = request.args.get("water", "medium")
    try:
        acres = float(request.args.get("acres", 2.0))
    except (ValueError, TypeError):
        acres = 2.0

    result = crop_service.get_recommendations(soil, season, water, acres)
    return jsonify(result), 200

# ==============================================================
# GOVERNMENT SCHEMES & SUBSIDIES API
# ==============================================================
@app.route("/api/schemes", methods=["GET"])
def api_schemes():
    """Returns government agricultural schemes, subsidy rates, and links."""
    query = request.args.get("q")
    data = schemes_service.get_all_schemes(query)
    return jsonify(data), 200

# ==============================================================
# ORGANIC RECIPES & GUIDANCE API
# ==============================================================
@app.route("/api/guidance/recipes", methods=["GET"])
def api_guidance():
    """Returns natural formulations and Integrated Pest Management recipes."""
    data = guidance_service.get_organic_recipes()
    return jsonify(data), 200

# ==============================================================
# 3D DIGITAL TWIN FARM TELEMETRY API
# ==============================================================
@app.route("/api/farm/sectors", methods=["GET"])
def api_farm_sectors():
    """Returns real-time IoT soil sensor telemetry for 3D farm digital twin."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, sector_id, sector_name, crop_type, soil_moisture, 
                   soil_temp, soil_ph, nitrogen, phosphorus, potassium, 
                   irrigation_status, health_index, updated_at
            FROM farm_telemetry
            ORDER BY sector_id ASC
        """)
        sectors = [dict(row) for row in cursor.fetchall()]
        return jsonify({"success": True, "sectors": sectors}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve sector telemetry: {str(e)}"}), 500
    finally:
        conn.close()

@app.route("/api/farm/sectors/<sector_id>/irrigate", methods=["POST"])
def api_farm_irrigate(sector_id):
    """Triggers smart irrigation cycle for a specific farm sector."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, soil_moisture, irrigation_status FROM farm_telemetry WHERE sector_id = ?", (sector_id,))
        sec = cursor.fetchone()
        if not sec:
            return jsonify({"error": "Sector not found"}), 404

        new_moisture = min(85.0, sec["soil_moisture"] + 15.0)
        cursor.execute("""
            UPDATE farm_telemetry
            SET soil_moisture = ?, irrigation_status = 'Active (Watering)', updated_at = CURRENT_TIMESTAMP
            WHERE sector_id = ?
        """, (new_moisture, sector_id))
        conn.commit()
        return jsonify({
            "success": True, 
            "message": f"Smart Drip Irrigation activated for {sector_id}. Soil moisture increased to {new_moisture}%."
        }), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ==============================================================
# ERROR HANDLERS
# ==============================================================
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": "Bad request", "message": str(e)}), 400

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found", "message": str(e)}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error", "message": "An unexpected error occurred."}), 500

# Ensure database is created on startup
with app.app_context():
    init_database()

if __name__ == "__main__":
    print(f"Starting Rythu Mitra AI Server on http://{config.HOST}:{config.PORT}")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
