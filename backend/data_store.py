"""
Module for storing global query data in memory.
Provides functions to initialize, access, and refresh data.
"""

import pandas as pd
from typing import Dict, Optional, Any, TypedDict, List
from query_databases import run_query, run_all_queries, analytics_to_run, load_latest


# Define type for query result
class QueryResult(TypedDict):
    query_id: str
    file_name: str
    pkl_file: str
    csv_file: str
    dataframe: pd.DataFrame


# Global dictionary to store dataframes in memory
query_cache: Dict[str, pd.DataFrame] = {}


def init_data_store() -> Dict[str, pd.DataFrame]:
    """
    Initialize the data store with the latest data from each query.
    If no data exists, run the queries to populate the cache.
    """
    print("Initializing global data store...")
    for query_id in analytics_to_run:
        # Try to load the latest data first
        df: Optional[pd.DataFrame] = load_latest(query_id)

        # If no data exists, run the query
        if df is None:
            result: Optional[QueryResult] = run_query(query_id)
            if result and "dataframe" in result:
                df = result["dataframe"]

        # Store the dataframe in the global cache
        if df is not None:
            query_cache[query_id] = df
            print(f"Loaded data for '{query_id}' into memory cache")
        else:
            print(f"WARNING: No data loaded for '{query_id}'")

    return query_cache


def get_data(query_id: str) -> Optional[pd.DataFrame]:
    """
    Get data for a specific query ID from the cache.

    Args:
        query_id: ID of the query in analytics_to_run dictionary

    Returns:
        DataFrame with the cached data or None if not found
    """
    return query_cache.get(query_id)


def refresh_all_data() -> Dict[str, pd.DataFrame]:
    """
    Refresh all cached data by running all queries again.
    """
    print("Refreshing all data in cache...")
    results: Dict[str, QueryResult] = run_all_queries()

    # Update the global cache with new results
    for query_id, result in results.items():
        if result and "dataframe" in result:
            query_cache[query_id] = result["dataframe"]
            print(f"Refreshed data for '{query_id}' in memory cache")

    return query_cache


def refresh_query(query_id: str) -> bool:
    """
    Refresh a specific query in the cache.

    Args:
        query_id: ID of the query to refresh

    Returns:
        True if successful, False otherwise
    """
    if query_id not in analytics_to_run:
        print(f"Query ID '{query_id}' not found in analytics_to_run dictionary")
        return False

    result: Optional[QueryResult] = run_query(query_id)
    if result and "dataframe" in result:
        query_cache[query_id] = result["dataframe"]
        print(f"Refreshed data for '{query_id}' in memory cache")
        return True

    return False
