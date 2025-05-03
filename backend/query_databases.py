import os
import pandas as pd
import glob
from datetime import datetime
from db import execute_query

# Ensure the data directory exists
os.makedirs("data", exist_ok=True)

# Dictionary of queries to run
analytics_to_run = {
    "users": {
        "query": "SELECT * FROM user_subscription_profile",
        "is_analytics": False,
        "name": "users",
    },
    "dau": {
        "query": "SELECT * FROM dau_users",
        "is_analytics": True,
        "name": "analytics_dau_users",
    },
    "retention": {
        "query": "SELECT * FROM daily_retention_rates",
        "is_analytics": True,
        "name": "retention",
    },
}


def run_query(query_id):
    """
    Run a specific query from the analytics_to_run dictionary

    Args:
        query_id: The key in analytics_to_run dictionary

    Returns:
        Dict with information about saved files
    """
    if query_id not in analytics_to_run:
        print(f"Query ID '{query_id}' not found in analytics_to_run dictionary")
        return None

    query_info = analytics_to_run[query_id]
    query_string = query_info["query"]
    is_analytics_db = query_info["is_analytics"]
    name = query_info["name"]

    # Generate timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_name = f"{name}_{timestamp}"

    # Run query
    db_type = "analytics" if is_analytics_db else "main"
    print(f"Querying {db_type} database: {query_id}")
    df = execute_query(query_string, is_analytics_db=is_analytics_db)

    # Save results
    pkl_file = f"data/{file_name}.pkl"
    csv_file = f"data/{file_name}.csv"

    df.to_pickle(pkl_file)
    df.to_csv(csv_file, index=False)

    print(f"Query results saved to {pkl_file} and {csv_file}")

    return {
        "query_id": query_id,
        "file_name": file_name,
        "pkl_file": pkl_file,
        "csv_file": csv_file,
        "dataframe": df,
    }


def run_all_queries():
    """
    Run all queries defined in analytics_to_run dictionary

    Returns:
        Dict of query IDs mapping to their results
    """
    results = {}

    for query_id in analytics_to_run:
        print(f"\nExecuting query: {query_id}")
        results[query_id] = run_query(query_id)

    return results


def add_query(query_id, query_string, is_analytics=True, name=None):
    """
    Add a new query to the analytics_to_run dictionary

    Args:
        query_id: Unique identifier for the query
        query_string: SQL query to execute
        is_analytics: Whether to run on analytics DB (True) or main DB (False)
        name: Base name for saved files (defaults to query_id)
    """
    if name is None:
        name = query_id

    analytics_to_run[query_id] = {
        "query": query_string,
        "is_analytics": is_analytics,
        "name": name,
    }

    print(f"Added query '{query_id}' to analytics_to_run dictionary")


def remove_query(query_id):
    """Remove a query from the analytics_to_run dictionary"""
    if query_id in analytics_to_run:
        del analytics_to_run[query_id]
        print(f"Removed query '{query_id}' from analytics_to_run dictionary")
    else:
        print(f"Query '{query_id}' not found in analytics_to_run dictionary")


def load_saved_data(file_path):
    """
    Load previously saved query results

    Args:
        file_path: Path to the saved pickle file

    Returns:
        DataFrame with the loaded data or None if file doesn't exist
    """
    pkl_file = file_path if file_path.endswith(".pkl") else f"{file_path}.pkl"

    if os.path.exists(pkl_file):
        df = pd.read_pickle(pkl_file)
        print(f"Loaded data from {pkl_file}")
        return df
    else:
        print(f"File not found: {pkl_file}")
        return None


def load_latest(query_id):
    """
    Load the most recent data for a given query ID without running the query again.

    Args:
        query_id: The key in analytics_to_run dictionary

    Returns:
        DataFrame with the loaded data or None if no files found
    """
    if query_id not in analytics_to_run:
        print(f"Query ID '{query_id}' not found in analytics_to_run dictionary")
        return None

    name = analytics_to_run[query_id]["name"]
    # Find all files matching the pattern
    pattern = f"data/{name}_*.pkl"
    files = glob.glob(pattern)

    if not files:
        print(f"No saved data found for query '{query_id}' (pattern: {pattern})")
        return None

    # Sort files by modification time (most recent first)
    latest_file = max(files, key=os.path.getmtime)
    print(f"Loading most recent data for '{query_id}' from {latest_file}")

    return load_saved_data(latest_file)


if __name__ == "__main__":
    # Check if we have the latest data first
    print("\nChecking for latest data before running queries:")
    latest_dau = load_latest("dau")
    latest_users = load_latest("users")

    if latest_dau is not None:
        print("\nLatest DAU users found. Sample:")
        print(latest_dau.head())
    else:
        print("\nNo existing DAU data found, running query...")
        dau_result = run_query("dau")
        if dau_result:
            print("\nDAU users sample:")
            print(dau_result["dataframe"].head())

    if latest_users is not None:
        print("\nLatest Users found. Sample:")
        print(latest_users.head())
    else:
        print("\nNo existing users data found, running query...")
        users_result = run_query("users")
        if users_result:
            print("\nUsers sample:")
            print(users_result["dataframe"].head())
