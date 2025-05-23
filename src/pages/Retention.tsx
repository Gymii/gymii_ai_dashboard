import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  useCohortRetention,
  useDailyActiveRetentionData,
  CohortRetentionItem,
  MonthlyAvgItem,
} from "../hooks/useAnalytics";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type CohortViewType = "daily" | "monthly";
type RetentionPeriod = "d1" | "d7" | "d14";

const RETENTION_PERIODS = {
  d1: { days: 1, label: "Day 1 Retention", color: "rgb(75, 192, 192)" },
  d7: { days: 7, label: "Day 7 Retention", color: "rgb(54, 162, 235)" },
  d14: { days: 14, label: "Day 14 Retention", color: "rgb(153, 102, 255)" },
};

export default function Retention() {
  const [cohortView, setCohortView] = useState<CohortViewType>("daily");
  const [retentionPeriod, setRetentionPeriod] = useState<RetentionPeriod>("d1");
  const {
    data: dailyData,
    isLoading: isDailyLoading,
    isError: isDailyError,
  } = useDailyActiveRetentionData();
  const {
    data: cohortData,
    isLoading: isCohortLoading,
    isError: isCohortError,
  } = useCohortRetention();

  if (isDailyLoading || isCohortLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading retention data...</div>
      </div>
    );
  }

  if ((isDailyError && !dailyData) || (isCohortError && !cohortData)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Error loading retention data</div>
      </div>
    );
  }

  // Filter out invalid retention data based on selected period
  const currentDate = new Date();
  const requiredDays = RETENTION_PERIODS[retentionPeriod].days;
  const filteredData = dailyData?.filter((item) => {
    const itemDate = new Date(item.date);
    const daysDiff = Math.floor(
      (currentDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff >= requiredDays;
  });

  const getRetentionRate = (item: any) => {
    switch (retentionPeriod) {
      case "d1":
        return parseFloat(item.day1_retention_rate);
      case "d7":
        return parseFloat(item.day7_retention_rate);
      case "d14":
        return parseFloat(item.day14_retention_rate);
      default:
        return 0;
    }
  };

  const dailyChartData = {
    labels: filteredData?.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        label: RETENTION_PERIODS[retentionPeriod].label,
        data: filteredData?.map((item) => getRetentionRate(item)),
        borderColor: RETENTION_PERIODS[retentionPeriod].color,
        backgroundColor: RETENTION_PERIODS[retentionPeriod].color
          .replace("rgb", "rgba")
          .replace(")", ", 0.5)"),
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: RETENTION_PERIODS[retentionPeriod].label,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Retention Rate (%)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  const getCohortData = () => {
    if (cohortView === "daily") {
      return cohortData?.retention_analysis || [];
    } else {
      return cohortData?.monthly_avg || [];
    }
  };

  const getDateDisplay = (item: CohortRetentionItem | MonthlyAvgItem) => {
    if (cohortView === "daily") {
      const dailyItem = item as CohortRetentionItem;
      return new Date(dailyItem.cohort_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } else {
      const monthlyItem = item as MonthlyAvgItem;
      return monthlyItem.cohort_month;
    }
  };

  const getRowKey = (item: CohortRetentionItem | MonthlyAvgItem) => {
    if (cohortView === "daily") {
      return (item as CohortRetentionItem).cohort_date;
    } else {
      return (item as MonthlyAvgItem).cohort_month;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Daily Active User Retention
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setRetentionPeriod("d1")}
              className={`btn-toggle ${
                retentionPeriod === "d1"
                  ? "btn-toggle-selected"
                  : "btn-toggle-unselected"
              }`}
            >
              Day 1
            </button>
            <button
              onClick={() => setRetentionPeriod("d7")}
              className={`btn-toggle ${
                retentionPeriod === "d7"
                  ? "btn-toggle-selected"
                  : "btn-toggle-unselected"
              }`}
            >
              Day 7
            </button>
            <button
              onClick={() => setRetentionPeriod("d14")}
              className={`btn-toggle ${
                retentionPeriod === "d14"
                  ? "btn-toggle-selected"
                  : "btn-toggle-unselected"
              }`}
            >
              Day 14
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Line options={chartOptions} data={dailyChartData} />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Cohort Retention Analysis
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCohortView("daily")}
              className={`btn-toggle ${
                cohortView === "daily"
                  ? "btn-toggle-selected"
                  : "btn-toggle-unselected"
              }`}
            >
              Daily Cohorts
            </button>
            <button
              onClick={() => setCohortView("monthly")}
              className={`btn-toggle ${
                cohortView === "monthly"
                  ? "btn-toggle-selected"
                  : "btn-toggle-unselected"
              }`}
            >
              Monthly Cohorts
            </button>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {cohortView === "daily" ? "Cohort Date" : "Cohort Month"}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cohort Size
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    D1 Retention
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    D7 Retention
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    D14 Retention
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    D30 Retention
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCohortData().map((item) => (
                  <tr key={getRowKey(item)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDateDisplay(item)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.cohort_size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.day1_retention.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.day7_retention.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.day14_retention.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.day30_retention.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
