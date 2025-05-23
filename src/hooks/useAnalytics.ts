import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchData, postData } from "../services/api";
import { queryClient } from "../services/queryClient";

// Types for raw API response
export interface RawRetentionDataItem {
  date: string;
  day1_retention_rate: string;
  day7_retention_rate: string;
  day14_retention_rate: string;
  returning_users_day1: number;
  returning_users_day7: number;
  returning_users_day14: number;
  total_users: number;
}

// New types for cohort retention
export interface CohortRetentionItem {
  cohort_date: string;
  cohort_size: number;
  day1_active_users: number;
  day1_retention: number;
  day7_active_users: number;
  day7_retention: number;
  day14_active_users: number;
  day14_retention: number;
  day30_active_users: number;
  day30_retention: number;
}

export interface WeeklyAvgItem {
  cohort_week: string;
  cohort_size: number;
  day1_active_users: number;
  day1_retention: number;
  day7_active_users: number;
  day7_retention: number;
  day14_active_users: number;
  day14_retention: number;
  day30_active_users: number;
  day30_retention: number;
}

export interface MonthlyAvgItem {
  cohort_month: string;
  cohort_size: number;
  day1_active_users: number;
  day1_retention: number;
  day7_active_users: number;
  day7_retention: number;
  day14_active_users: number;
  day14_retention: number;
  day30_active_users: number;
  day30_retention: number;
}

export interface CohortRetentionResponse {
  retention_analysis: CohortRetentionItem[];
  weekly_avg: WeeklyAvgItem[];
  monthly_avg: MonthlyAvgItem[];
  overall_retention: {
    cohort_size: number;
    day1_retention: number;
    day7_retention: number;
    day14_retention: number;
    day30_retention: number;
  };
}

// Hook to get daily active retention data from the API
export function useDailyActiveRetentionData() {
  return useQuery({
    queryKey: ["retention"],
    queryFn: async () => {
      const data = await fetchData<RawRetentionDataItem[]>(
        "/analytics/retention"
      );
      // Add additional validation to ensure we have an array
      if (!Array.isArray(data)) {
        console.error("API returned non-array data:", data);
        return [];
      }
      return data;
    },
  });
}

// New hook for cohort retention data
export function useCohortRetention() {
  return useQuery({
    queryKey: ["retention_by_cohort"],
    queryFn: async () => {
      const data = await fetchData<CohortRetentionResponse>(
        "/analytics/retention_by_cohort"
      );
      return data;
    },
  });
}

// Hook to refresh all data
export function useRefreshQueries() {
  return useMutation({
    mutationFn: () => postData<{ message: string }>("/analytics/refresh"),
    onSuccess: () => {
      // Invalidate all queries to refetch data
      queryClient.invalidateQueries();
    },
  });
}
