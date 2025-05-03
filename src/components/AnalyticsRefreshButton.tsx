import { useRefreshQueries } from "../hooks/useAnalytics";

export default function AnalyticsRefreshButton() {
  const { mutate: refreshData, isPending } = useRefreshQueries();

  return (
    <button
      onClick={() => refreshData()}
      disabled={isPending}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
    >
      {isPending ? "Refreshing..." : "Refresh Analytics"}
    </button>
  );
}
