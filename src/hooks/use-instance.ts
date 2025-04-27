import { useQuery } from "@tanstack/react-query";
import { Filter, Model, ModelInstance } from "@graphand/core";
import { useEffect, useRef, useState } from "react";

/**
 * Hook to fetch and manage the current authenticated user data
 *
 * @returns The current user data and loading state
 */
export function useInstance<T extends typeof Model>(
  model: T,
  filter: Filter,
  opts: {
    skipSubscribe?: boolean;
  } = {}
) {
  const subscriptionsRef = useRef<(() => void) | null>(null);
  const [, setUpdateTrigger] = useState(0);

  useEffect(() => {
    return () => {
      subscriptionsRef.current?.();
    };
  }, []);

  return useQuery<ModelInstance<T> | null>({
    queryKey: [model.slug, JSON.stringify(filter)],
    queryFn: async () => {
      const instance = await model.get(filter);

      if (!opts.skipSubscribe) {
        if (instance) {
          subscriptionsRef.current = instance.subscribe(() => {
            setUpdateTrigger((prev) => prev + 1);
          });
        } else if (subscriptionsRef.current) {
          subscriptionsRef.current();
        }
      }

      return instance;
    },
  });
}
