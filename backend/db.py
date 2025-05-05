from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
from flask import g

# Load environment variables
load_dotenv(override=True)

# Create database connections with enhanced connection pooling
analytic_db_engine = create_engine(
    os.getenv("ANALYTIC_DB_CONNECTION_STRING"),
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # Recycle connections after 30 minutes
    pool_pre_ping=True,  # Check connection validity before using it
)

main_db_engine = create_engine(
    os.getenv("MAIN_DB_CONNECTION_STRING"),
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,  # Recycle connections after 30 minutes
    pool_pre_ping=True,  # Check connection validity before using it
)

# Create session factories
AnalyticSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=analytic_db_engine
)
MainSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=main_db_engine)

# Create scoped sessions for thread safety
AnalyticSession = scoped_session(AnalyticSessionLocal)
MainSession = scoped_session(MainSessionLocal)

# Base class for models
Base = declarative_base()


# Flask request context session management
def get_main_db():
    if "main_db" not in g:
        g.main_db = MainSessionLocal()
    return g.main_db


def get_analytic_db():
    if "analytic_db" not in g:
        g.analytic_db = AnalyticSessionLocal()
    return g.analytic_db


def close_main_db(e=None):
    db = g.pop("main_db", None)

    if db is not None:
        if e:
            db.rollback()
        else:
            try:
                db.commit()
            except Exception:
                db.rollback()
                raise
        db.close()


def close_analytic_db(e=None):
    db = g.pop("analytic_db", None)

    if db is not None:
        if e:
            db.rollback()
        else:
            try:
                db.commit()
            except Exception:
                db.rollback()
                raise
        db.close()


def init_app(app):
    """Initialize Flask app with database session management."""
    app.teardown_appcontext(close_main_db)
    app.teardown_appcontext(close_analytic_db)


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


@contextmanager
def main_db_session():
    """Context manager for main database session."""
    session = MainSessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@contextmanager
def analytic_db_session():
    """Context manager for analytics database session."""
    session = AnalyticSessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def execute_query(query, params=None, is_analytics_db=True):
    """Execute a raw SQL query and return the results as a pandas DataFrame."""
    engine = analytic_db_engine if is_analytics_db else main_db_engine
    with engine.connect() as connection:
        try:
            result = connection.execute(text(query), params or {})
            return pd.DataFrame(result.fetchall(), columns=result.keys())
        except Exception as e:
            print(f"Error executing query: {e}")
            # Close and dispose connection on error to ensure clean reconnect
            connection.close()
            raise


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


# Function to initialize the database schema
def init_db():
    """Initialize database schema."""
    # Import all models to ensure they are registered with Base
    import models

    # Create all tables
    Base.metadata.create_all(bind=main_db_engine)
