# Add parent directory to Python path
import sys
import os

# Get the current directory and append it to the Python path
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(current_dir)

# View path
print(sys.path)

import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from db import execute_query
from data_store import query_cache
import pandas as pd
import numpy as np
from datetime import datetime, timedelta


def convert_numpy_types(df):
    """
    Convert all numpy data types in a DataFrame to native Python types.
    This ensures the DataFrame can be properly serialized to JSON.

    Args:
        df (pandas.DataFrame): DataFrame to convert

    Returns:
        pandas.DataFrame: DataFrame with converted data types
    """
    for col in df.columns:
        if df[col].dtype == "int64":
            df[col] = df[col].astype(int)
        elif df[col].dtype == "float64":
            df[col] = df[col].astype(float)
    return df


def get_user_retention():
    """
    Calculate user retention metrics and return as a Python dictionary
    that can be JSON serialized.
    """
    retention_df = query_cache["retention"]
    return retention_df.to_dict(orient="records")


def get_user_retention_by_cohort():
    """
    Calculate user retention metrics by cohort and return as a Python dictionary
    that can be JSON serialized.
    """
    dau_df = query_cache["dau"]
    user_df = query_cache["users"]

    # First, let's process dau_df to get actual user IDs by date
    dau_processed = dau_df.copy()

    # Ensure unique_users is actually a list of user IDs
    if isinstance(dau_df["unique_users"].iloc[0], str):
        dau_processed["unique_users"] = dau_df["unique_users"].apply(eval)

    # Convert dates to datetime objects if they're not already
    dau_processed["date"] = pd.to_datetime(dau_processed["date"])
    user_df["created_at"] = pd.to_datetime(user_df["created_at"])

    # Create a dictionary to map dates to active users
    date_to_users = dict(zip(dau_processed["date"], dau_processed["unique_users"]))

    # Group users by creation date to form cohorts
    user_df["created_date"] = user_df["created_at"].dt.date

    # Remove rows where last active date is null
    user_df = user_df[user_df["last_active"].notna()]

    cohorts = user_df.groupby("created_date")["user_id"].apply(list).to_dict()

    # Calculate retention for each cohort
    retention_results = []

    for cohort_date, cohort_users in cohorts.items():
        cohort_date = pd.to_datetime(cohort_date)
        cohort_size = len(cohort_users)

        # Skip cohorts that are too recent for Day 30 analysis
        if cohort_date > dau_processed["date"].max() - timedelta(days=30):
            continue

        # Calculate Day 1 retention
        day1_date = cohort_date + timedelta(days=1)
        day1_active_users = []
        if day1_date in date_to_users:
            day1_active_users = [
                user for user in cohort_users if user in date_to_users[day1_date]
            ]
        day1_count = len(day1_active_users)
        day1_retention = (day1_count / cohort_size * 100) if cohort_size > 0 else 0

        # Calculate Day 7 retention
        day7_date = cohort_date + timedelta(days=7)
        day7_active_users = []
        if day7_date in date_to_users:
            day7_active_users = [
                user for user in cohort_users if user in date_to_users[day7_date]
            ]
        day7_count = len(day7_active_users)
        day7_retention = (day7_count / cohort_size * 100) if cohort_size > 0 else 0

        # Calculate Day 14 retention
        day14_date = cohort_date + timedelta(days=14)
        day14_active_users = []
        if day14_date in date_to_users:
            day14_active_users = [
                user for user in cohort_users if user in date_to_users[day14_date]
            ]
        day14_count = len(day14_active_users)
        day14_retention = (day14_count / cohort_size * 100) if cohort_size > 0 else 0

        # Calculate Day 30 retention
        day30_date = cohort_date + timedelta(days=30)
        day30_active_users = []
        if day30_date in date_to_users:
            day30_active_users = [
                user for user in cohort_users if user in date_to_users[day30_date]
            ]
        day30_count = len(day30_active_users)
        day30_retention = (day30_count / cohort_size * 100) if cohort_size > 0 else 0

        retention_results.append(
            {
                "cohort_date": cohort_date,
                "cohort_size": cohort_size,
                "day1_active_users": day1_count,
                "day1_retention": day1_retention,
                "day7_active_users": day7_count,
                "day7_retention": day7_retention,
                "day14_active_users": day14_count,
                "day14_retention": day14_retention,
                "day30_active_users": day30_count,
                "day30_retention": day30_retention,
            }
        )

    # Create a DataFrame from the results
    retention_analysis = pd.DataFrame(retention_results)

    # Sort by cohort date
    retention_analysis = retention_analysis.sort_values("cohort_date", ascending=False)

    # Add week and month columns for grouping
    retention_analysis["cohort_week"] = (
        retention_analysis["cohort_date"].dt.to_period("W").astype(str)
    )
    retention_analysis["cohort_month"] = (
        retention_analysis["cohort_date"].dt.to_period("M").astype(str)
    )

    # Weekly cohort analysis
    weekly_retention = retention_analysis.copy()
    weekly_avg = weekly_retention.groupby("cohort_week").agg(
        {
            "cohort_size": "sum",
            "day1_active_users": "sum",
            "day7_active_users": "sum",
            "day14_active_users": "sum",
            "day30_active_users": "sum",
        }
    )

    weekly_avg["day1_retention"] = (
        weekly_avg["day1_active_users"] / weekly_avg["cohort_size"] * 100
    )
    weekly_avg["day7_retention"] = (
        weekly_avg["day7_active_users"] / weekly_avg["cohort_size"] * 100
    )
    weekly_avg["day14_retention"] = (
        weekly_avg["day14_active_users"] / weekly_avg["cohort_size"] * 100
    )
    weekly_avg["day30_retention"] = (
        weekly_avg["day30_active_users"] / weekly_avg["cohort_size"] * 100
    )

    # Monthly cohort analysis
    monthly_retention = retention_analysis.copy()
    monthly_avg = monthly_retention.groupby("cohort_month").agg(
        {
            "cohort_size": "sum",
            "day1_active_users": "sum",
            "day7_active_users": "sum",
            "day14_active_users": "sum",
            "day30_active_users": "sum",
        }
    )

    monthly_avg["day1_retention"] = (
        monthly_avg["day1_active_users"] / monthly_avg["cohort_size"] * 100
    )
    monthly_avg["day7_retention"] = (
        monthly_avg["day7_active_users"] / monthly_avg["cohort_size"] * 100
    )
    monthly_avg["day14_retention"] = (
        monthly_avg["day14_active_users"] / monthly_avg["cohort_size"] * 100
    )
    monthly_avg["day30_retention"] = (
        monthly_avg["day30_active_users"] / monthly_avg["cohort_size"] * 100
    )

    # Calculate overall retention rates
    overall_cohort_size = int(retention_analysis["cohort_size"].sum())
    overall_day1_users = int(retention_analysis["day1_active_users"].sum())
    overall_day7_users = int(retention_analysis["day7_active_users"].sum())
    overall_day14_users = int(retention_analysis["day14_active_users"].sum())
    overall_day30_users = int(retention_analysis["day30_active_users"].sum())

    overall_day1_retention = float(overall_day1_users / overall_cohort_size * 100)
    overall_day7_retention = float(overall_day7_users / overall_cohort_size * 100)
    overall_day14_retention = float(overall_day14_users / overall_cohort_size * 100)
    overall_day30_retention = float(overall_day30_users / overall_cohort_size * 100)

    # Calculate rolling averages for weekly retention to identify trends
    weekly_avg_sorted = weekly_avg.sort_index()
    weekly_avg_sorted["day1_retention_rolling"] = (
        weekly_avg_sorted["day1_retention"].rolling(window=4).mean()
    )
    weekly_avg_sorted["day7_retention_rolling"] = (
        weekly_avg_sorted["day7_retention"].rolling(window=4).mean()
    )
    weekly_avg_sorted["day14_retention_rolling"] = (
        weekly_avg_sorted["day14_retention"].rolling(window=4).mean()
    )
    weekly_avg_sorted["day30_retention_rolling"] = (
        weekly_avg_sorted["day30_retention"].rolling(window=4).mean()
    )

    # Apply type conversion to all DataFrames before serialization
    weekly_avg_df = convert_numpy_types(weekly_avg.reset_index())
    monthly_avg_df = convert_numpy_types(monthly_avg.reset_index())

    # Explicitly convert any pandas or numpy types in retention_analysis
    retention_analysis = convert_numpy_types(retention_analysis)

    # Create the final return object with native Python types
    return {
        "retention_analysis": retention_analysis.to_dict(orient="records"),
        "weekly_avg": weekly_avg_df.to_dict(orient="records"),
        "monthly_avg": monthly_avg_df.to_dict(orient="records"),
        "overall_retention": {
            "cohort_size": overall_cohort_size,
            "day1_retention": overall_day1_retention,
            "day7_retention": overall_day7_retention,
            "day14_retention": overall_day14_retention,
            "day30_retention": overall_day30_retention,
        },
    }


def get_dau():
    """
    Calculate user retention metrics and return as a Python dictionary
    that can be JSON serialized.
    """
    dau_df = query_cache["dau"]
    return dau_df.to_dict(orient="records")
