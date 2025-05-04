from flask import Blueprint, jsonify, request, current_app
from analytics.retention import get_user_retention
from users.user import get_users
import pandas as pd
from data_store import refresh_all_data
from functools import wraps
import os
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

# Create analytics blueprint
analytics_bp = Blueprint("analytics", __name__)

# Define allowed admin emails
ADMIN_EMAILS = [
    "zzyzsy0516321@gmail.com",
    "zzyzsy0516321@yahoo.com",
    # Add other admin emails as needed
]


# Authentication decorator
def admin_required(f, special_privilege_required=False):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header is missing or invalid"}), 401

        # Extract the token
        token = auth_header.split("Bearer ")[1]

        try:
            print("token", token)
            # Verify the JWT token from Supabase
            # The JWT_SECRET should be set in your environment variables (from Supabase project)
            jwt_secret = os.environ.get("SUPABASE_JWT_SECRET")
            print("jwt_secret", jwt_secret)
            if not jwt_secret:
                return jsonify({"error": "Server configuration error"}), 500

            # Decode and verify the token
            payload = jwt.decode(
                token, jwt_secret, algorithms=["HS256"], audience="authenticated"
            )

            # Check if user email is in the allowed list
            user_email = payload.get("email")
            if not user_email or user_email not in ADMIN_EMAILS:
                return jsonify(
                    {"error": "Access denied. Your email is not authorized."}
                ), 403

        except ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except InvalidTokenError as e:
            print("invalid token error", e)
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            return jsonify({"error": f"Authentication error: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated_function


# Route to refresh queries
@analytics_bp.route("/refresh", methods=["POST"])
@admin_required
def refresh_queries():
    """Refresh all queries."""
    try:
        refresh_all_data()
        return jsonify({"message": "Queries refreshed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/retention", methods=["GET"])
@admin_required
def user_retention():
    """Get user retention data."""
    try:
        # Now get_user_retention returns a dictionary that jsonify can handle
        retention_data = get_user_retention()
        return jsonify(retention_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@analytics_bp.route("/users", methods=["GET"])
@admin_required
def users():
    """Get user retention data."""
    try:
        # Now get_user_retention returns a dictionary that jsonify can handle
        retention_data = get_users()
        return jsonify(retention_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
