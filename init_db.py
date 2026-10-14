#!/usr/bin/env python3
"""
Rythu Mitra AI - Database Initialization Script
Initializes tables, indexes, and initial reference data for local execution.
"""
from database import init_database

if __name__ == "__main__":
    print("Initializing Rythu Mitra AI SQLite Database...")
    init_database()
    print("Database initialization complete.")
