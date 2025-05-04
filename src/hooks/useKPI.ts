import { useQuery } from "@tanstack/react-query";
import { fetchData } from "../services/api";

// Types for raw API response
export interface RawUser {
  id: string;
  auto_renew_enabled: boolean;
  auto_renew_product_id: string;
  created_at: string;
  credits: number;
  diet_program_version: string | null;
  dietary_preferences: {
    [cuisine: string]: boolean;
  };
  email: string;
  expected_mmr: string;
  expiry_date: string;
  first_name: string;
  last_active: string;
  offer_id: string;
  onboarding_complete: boolean;
  original_transaction_id: string;
  product_id: string;
  promo_code_count: number;
  promo_codes_used: string[];
  purchase_date: string;
  referral_source: string | null;
  status: number;
}

export interface RawUserResponse {
  [key: string]: RawUser;
}

export interface UserMetrics {
  total_users: number;
  users_completed_onboarding: number;
  active_subscribers: number;
  paying_users: RawUser[];
  free_users: RawUser[];
  monthly_subscribers: number;
  yearly_subscribers: number;
  estimated_monthly_revenue: number;
}

export function useRawUserData() {
  return useQuery({
    queryKey: ["users"],
    staleTime: 1000, // 24 hours
    queryFn: async () => {
      const data = await fetchData<RawUserResponse>("/analytics/users");
      return data;
    },
  });
}

// Hook to get formatted retention data for charts
export function useUserMetrics() {
  const { data, isLoading, isError, error } = useRawUserData();

  if (!data || isLoading || isError) {
    return { data: undefined, isLoading, isError, error };
  }

  const users_completed_onboarding = Object.values(data).filter(
    (user) => user.onboarding_complete
  );

  const active_users = Object.values(data).filter((user) => {
    return user.status == 1 && user.auto_renew_enabled;
  });

  // (excluding 14-day-free) and whose promo codes don't look like UUIDs
  const paying_users = active_users.filter((user) => {
    // If user has no promo codes used, they might be a paying user
    const no_promo_codes =
      !user.promo_codes_used || user.promo_codes_used.length === 0;

    const is_using_free_code = user.promo_codes_used.some((code) => {
      //Cannot be using a free code, unless it is the 14-day-free
      const containsFree =
        !code.toLowerCase().includes("free") || code == "14-day-free";

      //Cannot be using a promo code that looks like a UUID
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const looksLikeUuid = uuidPattern.test(code);
      return containsFree || looksLikeUuid;
    });

    if (
      user.status == 1 &&
      user.auto_renew_enabled &&
      (no_promo_codes || !is_using_free_code)
    ) {
      return true;
    }
  });

  // Free users are active users who are not paying
  const free_users = active_users.filter(
    (user) => !paying_users.includes(user)
  );

  const metrics: UserMetrics = {
    total_users: Object.keys(data).length,
    users_completed_onboarding: users_completed_onboarding.length,
    active_subscribers: active_users.length,
    paying_users: paying_users,
    free_users: free_users,
    monthly_subscribers: paying_users.filter((user) =>
      user.product_id.includes("month")
    ).length,
    yearly_subscribers: paying_users.filter(
      (user) => !user.product_id.includes("month")
    ).length,
    estimated_monthly_revenue: paying_users.reduce(
      (acc, user) => acc + parseFloat(user.expected_mmr),
      0
    ),
  };
  console.log("metrics", metrics);
  return { data: metrics, isLoading, isError, error };
}
