from flask import Flask, jsonify
from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from data_store import init_data_store
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)


# Create database connections
analytic_db = create_engine(os.getenv("ANALYTIC_DB_CONNECTION_STRING"))
main_db = create_engine(os.getenv("MAIN_DB_CONNECTION_STRING"))

# Initialize global data store
query_data = init_data_store()

# Import routes
from routes import analytics_bp

# Register blueprints
app.register_blueprint(analytics_bp, url_prefix="/api/analytics")


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Analytics server is running"}), 200
