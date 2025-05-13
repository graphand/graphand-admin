"use client";

import { AuthStorage } from "@graphand/client-module-auth";
import { createClient } from "./graphand";
import Cookies from "js-cookie";

const project = Cookies.get("NEXT_GRAPHAND_PROJECT");
const base = project || "global";

const encodeCookieKey = (key: string) => {
  return `${base}:${key}`.replace(/:/g, "_");
};

// Create a client-side storage adapter that works with cookies
const clientStorage: AuthStorage = {
  getItem: async (key: string) => {
    return Cookies.get(encodeCookieKey(key)) || null;
  },
  setItem: async (key: string, value: string) => {
    Cookies.set(encodeCookieKey(key), value, {
      sameSite: "lax",
    });
  },
  removeItem: async (key: string) => {
    Cookies.remove(encodeCookieKey(key));
  },
};

// Export the client instance
const client = await createClient(clientStorage, project);

export default client;
