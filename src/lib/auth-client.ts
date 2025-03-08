import client from "./graphand-client";
import { redirect } from "next/navigation";

// Check if user is authenticated (client version)
export async function isAuthenticatedClient() {
  try {
    const user = await client.me();
    return !!user;
  } catch (error) {
    return false;
  }
}

// Get the current user (client version)
export async function getCurrentUserClient() {
  try {
    return await client.me();
  } catch (error) {
    return null;
  }
}

// Redirect if not authenticated (client version)
export async function requireAuthClient() {
  const authenticated = await isAuthenticatedClient();
  if (!authenticated) {
    window.location.href = "/auth/login";
    return false;
  }
  return true;
}

// Redirect if already authenticated (client version)
export async function requireGuestClient() {
  const authenticated = await isAuthenticatedClient();
  if (authenticated) {
    window.location.href = "/";
    return false;
  }
  return true;
}
