import { useState } from "react";
import { useUserActivity, UserSession } from "../hooks/useUser";
import Pagination from "./Pagination";
import { format } from "date-fns";

interface UserActivitySessionsProps {
  userId: number;
}

export default function UserActivitySessions({
  userId,
}: UserActivitySessionsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of sessions per page

  const { data: sessions, isLoading, isError, error } = useUserActivity(userId);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {/* Skeleton for session header */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>

        {/* Skeleton for sessions */}
        {[...Array(3)].map((_, index) => (
          <div key={index} className="mb-8">
            {/* Session header skeleton */}
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5 mb-6"></div>

            {/* Table skeleton */}
            <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
              {/* Table header skeleton */}
              <div className="bg-gray-100 h-10 flex">
                <div className="w-1/4 px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-1/4 px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-1/4 px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-1/4 px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>

              {/* Table rows skeleton */}
              {[...Array(4)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex border-t border-gray-200">
                  <div className="w-1/4 px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-1/4 px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-1/4 px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-1/4 px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Skeleton for pagination */}
        <div className="flex justify-between items-center mt-4 border-t border-gray-200 pt-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">
        Error loading sessions:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-4">
        No activity sessions found for this user.
      </div>
    );
  }

  // Calculate pagination
  const totalItems = sessions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSessions = sessions.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          User Activity Sessions
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Showing user's app activity grouped by session
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {currentSessions.map((session) => (
          <div key={session.session_id} className="px-4 py-5 sm:px-6">
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-900">
                Session on{" "}
                {format(new Date(session.session_start_time), "MMM d, yyyy")}
              </h4>
              <div className="mt-1 text-sm text-gray-500">
                <p>
                  Start:{" "}
                  {format(new Date(session.session_start_time), "h:mm a")} -
                  End: {format(new Date(session.session_end_time), "h:mm a")}
                </p>
                <p>Session ID: {session.session_id}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Screen
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Start Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      End Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {session.activities.map((activity, idx) => (
                    <tr key={`${activity.session_id}-${idx}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {activity.screen}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(
                          new Date(activity.screen_start_time),
                          "h:mm:ss a"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(
                          new Date(activity.screen_end_time),
                          "h:mm:ss a"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(activity.duration_seconds)} seconds
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
