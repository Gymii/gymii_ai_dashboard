# Database Query Utility

This folder contains database query results and utilities for the Gymii dashboard.

## Running Queries

To run all predefined queries against both databases, run:

```bash
python3 backend/query_databases.py
```

This script will:
1. Check for the latest saved data for each query first
2. Run queries only if no existing data is found
3. Save the results as both pickle files (`.pkl`) and CSV files (`.csv`)

## Managing Queries

All queries are defined in the `analytics_to_run` dictionary at the top of the script. By default, it includes:

```python
analytics_to_run = {
    "users": {
        "query": "SELECT * FROM public.user",
        "is_analytics": False,
        "name": "main_users",
    },
    "dau": {
        "query": "SELECT * FROM dau_users",
        "is_analytics": True,
        "name": "analytics_dau_users",
    },
    "daily_signups": {
        "query": "SELECT COUNT(*) as user_count FROM public.user GROUP BY signup_date ORDER BY signup_date DESC LIMIT 30",
        "is_analytics": False,
        "name": "daily_signups",
    }
}
```

### Adding Custom Queries

You can add new queries using the `add_query` function:

```python
from backend.query_databases import add_query, run_query

# Add a new query
add_query(
    query_id="active_users_last_week",
    query_string="SELECT COUNT(*) as active_count FROM user_sessions WHERE login_date > CURRENT_DATE - 7",
    is_analytics=True,
    name="weekly_active_users"
)

# Run your newly added query
result = run_query("active_users_last_week")

# Access the DataFrame with results
df = result["dataframe"]
print(df.head())
```

### Removing Queries

To remove a query from the dictionary:

```python
from backend.query_databases import remove_query

remove_query("daily_signups")
```

## Running Individual Queries

To run a specific query:

```python
from backend.query_databases import run_query

# Run a specific query by its ID in the analytics_to_run dictionary
result = run_query("users")

# The function returns a dictionary with:
# - query_id: The ID of the query that was run
# - file_name: Base name of the saved files
# - pkl_file: Path to the pickle file
# - csv_file: Path to the CSV file
# - dataframe: The pandas DataFrame with query results
```

## Loading Saved Data

You can load previously saved data in your Python code:

### Load Specific File

```python
from backend.query_databases import load_saved_data

# Load data by providing the path to the pickle file
df = load_saved_data("data/main_users_YYYY-MM-DD_HH-MM-SS.pkl")

# Use the data for analysis or visualization
print(df.head())
```

### Load Latest Data Without Running Queries

```python
from backend.query_databases import load_latest

# Load the most recent data for a query by its ID
dau_df = load_latest("dau")
users_df = load_latest("users")

# Use the data without having to run the queries again
if dau_df is not None:
    print(dau_df.head())
```

This is useful when you want to work with the most recent data without having to re-run potentially expensive database queries.

## File Naming Convention

Files are saved with the name pattern `{name}_{timestamp}.{extension}` where:
- `name` is the name specified in the query definition
- `timestamp` is the current date and time in `YYYY-MM-DD_HH-MM-SS` format
- `extension` is either `pkl` for pickle files or `csv` for CSV files 