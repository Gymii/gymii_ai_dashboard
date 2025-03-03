import { Metric, ChartData } from "./types";

// Sample data based on the provided JSON
export const gymiiStats: Metric[] = [
  {
    metric_category: "Total Users",
    count: 227,
    percentage: 100,
  },
  {
    metric_category: "Sandbox Users (excluded)",
    count: 1,
    percentage: 0.4,
  },
  {
    metric_category: "Free Users (excluded)",
    count: 39,
    percentage: 17.2,
  },
  {
    metric_category: "Analyzed Users (included in analysis)",
    count: 187,
    percentage: 82.4,
  },
  {
    metric_category: "Onboarded Users (completed diet program)",
    count: 146,
    percentage: 78.1,
  },
  {
    metric_category: "Subscribed Users (started trial)",
    count: 49,
    percentage: 33.6,
  },
  {
    metric_category: "Fully Paid Users (did not use code)",
    count: 40,
    percentage: 81.6,
  },
  {
    metric_category: "Renewel Turned On",
    count: 24,
    percentage: 60,
  },
  {
    metric_category: "Partially Paid Users (used discount code)",
    count: 9,
    percentage: 18.4,
  },
  {
    metric_category: "Onboarding completion Rate",
    count: 146,
    percentage: 78.1,
  },
  {
    metric_category: "Register to start free trial rate",
    count: 49,
    percentage: 26.2,
  },
  {
    metric_category: "Free trial to cancel rate",
    count: 16,
    percentage: 32.7,
  },
  {
    metric_category: "Free trial to paid conversion rate",
    count: 2,
    percentage: 4.1,
  },
  {
    metric_category: "Monthly fully paying subscribers",
    count: 20,
    percentage: 60.6,
  },
  {
    metric_category: "Monthly partially paying subscribers",
    count: 6,
    percentage: 18.2,
  },
  {
    metric_category: "Yearly fully paying subscribers",
    count: 4,
    percentage: 12.1,
  },
  {
    metric_category: "Yearly partially paying subscribers",
    count: 3,
    percentage: 9.1,
  },
  {
    metric_category: "Total projected monthly revenue ($)",
    count: 373.07,
    percentage: null,
  },
];

// Get a specific metric by category name
export function getMetricByCategory(category: string): Metric | undefined {
  return gymiiStats.find((metric) => metric.metric_category === category);
}

// Get a metric value by category
export function getMetricValue(category: string): number | null {
  const metric = getMetricByCategory(category);
  return metric ? metric.count : null;
}

// Get user distribution data for pie chart
export function getUserDistributionData(): ChartData {
  return {
    labels: ["Free Users", "Onboarded Users", "Trial Users", "Paid Users"],
    datasets: [
      {
        label: "User Distribution",
        data: [
          getMetricValue("Free Users (excluded)") || 0,
          (getMetricValue("Onboarded Users (completed diet program)") || 0) -
            (getMetricValue("Subscribed Users (started trial)") || 0),
          (getMetricValue("Subscribed Users (started trial)") || 0) -
            (getMetricValue("Fully Paid Users (did not use code)") || 0) -
            (getMetricValue("Partially Paid Users (used discount code)") || 0),
          (getMetricValue("Fully Paid Users (did not use code)") || 0) +
            (getMetricValue("Partially Paid Users (used discount code)") || 0),
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
      },
    ],
  };
}

// Get conversion funnel data
export function getConversionFunnelData(): ChartData {
  return {
    labels: [
      "Total Users",
      "Analyzed Users",
      "Onboarded Users",
      "Trial Users",
      "Paid Users",
    ],
    datasets: [
      {
        label: "Conversion Funnel",
        data: [
          getMetricValue("Total Users") || 0,
          getMetricValue("Analyzed Users (included in analysis)") || 0,
          getMetricValue("Onboarded Users (completed diet program)") || 0,
          getMetricValue("Subscribed Users (started trial)") || 0,
          (getMetricValue("Fully Paid Users (did not use code)") || 0) +
            (getMetricValue("Partially Paid Users (used discount code)") || 0),
        ],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };
}

// Get subscription type breakdown data
export function getSubscriptionBreakdownData(): ChartData {
  return {
    labels: [
      "Monthly Full Price",
      "Monthly Discounted",
      "Yearly Full Price",
      "Yearly Discounted",
    ],
    datasets: [
      {
        label: "Subscription Types",
        data: [
          getMetricValue("Monthly fully paying subscribers") || 0,
          getMetricValue("Monthly partially paying subscribers") || 0,
          getMetricValue("Yearly fully paying subscribers") || 0,
          getMetricValue("Yearly partially paying subscribers") || 0,
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };
}

// Get revenue breakdown data
export function getRevenueBreakdownData(): ChartData {
  // This is mock data for the chart since we don't have the full revenue breakdown
  const monthlyRev = 319.74;
  const yearlyRev = 53.33;

  return {
    labels: ["Monthly Subscriptions", "Yearly Subscriptions"],
    datasets: [
      {
        label: "Monthly Revenue",
        data: [monthlyRev, yearlyRev],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
      },
    ],
  };
}

// Mock data for historical trends
export function getHistoricalRevenueData(): ChartData {
  // Generate mock data for the past 6 months
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const mockRevenue = [280, 310, 340, 350, 360, 373];

  return {
    labels: months,
    datasets: [
      {
        label: "Monthly Revenue ($)",
        data: mockRevenue,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
}

// Mock user growth data
export function getUserGrowthData(): ChartData {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const userGrowth = [120, 150, 180, 200, 215, 227];

  return {
    labels: months,
    datasets: [
      {
        label: "Total Users",
        data: userGrowth,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
}
