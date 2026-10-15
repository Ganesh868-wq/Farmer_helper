# RYTHU MITRA AI (రైతు మిత్ర AI) 🌾🤖
### Full-Stack 3D Smart Farming & Multimodal AI Agronomist Web Application

[![Python](https://img.shields.io/badge/Python-3.14%20%7C%203.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1+-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20WebGL-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-24%20Passed-10b981.svg)]()

> **రైతు మిత్ర AI (Farmer's Friend AI)** is a production-grade, farmer-centric web application built for the agricultural communities of Andhra Pradesh, Telangana, and India. It unifies an interactive **3D Digital Twin Farm Visualizer**, a **Multimodal AI Crop Doctor** (with camera, photo upload, and regional voice speech input), **Live Hyperlocal Weather & Spray Advisories**, **Mandi APMC Market Prices & MSP Analytics**, and **Government Welfare Schemes** with trilingual support (**తెలుగు Telugu**, **हिंदी Hindi**, and **English**) and voice text-to-speech output.

---

## 🚀 Key Features

1. **🌾 3D Farm Digital Twin (WebGL / Three.js)**:
   - Interactive 3D farmland terrain divided into customizable crop sectors (Paddy/వరి, Cotton/పత్తి, Chilli/మిరప, Maize/మొక్కజొన్న).
   - Real-time IoT sensor telemetry beacons (Soil Moisture, Soil Temperature, pH, and NPK nutrients).
   - Interactive controls: **Day/Night Lighting Cycle**, **Rain & Monsoon Simulator**, **Autonomous Drone Flyover Survey Mode** with false-color NDVI health heatmap visualization, and **Smart Drip Irrigation** triggering.

2. **🩺 Multimodal AI Crop Disease Doctor**:
   - **Direct Camera & Photo Upload**: Capture leaves via mobile/webcam or upload JPG/PNG/WEBP images.
   - **Voice Speech-to-Text Input**: Farmers can speak symptoms directly in **Telugu (తెలుగు)**, **Hindi (हिंदी)**, or **English** using native browser speech recognition.
   - **Dual AI Engine**:
     - *Google Gemini AI*: Deep multimodal pathology diagnosis when `GEMINI_API_KEY` is configured.
     - *Built-in Computer Vision & Agronomic Expert System*: Uses OpenCV leaf color space analysis (chlorophyll ratio, chlorosis yellowing, necrotic brown lesion counting) and a verified agronomic pathology knowledge base.
   - **Farmer Audio Output**: Instant native speech synthesis ("వినండి / Listen") readout of diagnosis and treatments in Telugu, Hindi, or English.
   - Complete treatment plans including **organic formulations** (Neem oil, Sour buttermilk, Trichoderma) and **exact scientific chemical dosages per liter**.

3. **🌦️ Live Hyperlocal Weather & Spray Advisories**:
   - Integrated with **Open-Meteo Real-Time Global Agro-Meteorological Network** (100% genuine live weather data without requiring an API key).
   - Browser geolocation auto-detect + pre-configured major agricultural districts (Warangal, Guntur, Khammam, Kurnool, Karimnagar, Nalgonda, Anantapur, Vijayawada, Nizamabad, Hyderabad).
   - Calculates specific **Crop Spraying Safety Windows** (warns against washing out fertilizers before rain or drift in high wind).
   - 7-day daily and hourly forecast cards.

4. **💰 Mandi Market Prices & MSP Analytics (Mandi Bhav)**:
   - Daily modal rates, minimum/maximum prices, and arrivals for major commodities: Paddy (Grade-A), Cotton, Red Chilli (Teja), Maize, Turmeric, Groundnut, Red Gram (Toor), Bengal Gram (Chana).
   - Benchmark comparison against Government of India **Minimum Support Prices (MSP 2024-25 / 2025-26)**.
   - AI **Best Time to Sell** advisory based on seasonal market trends and storage risks.

5. **💡 Soil & Season Crop Recommendation Engine**:
   - Filter by Soil Type (Black Cotton, Red Chalka, Loam, Sandy), Season (Kharif, Rabi, Summer), and Irrigation source (Canal, Borewell, Rainfed).
   - Computes match percentage, expected duration, seed rate per acre, projected yield, and estimated net profit.

6. **🏛️ Government Agricultural Schemes Directory**:
   - Complete guides for **PM-KISAN** (₹6,000/yr), **Rythu Bharosa / Rythu Bandhu**, **PMFBY Crop Insurance**, **PM-KUSUM Solar Pumps** (60-80% subsidy), **Micro-Irrigation Drip Subsidy** (up to 90%), and **Kisan Credit Card (KCC)** low-interest loans.
   - Eligibility checklists, required documents, and official portal application links.

7. **🌿 Organic Recipes & Integrated Pest Management (IPM)**:
   - Proven traditional bio-formulations: *Jeevamrutham* (జీవామృతం), *Neemastra* (నిమాస్త్రం), *Brahmastra* (బ్రహ్మాస్త్రం), and *Sour Buttermilk Spray* with exact ingredient proportions and fermentation steps.

8. **☀️ High-Contrast Sunlight Mode & Multilingual Accessibility**:
   - Instant toggle for outdoor high-contrast daylight mode (pure blacks, bold typography, large 48px+ touch targets).
   - Full trilingual translation engine (English, Telugu, Hindi).

9. **🔒 Secure Authentication & Data Privacy**:
   - Farmer registration & login using 10-digit mobile number and PBKDF2-HMAC-SHA256 password hashing with unique 16-byte cryptographic salts.
   - Session token management stored in SQLite.
   - Zero hardcoded secrets: all API keys strictly loaded from environment variables (`.env`).

10. **🛸 Real Agricultural Drone Connection & Telemetry HUD**:
    - **Connect Drone Button**: Prominently integrated into the 3D Farm Visualizer HUD adjacent to Drone Survey mode.
    - **Supported Drone Protocols**:
      - MAVLink 2.0 (ArduPilot / PX4 Hexacopter/Octocopter spray drones, IoTechWorld, Garuda, Marut).
      - DJI Agriculture Cloud API & Mobile SDK webhook gateways (DJI Agras T40, T30, T20P).
    - **Field Gateway Bridge (`tools/drone_bridge.py`)**: Forwards telemetry from field radios (SiK 433/915MHz) or UDP companion computers across private NAT to cloud servers.
    - **Live Telemetry Dashboard**: Real-time battery %, voltage, GPS coordinates, RTK fix, satellite count, altitude (AGL & MSL), ground speed, heading, and flight mode with 10-second heartbeat timeout detection.
    - **Isolated Demo Mode**: Realistic survey flight simulation over Warangal farm coordinates for offline demonstrations and interface testing without pretending to be a real device.
    - **Rule 14 & Safety Compliant**: Displays "Not available" when hardware fields are absent; never fakes connection; no automatic flight actuation commands.

---

## 📁 Project Architecture & File Layout

```text
rythu mitra AI/
├── .env                  # Local environment configuration (git ignored)
├── .env.example          # Template environment file documenting all variables
├── .gitignore            # Git ignore preventing secret or DB leaks
├── README.md             # Project documentation and setup guide
├── requirements.txt      # Python dependencies
├── config.py             # Configuration loader with safe fallbacks
├── database.py           # SQLite connection, migrations, and table schema
├── init_db.py            # Standalone database initialization script
├── auth.py               # PBKDF2 authentication, sessions, and security
├── app.py                # Main Flask REST API & Web Application server
│
├── services/             # Domain Services Layer
│   ├── __init__.py
│   ├── disease_service.py   # AI & OpenCV crop disease pathology engine
│   ├── weather_service.py   # Live Open-Meteo & spray advisory service
│   ├── market_service.py    # Mandi commodity rates & MSP benchmarks
│   ├── crop_service.py      # Agronomic crop planning recommendation engine
│   ├── schemes_service.py   # Government welfare & subsidy directory
│   ├── guidance_service.py  # Organic pesticide recipes & IPM manual
│   └── drone_service.py     # Agricultural Drone Telemetry & Connection service
│
├── static/               # Client-Side Assets
│   ├── css/
│   │   └── style.css        # Responsive, high-contrast accessible styles
│   ├── js/
│   │   ├── translations.js  # Trilingual dictionary (Telugu, Hindi, English)
│   │   ├── voice.js         # Speech recognition & text-to-speech engine
│   │   ├── farm3d.js        # Three.js 3D Digital Twin Farm Visualizer
│   │   ├── drone.js         # Drone Connection & Telemetry Controller
│   │   └── app.js           # Main UI controller & API coordinator
│   └── assets/
│       └── logo.svg         # SVG Brand Logo
│
├── templates/
│   └── index.html           # Single-Page Web Application template
│
├── tools/
│   └── drone_bridge.py      # Field MAVLink & Serial telemetry gateway forwarder
│
├── tests/                # Automated Test Suite (24 Tests)
│   ├── __init__.py
│   ├── test_auth.py         # Authentication & password hashing tests
│   ├── test_api.py          # API endpoints integration tests
│   ├── test_diagnostics.py  # Disease diagnosis & voice tests
│   ├── test_weather.py      # Weather, market, schemes, & recipes tests
│   └── test_drone.py        # Drone connection, ingest & simulation tests
│
└── uploads/
    └── scans/               # Uploaded crop scan images
```

---

## ⚡ Quick Start & Local Execution

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.14 on Windows)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 2. Install Dependencies
Open PowerShell or Terminal inside the project folder:
```powershell
python -m pip install -r requirements.txt
```

### 3. Initialize the Database
Run the database migration script to set up tables and initial 3D farm sector telemetry:
```powershell
python init_db.py
```

### 4. Start the Application Server
```powershell
python app.py
```
Output:
```text
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### 5. Open in Web Browser
Navigate to:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## ⚙️ Environment Variables Configuration (`.env`)

Rythu Mitra AI uses `.env` for secrets and API keys. A pre-configured `.env` is created for local execution. To configure external cloud providers, edit `.env`:

```ini
# Application Settings
FLASK_ENV=development
FLASK_DEBUG=1
PORT=5000
HOST=127.0.0.1
SECRET_KEY=your-secure-random-secret-key-here
DATABASE_PATH=rythu_mitra.db

# External AI Service (Google Gemini API - Optional)
# When left empty, Rythu Mitra transparently runs in Local Expert & CV Mode
GEMINI_API_KEY=

# External Weather Service (OpenWeatherMap API - Optional)
# By default, Rythu Mitra uses Open-Meteo for live real-time forecasts without needing any key.
OPENWEATHER_API_KEY=

# Open Data / Mandi API (data.gov.in - Optional)
DATA_GOV_IN_API_KEY=

# Agricultural Drone Telemetry Ingestion (Optional / Recommended for Field Drones)
DRONE_API_KEY=your-drone-secret-key
DRONE_CONNECTION_ENDPOINT=
```

> **Transparency (Rule 14 Compliant)**: If `GEMINI_API_KEY` is not provided, Rythu Mitra AI does **not** fake external AI calls. It explicitly displays:
> `Source: Local Agri-Expert Knowledgebase & OpenCV Computer Vision Leaf Analyzer (External API key not configured in .env)`.
> Similarly, in Drone Mode, real connection is never faked: missing parameters display "Not available", and offline hardware transitions cleanly into an Error state with a Retry option.

---

## 🛸 Agricultural Drone Connection & Telemetry Bridge

### 1. Connecting a Real Agricultural Drone
Physical drones operate on local private networks (e.g., telemetry radios on COM/USB or companion computers on Wi-Fi). To bridge telemetry to RythuMitra AI:

```powershell
# Option A: Connect real MAVLink radio (SiK 433/915MHz) on COM port:
python tools/drone_bridge.py --connect COM3 --baud 57600 --url http://127.0.0.1:5000

# Option B: Connect to local UDP telemetry stream (Mission Planner / QGroundControl / DroneKit):
python tools/drone_bridge.py --connect udp:127.0.0.1:14550 --url https://rythu-mitra-ai.onrender.com --api-key YOUR_SECRET_KEY

# Option C: Test live telemetry transmission to cloud endpoint without hardware:
python tools/drone_bridge.py --test-stream --url http://127.0.0.1:5000
```

### 2. Demo Simulation Mode
If physical drone hardware is not currently connected, click the **Connect Drone** button in the 3D Farm Visualizer HUD, select **Demo Mode (Simulation)**, and click **Start Demo Mode**. This activates a realistic survey flight simulation over farm coordinates with full telemetry for interface evaluation.

---

## 🧪 Running Automated Tests

Rythu Mitra AI includes 24 automated unit and integration tests covering authentication, REST APIs, OpenCV diagnostics, weather advisories, market rates, crop recommendations, and real/demo drone connection logic.

Run all tests:
```powershell
python -m unittest discover tests
```

Expected result:
```text
........................
----------------------------------------------------------------------
Ran 24 tests in 9.212s

OK
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/` | Serves the Single-Page Web Application UI | No |
| `GET` | `/api/health` | Health check & external services config status | No |
| `GET` | `/api/drone/status` | Real-time drone connection status & telemetry | No |
| `POST` | `/api/drone/connect` | Initiates drone connection or demo simulation | No |
| `POST` | `/api/drone/disconnect` | Disconnects active drone session & resets state | No |
| `POST` | `/api/drone/telemetry/ingest` | Secure ingestion endpoint for drone bridges & gateways | Token (`X-Drone-Api-Key`) |
| `POST` | `/api/auth/register` | Register farmer (Phone, Password, Name, Village, Land) | No |
| `POST` | `/api/auth/login` | Authenticate farmer & return session token | No |
| `GET` | `/api/auth/me` | Fetch authenticated farmer profile | **Yes** |
| `POST` | `/api/auth/logout` | Terminate active farmer session | No |
| `POST` | `/api/diagnose/image` | Upload leaf photo / camera capture for AI diagnosis | No |
| `POST` | `/api/diagnose/text` | Voice speech-to-text or typed symptom diagnosis | No |
| `GET` | `/api/diagnose/history` | Retrieve past diagnostic scans | No |
| `GET` | `/api/weather/live` | Live weather & spray advisory by coordinates | No |
| `GET` | `/api/weather/district/<name>` | Live weather by district name | No |
| `GET` | `/api/market/prices` | APMC Mandi rates, MSP benchmarks, and AI advice | No |
| `GET` | `/api/crops/recommendations` | Soil & season-based crop planning recommendations | No |
| `GET` | `/api/schemes` | Central & State agricultural welfare schemes | No |
| `GET` | `/api/guidance/recipes` | Organic pesticide recipes & IPM manual | No |
| `GET` | `/api/farm/sectors` | 3D farm sector telemetry (moisture, temp, pH, NPK) | No |
| `POST` | `/api/farm/sectors/<id>/irrigate` | Trigger smart drip irrigation for sector | No |

---

## 👥 Multilingual & Accessibility

- **తెలుగు (Telugu)**: Native phrasing designed with local agricultural terminologies (*అగ్గి తెగులు, ఆకు ముడత, కాయ కుళ్ళు, జీవామృతం, నిమాస్త్రం*).
- **हिंदी (Hindi)**: Authentic northern and central Indian agricultural vocabulary (*झुलसा रोग, लीफ कर्ल, मंडी भाव, जीवामृत*).
- **English**: Comprehensive scientific and trade terminology.
- **🔊 Voice Synthesis (TTS)**: Every diagnostic result, spray warning, and market price includes a 1-tap audio speech button for illiterate or elderly farmers.
- **☀️ Sunlight High-Contrast Mode**: Increases contrast ratios to maximum readability when operating smartphones under scorching outdoor field sunlight.

---

## 📄 License
This project is open-source under the MIT License.
