import { useParams, useNavigate } from "react-router-dom";
import UserDetailView from "../components/UserDetailView";
import { useRawUserData } from "../hooks/useKPI";
import { useEffect } from "react";

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: rawUserData, isLoading, isError } = useRawUserData();

  // If no user ID is provided, redirect to the user list
  useEffect(() => {
    if (!userId) {
      navigate("/dashboard/users");
    }
  }, [userId, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError || !rawUserData || !userId) {
    return (
      <div className="bg-red-50 p-4 rounded-md m-4">
        <h3 className="text-lg font-medium text-red-800">
          Error loading user data
        </h3>
        <p className="mt-2 text-sm text-red-700">
          There was an error loading the user data. Please try again later.
        </p>
      </div>
    );
  }

  const user = rawUserData[userId];

  if (!user) {
    return (
      <div>
        <button
          onClick={() => navigate("/dashboard/users")}
          className="inline-flex items-center mb-6 px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ← Back to User List
        </button>
        <div className="bg-yellow-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-yellow-800">
            User not found
          </h3>
          <p className="mt-2 text-sm text-yellow-700">
            The user with ID {userId} could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/dashboard/users")}
        className="inline-flex items-center mb-6 px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        ← Back to User List
      </button>
      <UserDetailView user={user} />
    </div>
  );
}
