import { redirect } from "next/navigation";
import { getMe } from "@/lib/get-me";

/**
 * Server-side function to get the current user
 * Similar to the client-side useMe hook but for server components
 */
export async function getCurrentUser() {
  return await getMe();
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// Redirect if not authenticated
export async function requireAuth() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/auth/login");
  }
}

// Redirect if already authenticated
export async function requireGuest() {
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/");
  }
}
