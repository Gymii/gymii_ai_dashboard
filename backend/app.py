from flask import Flask, jsonify
from dotenv import load_dotenv
import os
from data_store import init_data_store
from flask_cors import CORS
from db import analytic_db_engine, main_db_engine, check_connection

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize global data store
query_data = init_data_store()

# Import routes
from routes import analytics_bp

# Register blueprints
app.register_blueprint(analytics_bp, url_prefix="/api/analytics")


@app.route("/health", methods=["GET"])
def health_check():
    # Check database connections
    db_status = check_connection()
    status = {
        "server": "healthy",
        "message": "Analytics server is running",
        "database": db_status,
    }
    return jsonify(status), 200
