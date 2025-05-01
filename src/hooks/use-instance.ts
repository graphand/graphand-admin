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
  filter: Filter | null | undefined,
  opts: {
    skipSubscribe?: boolean;
  } = {}
) {
  const subscriptionsRef = useRef<(() => void) | null>(null);
  const [, setUpdateTrigger] = useState(0);
  const updatedAtRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      subscriptionsRef.current?.();
    };
  }, []);

  return useQuery<ModelInstance<T> | null>({
    queryKey: [model.slug, JSON.stringify(filter)],
    enabled: !!filter,
    queryFn: async () => {
      if (!filter) return null;

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
    structuralSharing: (oldData, newData) => {
      const oldUpdatedAt = updatedAtRef.current;
      const newUpdatedAt = (newData as ModelInstance)?._updatedAt;

      const hasChanged = oldUpdatedAt !== newUpdatedAt?.toString();

      if (hasChanged) {
        updatedAtRef.current = newUpdatedAt?.toString() || null;
        // Force refresh if the ref is the same (data have changed)
        if (oldData === newData) {
          setUpdateTrigger((prev) => prev + 1);
        }
        return newData;
      }

      return oldData;
    },
  });
}
