import sqlite3
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from config import config

def get_db_path() -> Path:
    """Returns the active database path from environment or config."""
    import os
    env_path = os.getenv("DATABASE_PATH")
    if env_path:
        return Path(env_path)
    return Path(config.DATABASE_PATH)

def get_db_connection() -> sqlite3.Connection:
    """Creates a connection to SQLite database with row factory enabled."""
    db_path = get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_database() -> None:
    """Initializes the database schema and performs necessary migrations."""
    db_path = get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    -- Farmers table
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        village TEXT,
        district TEXT,
        state TEXT DEFAULT 'Telangana',
        primary_crop TEXT,
        land_acres REAL DEFAULT 0.0,
        preferred_language TEXT DEFAULT 'te',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Active user sessions
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Crop disease scans and diagnoses
    CREATE TABLE IF NOT EXISTS disease_scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        crop_name TEXT,
        image_path TEXT,
        symptom_description TEXT,
        input_method TEXT,
        disease_name TEXT NOT NULL,
        disease_name_te TEXT,
        disease_name_hi TEXT,
        confidence REAL DEFAULT 0.0,
        severity TEXT DEFAULT 'Medium',
        possible_causes TEXT,
        treatment_organic TEXT,
        treatment_chemical TEXT,
        preventive_measures TEXT,
        ai_provider TEXT DEFAULT 'local_expert',
        api_configured INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 3D Digital Twin Farm Sectors & IoT Telemetry
    CREATE TABLE IF NOT EXISTS farm_telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        sector_id TEXT NOT NULL,
        sector_name TEXT NOT NULL,
        crop_type TEXT NOT NULL,
        soil_moisture REAL NOT NULL,
        soil_temp REAL NOT NULL,
        soil_ph REAL NOT NULL,
        nitrogen REAL NOT NULL,
        phosphorus REAL NOT NULL,
        potassium REAL NOT NULL,
        irrigation_status TEXT DEFAULT 'optimal',
        health_index REAL DEFAULT 92.0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_scans_user ON disease_scans(user_id);
    """)

    # Seed initial telemetry for standard 3D farm sectors if table empty
    cursor.execute("SELECT COUNT(*) as count FROM farm_telemetry;")
    count = cursor.fetchone()["count"]
    if count == 0:
        default_sectors = [
            ("sec-1", "North Sector A - Paddy (వరి)", "Rice/Paddy", 68.5, 27.2, 6.8, 142.0, 38.0, 185.0, "Optimal", 94.5),
            ("sec-2", "East Sector B - Cotton (పత్తి)", "Cotton", 42.1, 29.8, 7.2, 110.0, 45.0, 160.0, "Needs Irrigation", 81.0),
            ("sec-3", "South Sector C - Red Chilli (మిరప)", "Chilli", 54.0, 28.5, 6.5, 128.0, 52.0, 210.0, "Optimal", 88.5),
            ("sec-4", "West Sector D - Maize & Groundnut", "Maize", 49.3, 28.0, 6.7, 135.0, 40.0, 175.0, "Optimal", 91.0),
        ]
        for sec in default_sectors:
            cursor.execute("""
            INSERT INTO farm_telemetry 
            (user_id, sector_id, sector_name, crop_type, soil_moisture, soil_temp, soil_ph, nitrogen, phosphorus, potassium, irrigation_status, health_index)
            VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, sec)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_database()
    print("Database schema successfully verified and initialized.")
