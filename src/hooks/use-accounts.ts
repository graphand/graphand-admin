import { useQuery } from "@tanstack/react-query";
import client from "@/lib/graphand-client";

export type Account = {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  _createdAt?: string;
  _updatedAt?: string;
  // Add other fields as needed
};

export function useAccounts(accountIds?: string[] | null) {
  return useQuery({
    queryKey: ["accounts", accountIds],
    queryFn: async () => {
      if (!accountIds || accountIds.length === 0) {
        return [];
      }

      try {
        const accounts = await client.model("accounts").getList({
          filter: {
            _id: { $in: accountIds },
          },
          pageSize: accountIds.length, // Make sure we get all the accounts
        });

        return accounts || [];
      } catch (error) {
        console.error("Error fetching accounts:", error);
        throw error;
      }
    },
    enabled: !!accountIds && accountIds.length > 0, // Only run if we have account IDs
  });
}
