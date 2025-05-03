import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Flask application configuration."""

    PORT = 5500
    DEBUG = True
    # Database configuration
    ANALYTIC_DB_URI = os.getenv("ANALYTIC_DB_CONNECTION_STRING")
    MAIN_DB_URI = os.getenv("MAIN_DB_CONNECTION_STRING")
