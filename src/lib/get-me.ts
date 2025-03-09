import { createServerClient } from "@/lib/graphand-server";
import { cache } from "react";

/**
 * Server-side function to get the current authenticated user
 * This is the server-side equivalent of the useMe hook
 *
 * @returns The current user data or null if not authenticated
 */
export const getMe = cache(async () => {
  try {
    const client = await createServerClient();
    return await client.me();
  } catch (error) {
    console.error("Error fetching user data on server:", error);
    return null;
  }
});

export default getMe;
