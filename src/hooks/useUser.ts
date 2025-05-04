import { useRawUserData } from "./useKPI";
import { useAuth } from ".././store/auth-context";

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
