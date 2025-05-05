import { useRawUserData } from "./useKPI";
import { useAuth } from ".././store/auth-context";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../services/api";

export function useUserInfo() {
  const { data: userData, isLoading, isError, error } = useRawUserData();
  const { user, isAuthenticated } = useAuth();

  if (!userData || isLoading || isError || !isAuthenticated) {
    return { data: undefined, isLoading, isError, error };
  }

  // Find user's info in data by email
  const userInfo = Object.values(userData).find(
    (userRecord) => userRecord.email === user?.email
  );

  if (!userInfo) {
    return { data: undefined, isLoading, isError, error };
  }

  return {
    data: userInfo,
    isLoading,
    isError,
    error,
  };
}

export interface UserActivity {
  screen: string;
  screen_start_time: string;
  screen_end_time: string;
  duration_seconds: number;
  user_id: number;
  session_id: string;
  session_start_time: string;
  session_end_time: string;
  visit_date: string;
}

export interface UserSession {
  session_id: string;
  session_start_time: string;
  session_end_time: string;
  visit_date: string;
  activities: UserActivity[];
}

export function useUserActivity(userId?: number) {
  // If userId is not provided, use the current user's ID from userInfo
  const targetUserId = userId;
  return useQuery({
    queryKey: ["userActivity", targetUserId],
    enabled: !!targetUserId,
    staleTime: 60000, // 1 minute
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error("User ID is required");
      }
      const data = await fetchData<UserSession[]>(
        `/admin/users/${targetUserId}/sessions`
      );
      return data;
    },
  });
}
