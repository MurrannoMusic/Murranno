import { useState, useEffect, useCallback } from "react";
import { invoke } from "@/lib/api";
export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  is_popular?: boolean;
}
export interface UserSubscription {
  id: string;
  tier: string;
  plan_name: string;
  status: string;
  current_period_end: string | null;
  isActive: boolean;
}
export const useSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, s] = await Promise.all([
        invoke("get-subscription-plans"),
        invoke("get-subscription-status"),
      ]);
      setPlans(
        (p.plans || []).map((v: any) => ({
          ...v,
          price: v.price_monthly ?? v.price ?? 0,
          interval: "month",
          features: Array.isArray(v.features) ? v.features : [],
        })),
      );
      const rows = (s.subscriptions || []).map((v: any) => ({
        ...v,
        plan_name: v.subscription_plans?.name || v.tier,
        isActive: !!v.isActive,
      }));
      setSubscriptions(rows);
      setCurrentSub(
        rows
          .filter((v: UserSubscription) => v.isActive)
          .sort(
            (a: UserSubscription, b: UserSubscription) =>
              ["agency", "label", "artist"].indexOf(a.tier) -
              ["agency", "label", "artist"].indexOf(b.tier),
          )[0] || null,
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  return { plans, currentSub, subscriptions, loading, error, refetch };
};
