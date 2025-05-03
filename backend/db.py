from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create database connections
analytic_db_engine = create_engine(os.getenv("ANALYTIC_DB_CONNECTION_STRING"))
main_db_engine = create_engine(os.getenv("MAIN_DB_CONNECTION_STRING"))

# Create session factories
AnalyticSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=analytic_db_engine
)
MainSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=main_db_engine)

# Base class for models
Base = declarative_base()


def get_analytic_db_session():
    """Get a session for the analytics database."""
    db = AnalyticSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_main_db_session():
    """Get a session for the main database."""
    db = MainSessionLocal()
    try:
        yield db
    finally:
        db.close()


def execute_query(query, params=None, is_analytics_db=True):
    """Execute a raw SQL query and return the results as a pandas DataFrame."""
    engine = analytic_db_engine if is_analytics_db else main_db_engine
    with engine.connect() as connection:
        result = connection.execute(text(query), params or {})
        return pd.DataFrame(result.fetchall(), columns=result.keys())


def check_connection():
    """Check database connections and return status."""
    status = {"analytics_db": False, "main_db": False}

    try:
        with analytic_db_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            status["analytics_db"] = True
    except Exception as e:
        status["analytics_db_error"] = str(e)

    try:
        with main_db_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            status["main_db"] = True
    except Exception as e:
        status["main_db_error"] = str(e)

    return status
