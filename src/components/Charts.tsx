import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { ChartData } from "../lib/types";
import React from "react";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Color palettes for different chart types
const PIE_COLORS = [
  "rgba(54, 162, 235, 0.6)", // Blue
  "rgba(75, 192, 192, 0.6)", // Teal
  "rgba(255, 206, 86, 0.6)", // Yellow
  "rgba(153, 102, 255, 0.6)", // Purple
  "rgba(255, 99, 132, 0.6)", // Pink
  "rgba(255, 159, 64, 0.6)", // Orange
];

const BAR_COLORS = {
  backgroundColor: "rgba(54, 162, 235, 0.6)",
  borderColor: "rgba(54, 162, 235, 1)",
};

const LINE_COLORS = {
  backgroundColor: "rgba(75, 192, 192, 0.2)",
  borderColor: "rgba(75, 192, 192, 1)",
};

interface SimpleChartData {
  labels: string[];
  data: number[];
}

interface ChartComponentProps {
  data: SimpleChartData;
  height?: number;
  icon?: React.ReactNode;
}

export function PieChart({ data, height = 200, icon }: ChartComponentProps) {
  const chartData: ChartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.labels.join(" vs "),
        data: data.data,
        backgroundColor: PIE_COLORS.slice(0, data.data.length),
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: `${height}px` }} className="relative">
      {icon && (
        <div className="absolute top-0 right-0 m-2 text-gray-400">{icon}</div>
      )}
      <Pie data={chartData} options={options} />
    </div>
  );
}

export function BarChart({ data, height = 250, icon }: ChartComponentProps) {
  const chartData: ChartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.labels.join(" to "),
        data: data.data,
        backgroundColor: BAR_COLORS.backgroundColor,
        borderColor: BAR_COLORS.borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: `${height}px` }} className="relative">
      {icon && (
        <div className="absolute top-0 right-0 m-2 text-gray-400">{icon}</div>
      )}
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function LineChart({ data, height = 250, icon }: ChartComponentProps) {
  const chartData: ChartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.labels.join(" over "),
        data: data.data,
        backgroundColor: LINE_COLORS.backgroundColor,
        borderColor: LINE_COLORS.borderColor,
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: `${height}px` }} className="relative">
      {icon && (
        <div className="absolute top-0 right-0 m-2 text-gray-400">{icon}</div>
      )}
      <Line data={chartData} options={options} />
    </div>
  );
}
