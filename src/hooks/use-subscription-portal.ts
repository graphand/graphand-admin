import { controllerSubscriptionsPortal } from "@/lib/controllers";
import client from "@/lib/graphand-client";
import { useMutation } from "@tanstack/react-query";

export function useSubscriptionPortal(projectId: string) {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!projectId) return null;

      const res = await client.execute(controllerSubscriptionsPortal, {
        params: {
          id: projectId,
        },
      });

      const { data } = await res.json();
      return data.url as string;
    },
    onSuccess: (url) => {
      if (url) {
        window.open(url, "_blank");
      }
    },
  });

  return {
    openBillingPortal: mutateAsync,
    isLoading: isPending,
    error,
  };
}
