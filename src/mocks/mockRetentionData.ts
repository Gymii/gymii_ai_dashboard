import { RawRetentionDataItem } from "../hooks/useAnalytics";

// This is the mock data provided, can be used for development and testing
export const mockRetentionData: RawRetentionDataItem[] = [
  {
    date: "Mon, 23 Sep 2024 00:00:00 GMT",
    day14_retention_rate: "0.00",
    day1_retention_rate: "33.33",
    day7_retention_rate: "33.33",
    returning_users_day1: 1,
    returning_users_day14: 0,
    returning_users_day7: 1,
    total_users: 3,
  },
  {
    date: "Tue, 24 Sep 2024 00:00:00 GMT",
    day14_retention_rate: "0.00",
    day1_retention_rate: "0.00",
    day7_retention_rate: "0.00",
    returning_users_day1: 0,
    returning_users_day14: 0,
    returning_users_day7: 0,
    total_users: 2,
  },
  // ... Add more data as needed or the full dataset
];
