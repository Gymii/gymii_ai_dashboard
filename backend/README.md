# Gymii Analytics Backend

A Flask-based analytics backend for serving data from PostgreSQL databases to the Gymii Dashboard.

## Setup

1. Create a virtual environment:
```
python -m venv venv
```

2. Activate the virtual environment:
```
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Configure environment variables:
Edit the `.env` file with your actual database credentials:
```
ANALYTIC_DB_CONNECTION_STRING=postgresql://username:password@host:port/analytic_db
MAIN_DB_CONNECTION_STRING=postgresql://username:password@host:port/main_db
FLASK_DEBUG=True  # Set to False in production
PORT=5000
```

## Running the Server

Development mode:
```
python app.py
```

Production mode (using Gunicorn):
```
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Health Check
- `GET /health` - Verify the server is running

### Analytics
- `GET /api/analytics/retention` - Get user retention data
  - Query parameters:
    - `period`: 'daily', 'weekly', or 'monthly' (default: monthly)
    - `cohort_size`: 'daily', 'weekly', or 'monthly' (default: weekly)

- `GET /api/analytics/overview` - Get analytics overview

## Adding New Analytics

To add new analytics:
1. Create a new module in the `analytics` package
2. Add new endpoint(s) in the `routes.py` file
3. Implement the analytics logic in your new module 