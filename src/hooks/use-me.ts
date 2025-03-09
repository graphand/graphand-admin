import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";
import { ModelInstance } from "@graphand/core";

/**
 * Hook to fetch and manage the current authenticated user data
 *
 * @returns The current user data and loading state
 */
export function useMe() {
  const accountModel = client.model("accounts");

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<ModelInstance<typeof accountModel> | null>({
    queryKey: ["currentUser"],
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
