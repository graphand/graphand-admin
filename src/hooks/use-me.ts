import { useQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";
import { ModelInstance } from "@graphand/core";
import { useLogged } from "./use-logged";
import { useEffect, useRef, useState } from "react";
import { InferClientModel } from "@graphand/client";

/**
 * Hook to fetch and manage the current authenticated user data
 *
 * @returns The current user data and loading state
 */
export function useMe() {
  const logged = useLogged();
  const subscriptionsRef = useRef<(() => void) | null>(null);
  const [, setUpdateTrigger] = useState(0);

  useEffect(() => {
    return () => {
      subscriptionsRef.current?.();
    };
  }, []);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<ModelInstance<
    InferClientModel<typeof client, "accounts">
  > | null>({
    queryKey: ["currentUser", logged],
    queryFn: async () => {
      const me = await client.me();

      if (me) {
        subscriptionsRef.current = me.subscribe(() => {
          setUpdateTrigger((prev) => prev + 1);
        });
      }

      return me;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user,
    isLoading,
    error,
    refetch,
  };
}
