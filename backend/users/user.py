# Add parent directory to Python path
import sys
import os

# Get the current directory and append it to the Python path
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(current_dir)

from db import get_analytic_db

# View path
print(sys.path)

import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from db import execute_query
from data_store import query_cache


def get_users():
    users_df = query_cache["users"]

    # Handle NaT values by replacing them with None
    users_df = users_df.replace({pd.NaT: None})

    # Handle NaN values in numeric columns
    users_df = users_df.replace({np.nan: None})

    # Fix promo_codes_used column: replace None or lists containing None with empty lists
    if "promo_codes_used" in users_df.columns:
        users_df["promo_codes_used"] = users_df["promo_codes_used"].apply(
            lambda x: []
            if x is None or (isinstance(x, list) and (None in x or len(x) == 0))
            else x
        )

    # Use 'index' orient with user_id as index
    users_df = users_df.set_index("user_id")
    users_dict = users_df.to_dict(orient="index")

    # Add user_id as an attribute to each user object
    for user_id, user_data in users_dict.items():
        user_data["id"] = user_id

    return users_dict
