import { createServerClient } from "./graphand-server";
import { redirect } from "next/navigation";

// Check if user is authenticated
export async function isAuthenticated() {
  try {
    const client = await createServerClient();
    await client.init();
    const user = await client.me();
    return !!user;
  } catch (error) {
    return false;
  }
}

// Get the current user
export async function getCurrentUser() {
  try {
    const client = await createServerClient();
    return await client.me();
  } catch (error) {
    return null;
  }
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
