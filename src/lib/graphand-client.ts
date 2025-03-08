"use client";

import { AuthStorage } from "@graphand/client-module-auth";
import { createClient } from "./graphand";

// Create a client-side storage adapter that works with cookies
const clientStorage: AuthStorage = {
  getItem: async (key: string) => {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${key}=`))
        ?.split("=")[1] || null
    );
  },
  setItem: async (key: string, value: string) => {
    document.cookie = `${key}=${value}; path=/; SameSite=Lax`;
  },
  removeItem: async (key: string) => {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  },
};

// Export the client instance
const client = createClient(clientStorage);
export default client;
