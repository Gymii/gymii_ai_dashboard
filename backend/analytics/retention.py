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


def get_user_retention():
    """
    Calculate user retention metrics and return as a Python dictionary
    that can be JSON serialized.
    """
    retention_df = query_cache["retention"]
    return retention_df.to_dict(orient="records")


def get_dau():
    """
    Calculate user retention metrics and return as a Python dictionary
    that can be JSON serialized.
    """
    dau_df = query_cache["dau"]
    return dau_df.to_dict(orient="records")
