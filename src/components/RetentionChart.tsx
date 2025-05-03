import { useRetentionTrends } from "../hooks/useAnalytics";
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
  Scale,
  ScaleOptionsByType,
  CartesianScaleTypeRegistry,
  ChartOptions,
  TooltipItem,
} from "chart.js";

// Register required chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function RetentionChart() {
  const { data, isLoading, isError, error } = useRetentionTrends();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 bg-white rounded-lg shadow h-96">
        <div className="text-gray-500">Loading retention data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-red-500 p-4">
          Error loading data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  if (!data || data.labels.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="p-4">No retention data available</div>
      </div>
    );
  }

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "User Retention Rates (%)",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return `Date: ${data.labels[tooltipItems[0].dataIndex]}`;
          },
          label: (context) => {
            const value =
              typeof context.raw === "number" ? context.raw.toFixed(2) : "0.00";
            return `${context.dataset.label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Retention Rate (%)",
        },
        ticks: {
          callback: function (value) {
            return `${value}%`;
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">User Retention Analysis</h2>
      <div className="h-96">
        <Line data={data} options={chartOptions} />
      </div>
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <p>
          <strong>Cohort Analysis:</strong> Tracking the percentage of users who
          return to the app after their first visit.
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>
            <span className="font-medium text-teal-600">Day 1 Retention</span>:
            Users who return 1 day after first visit
          </li>
          <li>
            <span className="font-medium text-blue-600">Day 7 Retention</span>:
            Users who return 7 days after first visit
          </li>
          <li>
            <span className="font-medium text-purple-600">
              Day 14 Retention
            </span>
            : Users who return 14 days after first visit
          </li>
        </ul>
      </div>
    </div>
  );
}
