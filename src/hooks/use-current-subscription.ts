import { controllerSubscriptionsCurrent } from "@/lib/controllers";
import client from "@/lib/graphand-client";
import { useQuery } from "@tanstack/react-query";

export interface Subscription {
  plan: string;
  status: string;
  configuration: Record<string, unknown>;
  startDate: string;
  endDate: string;
  periodStartDate: string;
  periodEndDate: string;
  price: number;
  currency: string;
  interval: string;
}

export function useCurrentSubscription(projectId: string) {
  return useQuery({
    queryKey: ["subscription", "current", projectId],
    queryFn: async () => {
      const res = await client.execute(controllerSubscriptionsCurrent, {
        params: {
          id: projectId,
        },
      });

      const { data } = await res.json();

      return data as Subscription;
    },
    enabled: !!projectId,
  });
}
