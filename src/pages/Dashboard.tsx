import React from "react";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { PieChart, BarChart, LineChart } from "../components/Charts";
import {
  getMetricValue,
  getUserDistributionData,
  getConversionFunnelData,
  getSubscriptionBreakdownData,
  getHistoricalRevenueData,
  getUserGrowthData,
  getRevenueBreakdownData,
} from "../lib/data-utils";

export default function Dashboard() {
  // Get key metrics
  const totalUsers = getMetricValue("Total Users");
  const paidUsers =
    (getMetricValue("Fully Paid Users (did not use code)") || 0) +
    (getMetricValue("Partially Paid Users (used discount code)") || 0);
  const monthlyRevenue = getMetricValue("Total projected monthly revenue ($)");
  const conversionRate = getMetricValue("Register to start free trial rate");

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of key metrics and performance indicators
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers || 0}
          icon={
            <svg
              className="h-6 w-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          changeText="since last month"
          change={5.6}
        />

        <StatCard
          title="Paying Customers"
          value={paidUsers}
          icon={
            <svg
              className="h-6 w-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          changeText="since last month"
          change={12.3}
        />

        <StatCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue?.toFixed(2) || "0.00"}`}
          icon={
            <svg
              className="h-6 w-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          changeText="since last month"
          change={3.2}
        />

        <StatCard
          title="Conversion Rate"
          value={`${conversionRate || 0}%`}
          icon={
            <svg
              className="h-6 w-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          changeText="since last month"
          change={-2.1}
        />
      </div>

      {/* Charts - First Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="User Growth"
          subtitle="Total users over the last 6 months"
        >
          <LineChart data={getUserGrowthData()} height={300} />
        </ChartCard>

        <ChartCard
          title="Monthly Revenue"
          subtitle="Revenue trend over the last 6 months"
        >
          <LineChart data={getHistoricalRevenueData()} height={300} />
        </ChartCard>
      </div>

      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="User Distribution" subtitle="Breakdown of user types">
          <PieChart data={getUserDistributionData()} height={300} />
        </ChartCard>

        <ChartCard
          title="Conversion Funnel"
          subtitle="User journey through conversion stages"
        >
          <BarChart data={getConversionFunnelData()} height={300} />
        </ChartCard>
      </div>

      {/* Charts - Third Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Subscription Breakdown"
          subtitle="Distribution of subscription types"
        >
          <PieChart data={getSubscriptionBreakdownData()} height={300} />
        </ChartCard>

        <ChartCard
          title="Revenue Breakdown"
          subtitle="Revenue sources by subscription type"
        >
          <PieChart data={getRevenueBreakdownData()} height={300} />
        </ChartCard>
      </div>
    </div>
  );
}
