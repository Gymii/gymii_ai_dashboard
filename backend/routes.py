from flask import Blueprint, jsonify, request
from analytics.retention import get_user_retention
from users.user import get_users
import pandas as pd
from data_store import refresh_all_data

# Create analytics blueprint
analytics_bp = Blueprint("analytics", __name__)


# Route to refresh queries
@analytics_bp.route("/refresh", methods=["POST"])
def refresh_queries():
    """Refresh all queries."""
    try:
        refresh_all_data()
        return jsonify({"message": "Queries refreshed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/retention", methods=["GET"])
def user_retention():
    """Get user retention data."""
    try:
        # Now get_user_retention returns a dictionary that jsonify can handle
        retention_data = get_user_retention()
        return jsonify(retention_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/users", methods=["GET"])
def users():
    """Get user retention data."""
    try:
        # Now get_user_retention returns a dictionary that jsonify can handle
        retention_data = get_users()
        return jsonify(retention_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
