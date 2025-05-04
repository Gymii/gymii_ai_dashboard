import { useRefreshQueries } from "../hooks/useAnalytics";
import { useState, useEffect } from "react";
import { HiRefresh } from "react-icons/hi";

export default function AnalyticsRefreshButton() {
  const { mutate: refreshData, isPending } = useRefreshQueries();
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  // Load last refresh time from localStorage on component mount
  useEffect(() => {
    const storedTime = localStorage.getItem("lastAnalyticsRefresh");
    if (storedTime) {
      setLastRefreshed(storedTime);
    }
  }, []);

  const handleRefresh = () => {
    refreshData(undefined, {
      onSuccess: () => {
        const now = new Date().toISOString();
        localStorage.setItem("lastAnalyticsRefresh", now);
        setLastRefreshed(now);
      },
    });
  };

  const formatRefreshTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch (e) {
      return "Unknown";
    }
  };

  return (
    <div className="flex items-center">
      {lastRefreshed && (
        <span className="text-xs text-gray-500 mr-2">
          Last updated: {formatRefreshTime(lastRefreshed)}
        </span>
      )}
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {isPending ? (
          <>
            <HiRefresh className="h-4 w-4 mr-2 animate-spin" />
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <HiRefresh className="h-4 w-4 mr-2" />
            <span>Refresh Analytics</span>
          </>
        )}
      </button>
    </div>
  );
}
