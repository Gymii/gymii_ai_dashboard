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


def delete_old_query_files(query_name, keep_latest=True):
    """
    Delete old query files for a specific query name

    Args:
        query_name: The base name of the query files
        keep_latest: Whether to keep the most recent file (default: True)
    """
    pattern = f"data/{query_name}_*.pkl"
    files = glob.glob(pattern)

    if not files:
        print(f"No files found for pattern: {pattern}")
        return

    # Also find matching CSV files
    csv_files = []
    for f in files:
        csv_path = f.replace(".pkl", ".csv")
        if os.path.exists(csv_path):
            csv_files.append(csv_path)

    if keep_latest and len(files) > 1:
        # Sort files by modification time (most recent first)
        files.sort(key=os.path.getmtime, reverse=True)
        # Keep the most recent file
        files_to_delete = files[1:]
    else:
        files_to_delete = [] if keep_latest else files

    # Delete pickle files
    for file in files_to_delete:
        if os.path.exists(file):  # Check if file exists before attempting to delete
            try:
                os.remove(file)
                print(f"Deleted old file: {file}")
            except Exception as e:
                print(f"Error deleting {file}: {e}")
        else:
            print(f"File not found, skipping: {file}")

    # Delete CSV files
    if keep_latest and len(csv_files) > 1:
        # Sort CSV files by modification time of corresponding pkl files
        csv_files.sort(
            key=lambda x: os.path.getmtime(
                x.replace(".csv", ".pkl")
                if os.path.exists(x.replace(".csv", ".pkl"))
                else 0
            ),
            reverse=True,
        )
        # Keep the most recent file
        csv_files_to_delete = csv_files[1:]
    else:
        csv_files_to_delete = [] if keep_latest else csv_files

    for file in csv_files_to_delete:
        if os.path.exists(file):  # Check if file exists before attempting to delete
            try:
                os.remove(file)
                print(f"Deleted old file: {file}")
            except Exception as e:
                print(f"Error deleting {file}: {e}")
        else:
            print(f"File not found, skipping: {file}")


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

    # Now delete old query files AFTER saving the new one
    try:
        delete_old_files_except_latest(name, pkl_file, csv_file)
    except Exception as e:
        print(f"Warning: Could not delete old files: {e}")

    return {
        "query_id": query_id,
        "file_name": file_name,
        "pkl_file": pkl_file,
        "csv_file": csv_file,
        "dataframe": df,
    }


def delete_old_files_except_latest(query_name, latest_pkl=None, latest_csv=None):
    """
    Delete all query files for a specific query name, except the specified latest files

    Args:
        query_name: The base name of the query files
        latest_pkl: The path to the latest pkl file to keep
        latest_csv: The path to the latest csv file to keep
    """
    pattern = f"data/{query_name}_*.pkl"
    files = glob.glob(pattern)

    if not files:
        print(f"No files found to delete for pattern: {pattern}")
        return

    # Delete all pkl files except the latest
    for file in files:
        if latest_pkl and os.path.abspath(file) == os.path.abspath(latest_pkl):
            continue  # Skip the latest file

        if os.path.exists(file):
            try:
                os.remove(file)
                print(f"Deleted old file: {file}")
            except Exception as e:
                print(f"Error deleting {file}: {e}")

    # Delete all CSV files except the latest
    pattern = f"data/{query_name}_*.csv"
    csv_files = glob.glob(pattern)

    for file in csv_files:
        if latest_csv and os.path.abspath(file) == os.path.abspath(latest_csv):
            continue  # Skip the latest file

        if os.path.exists(file):
            try:
                os.remove(file)
                print(f"Deleted old file: {file}")
            except Exception as e:
                print(f"Error deleting {file}: {e}")

    print(f"Cleaned up old files for query: {query_name}")


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


def clean_all_query_files(keep_latest=True):
    """
    Delete old query files for all queries in the analytics_to_run dictionary

    Args:
        keep_latest: Whether to keep the most recent file for each query (default: True)
    """
    for query_id, query_info in analytics_to_run.items():
        name = query_info["name"]
        delete_old_query_files(name, keep_latest)

    print("Cleaned up old query files")


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
    files = [f for f in files if os.path.exists(f)]
    if not files:
        print(f"No accessible files found for query '{query_id}'")
        return None

    latest_file = max(files, key=os.path.getmtime)

    if not os.path.exists(latest_file):
        print(f"Latest file not found: {latest_file}")
        return None

    print(f"Loading most recent data for '{query_id}' from {latest_file}")

    return load_saved_data(latest_file)


if __name__ == "__main__":
    # Clean up any existing old files first
    print("\nCleaning up old query files before running new queries...")
    for query_id, query_info in analytics_to_run.items():
        try:
            name = query_info["name"]
            print(f"Checking for old files for {query_id}...")
            pattern = f"data/{name}_*.pkl"
            files = glob.glob(pattern)
            if len(files) > 1:  # Only clean if there are multiple files
                print(f"Found {len(files)} files for {query_id}, cleaning up...")
                delete_old_files_except_latest(name)
        except Exception as e:
            print(f"Error cleaning up files for {query_id}: {e}")

    # Now run queries as normal
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
