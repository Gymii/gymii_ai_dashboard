import React from "react";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { PieChart, BarChart } from "../components/Charts";
import AnalyticsRefreshButton from "../components/AnalyticsRefreshButton";
import { useUserMetrics } from "../hooks/useKPI";
import {
  HiUserGroup,
  HiCash,
  HiChartBar,
  HiCreditCard,
  HiUsers,
  HiViewList,
  HiTicket,
  HiCurrencyDollar,
  HiUserAdd,
  HiClipboardCheck,
} from "react-icons/hi";

export default function Dashboard() {
  const { data: userMetrics, isLoading, isError, error } = useUserMetrics();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
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

  if (!userMetrics) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="p-4">No user metrics available</div>
      </div>
    );
  }

  // Derive data for charts from userMetrics
  const userDistributionData = {
    labels: ["Paying users", "Beta/Special users", "Free users"],
    data: [
      userMetrics.paying_users.length,
      userMetrics.free_users.length,
      userMetrics.users_completed_onboarding -
        userMetrics.paying_users.length -
        userMetrics.free_users.length,
    ],
  };

  const conversionFunnelData = {
    labels: [
      "Total Users",
      "Completed Onboarding",
      "Active Subscribers",
      "Paying Subscribers",
    ],
    data: [
      userMetrics.total_users,
      userMetrics.users_completed_onboarding,
      userMetrics.active_subscribers,
      userMetrics.monthly_subscribers + userMetrics.yearly_subscribers,
    ],
  };

  const subscriptionBreakdownData = {
    labels: ["Monthly Subscribers", "Yearly Subscribers"],
    data: [userMetrics.monthly_subscribers, userMetrics.yearly_subscribers],
  };

  const revenueBreakdownData = {
    labels: ["Estimated Monthly Revenue"],
    data: [userMetrics.estimated_monthly_revenue],
  };

  // Calculate conversion rate
  const conversionRate =
    userMetrics.total_users > 0
      ? (
          (userMetrics.paying_users.length /
            (userMetrics.users_completed_onboarding -
              userMetrics.free_users.length)) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6 pb-8 ">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of key metrics and performance indicators
          </p>
        </div>
        <AnalyticsRefreshButton />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={userMetrics.total_users}
          icon={<HiUserGroup className="h-6 w-6 text-primary-600" />}
          changeText="total registered users"
          additionalLabel1="Total Sign Ups"
          additionalValue1={userMetrics.total_users}
          additionalLabel2="Completed Onboarding"
          additionalValue2={userMetrics.users_completed_onboarding}
        />

        <StatCard
          title="Active Subscribers"
          value={userMetrics.active_subscribers}
          icon={<HiCreditCard className="h-6 w-6 text-primary-600" />}
          changeText="active subscribers"
          additionalLabel1="Monthly Subscribers"
          additionalValue1={userMetrics.monthly_subscribers}
          additionalLabel2="Yearly Subscribers"
          additionalValue2={userMetrics.yearly_subscribers}
        />

        <StatCard
          title="Monthly Revenue"
          value={`$${userMetrics.estimated_monthly_revenue.toFixed(2)}`}
          icon={<HiCash className="h-6 w-6 text-primary-600" />}
          changeText="estimated monthly revenue"
          additionalLabel1="Avg Revenue/User"
          additionalValue1={
            userMetrics.active_subscribers > 0
              ? `$${(
                  userMetrics.estimated_monthly_revenue /
                  userMetrics.active_subscribers
                ).toFixed(2)}`
              : "$0.00"
          }
          additionalLabel2="Projected Annual"
          additionalValue2={`$${(
            userMetrics.estimated_monthly_revenue * 12
          ).toFixed(2)}`}
        />

        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<HiChartBar className="h-6 w-6 text-primary-600" />}
          changeText="users to subscribers"
          additionalLabel1="Onboarding Completion"
          additionalValue1={
            userMetrics.total_users > 0
              ? `${(
                  (userMetrics.users_completed_onboarding /
                    userMetrics.total_users) *
                  100
                ).toFixed(1)}%`
              : "0.0%"
          }
          additionalLabel2="Free to Paid Ratio"
          additionalValue2={
            userMetrics.free_users.length > 0
              ? `${(
                  userMetrics.paying_users.length /
                  userMetrics.free_users.length
                ).toFixed(2)}:1`
              : "0:1"
          }
        />
      </div>

      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="User Distribution" subtitle="Breakdown of user types">
          <PieChart
            data={userDistributionData}
            height={300}
            icon={<HiUsers className="h-5 w-5" />}
          />
        </ChartCard>

        <ChartCard
          title="Conversion Funnel"
          subtitle="User journey through conversion stages"
        >
          <BarChart
            data={conversionFunnelData}
            height={300}
            icon={<HiViewList className="h-5 w-5" />}
          />
        </ChartCard>
      </div>

      {/* Charts - Third Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Subscription Breakdown"
          subtitle="Distribution of subscription types"
        >
          <PieChart
            data={subscriptionBreakdownData}
            height={300}
            icon={<HiTicket className="h-5 w-5" />}
          />
        </ChartCard>

        <ChartCard
          title="Revenue Breakdown"
          subtitle="Monthly revenue from subscriptions"
        >
          <PieChart
            data={revenueBreakdownData}
            height={300}
            icon={<HiCurrencyDollar className="h-5 w-5" />}
          />
        </ChartCard>
      </div>
    </div>
  );
}
