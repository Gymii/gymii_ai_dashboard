from flask import Blueprint, jsonify, request, g
from db import get_main_db
from models import User, AdminComment
from functools import wraps
import os
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError

admin_bp = Blueprint("admin", __name__)

# Define allowed admin emails
ADMIN_EMAILS = [
    "zzyzsy0516321@gmail.com",
    "zzyzsy0516321@yahoo.com",
    "hkselinali@gmail.com",
    "alex.taic@gmail.com",
    "rna.jng@gmail.com",
]


# Authentication decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header is missing or invalid"}), 401

        # Extract the token
        token = auth_header.split("Bearer ")[1]

        try:
            # Verify the JWT token from Supabase
            # The JWT_SECRET should be set in your environment variables (from Supabase project)
            jwt_secret = os.environ.get("SUPABASE_JWT_SECRET")
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

            # Store the email in Flask's g object for access in the route
            g.admin_email = user_email

        except ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except InvalidTokenError as e:
            print("invalid token error", e)
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            return jsonify({"error": f"Authentication error: {str(e)}"}), 401

        return f(*args, **kwargs)

    return decorated_function


@admin_bp.route("/", methods=["GET"])
@admin_required
def get_users():
    """Get all users."""
    db = get_main_db()
    users = db.query(User).all()
    return jsonify([user.to_dict() for user in users])


@admin_bp.route("/<int:user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    """Get a specific user."""
    db = get_main_db()
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())


@admin_bp.route("/<int:user_id>/comments", methods=["GET"])
@admin_required
def get_admin_comments(user_id):
    """Get all admin comments for a user."""
    db = get_main_db()
    comments = db.query(AdminComment).filter(AdminComment.user_id == user_id).all()
    return jsonify([comment.to_dict() for comment in comments])


@admin_bp.route("/<int:user_id>/comments", methods=["POST"])
@admin_required
def create_admin_comment(user_id):
    """Create a new admin comment for a user."""
    data = request.json
    db = get_main_db()

    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get the admin user based on email
    admin_email = g.admin_email
    admin_user = db.query(User).filter(User.email == admin_email).first()

    if not admin_user:
        return jsonify({"error": "Admin user not found in database"}), 500

    # Create new comment
    comment = AdminComment(
        user_id=user_id,
        author_id=admin_user.id,  # Use the authenticated admin's ID
        text=data.get("text"),
        mood=data.get("mood"),
    )

    db.add(comment)
    # No need to commit - will be handled by teardown function

    return jsonify(comment.to_dict()), 201


@admin_bp.route("/comments/<int:comment_id>", methods=["PUT"])
@admin_required
def update_admin_comment(comment_id):
    """Update an admin comment."""
    data = request.json
    db = get_main_db()

    comment = db.query(AdminComment).filter(AdminComment.id == comment_id).first()
    if not comment:
        return jsonify({"error": "Comment not found"}), 404

    if "text" in data:
        comment.text = data["text"]
    if "mood" in data:
        comment.mood = data["mood"]

    # No need to commit - will be handled by teardown function

    return jsonify(comment.to_dict())


@admin_bp.route("/comments/<int:comment_id>", methods=["DELETE"])
@admin_required
def delete_admin_comment(comment_id):
    """Delete an admin comment."""
    db = get_main_db()

    comment = db.query(AdminComment).filter(AdminComment.id == comment_id).first()
    if not comment:
        return jsonify({"error": "Comment not found"}), 404

    db.delete(comment)
    # No need to commit - will be handled by teardown function

    return jsonify({"message": "Comment deleted successfully"})


@admin_bp.route("/me", methods=["GET"])
@admin_required
def get_current_admin():
    """Get current admin user info."""
    admin_email = g.admin_email
    return jsonify(
        {"email": admin_email, "message": f"Authenticated as admin: {admin_email}"}
    )
