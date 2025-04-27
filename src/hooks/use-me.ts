import { useQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";
import { ModelInstance } from "@graphand/core";
import { useLogged } from "./use-logged";

/**
 * Hook to fetch and manage the current authenticated user data
 *
 * @returns The current user data and loading state
 */
export function useMe() {
  const _AccountModel = client.model("accounts");
  const logged = useLogged();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<ModelInstance<typeof _AccountModel> | null>({
    queryKey: ["currentUser", logged],
    queryFn: async () => {
      try {
        return await client.me();
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
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

export default useMe;
