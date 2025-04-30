"use client";

import { AuthStorage } from "@graphand/client-module-auth";
import { createClient } from "./graphand";
import Cookies from "js-cookie";

const project = Cookies.get("NEXT_GRAPHAND_PROJECT");
const base = project || "global";

// Create a client-side storage adapter that works with cookies
const clientStorage: AuthStorage = {
  getItem: async (key: string) => {
    return Cookies.get(encodeURIComponent(`${base}:${key}`)) || null;
  },
  setItem: async (key: string, value: string) => {
    Cookies.set(encodeURIComponent(`${base}:${key}`), value, {
      sameSite: "lax",
    });
  },
  removeItem: async (key: string) => {
    Cookies.remove(encodeURIComponent(`${base}:${key}`));
  },
};

// Export the client instance
const client = createClient(clientStorage, project);

export default client;
