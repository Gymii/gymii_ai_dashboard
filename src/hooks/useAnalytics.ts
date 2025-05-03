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

export interface RetentionData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

// Hook to get raw retention data from the API
export function useRawRetentionData() {
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

// Hook to get formatted retention data for charts
export function useUserRetention() {
  const { data, isLoading, isError, error } = useRawRetentionData();

  if (!data || isLoading || isError) {
    return { data: undefined, isLoading, isError, error };
  }

  // Format data for Chart.js
  const formattedData: RetentionData = {
    // Format dates for x-axis labels (e.g., "Sep 23" instead of full date)
    labels: data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        label: "Day 1 Retention",
        data: data.map((item) => parseFloat(item.day1_retention_rate)),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Day 7 Retention",
        data: data.map((item) => parseFloat(item.day7_retention_rate)),
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: "Day 14 Retention",
        data: data.map((item) => parseFloat(item.day14_retention_rate)),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
      },
    ],
  };

  return { data: formattedData, isLoading, isError, error };
}

// Hook to get retention trends for the last 14 days, grouped by month
export function useRetentionTrends() {
  const { data, isLoading, isError, error } = useRawRetentionData();

  if (isLoading) {
    return { data: undefined, isLoading: true, isError: false, error: null };
  }

  if (isError || !data) {
    return {
      data: { labels: [], datasets: [] },
      isLoading: false,
      isError: isError || !data,
      error: error || new Error("No data available"),
    };
  }

  try {
    // Filter data from the last 14 days
    const currentDate = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(currentDate.getDate() - 14);

    const filteredData = data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate <= twoWeeksAgo;
    });

    // If no data after filtering, return empty chart data
    if (filteredData.length === 0) {
      return {
        data: { labels: [], datasets: [] },
        isLoading: false,
        isError: false,
        error: null,
      };
    }

    // Group by month and calculate average retention rates
    const monthlyData: Record<
      string,
      {
        day1Total: number;
        day7Total: number;
        day14Total: number;
        count: number;
      }
    > = {};

    filteredData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          day1Total: 0,
          day7Total: 0,
          day14Total: 0,
          count: 0,
        };
      }

      monthlyData[monthKey].day1Total += parseFloat(item.day1_retention_rate);
      monthlyData[monthKey].day7Total += parseFloat(item.day7_retention_rate);
      monthlyData[monthKey].day14Total += parseFloat(item.day14_retention_rate);
      monthlyData[monthKey].count += 1;
    });

    // Calculate averages and format for Chart.js
    const months = Object.keys(monthlyData);
    const formattedTrendData: RetentionData = {
      labels: months,
      datasets: [
        {
          label: "Day 1 Retention",
          data: months.map(
            (month) => monthlyData[month].day1Total / monthlyData[month].count
          ),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
        {
          label: "Day 7 Retention",
          data: months.map(
            (month) => monthlyData[month].day7Total / monthlyData[month].count
          ),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
        {
          label: "Day 14 Retention",
          data: months.map(
            (month) => monthlyData[month].day14Total / monthlyData[month].count
          ),
          borderColor: "rgb(153, 102, 255)",
          backgroundColor: "rgba(153, 102, 255, 0.5)",
        },
      ],
    };

    return { data: formattedTrendData, isLoading, isError, error };
  } catch (e) {
    return {
      data: { labels: [], datasets: [] },
      isLoading: false,
      isError: true,
      error: e instanceof Error ? e : new Error("An error occurred"),
    };
  }
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
