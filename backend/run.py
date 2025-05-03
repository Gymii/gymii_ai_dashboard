"""
Entry point script to run the Flask application.
"""

from app import app
from flask import current_app
from db import check_connection
from config import Config

if __name__ == "__main__":
    # Check database connections
    db_status = check_connection()

    if not db_status["analytics_db"]:
        print(
            f"WARNING: Analytics database connection failed: {db_status.get('analytics_db_error', 'Unknown error')}"
        )
    else:
        print("Analytics database connection successful")

    if not db_status["main_db"]:
        print(
            f"WARNING: Main database connection failed: {db_status.get('main_db_error', 'Unknown error')}"
        )
    else:
        print("Main database connection successful")

    app.config.from_object(Config)
    # Run the app
    app.run(debug=app.config["DEBUG"], host="0.0.0.0", port=app.config["PORT"])
