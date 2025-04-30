import { AuthStorage } from "@graphand/client-module-auth";
import { cookies } from "next/headers";
import { createClient } from "./graphand";

export const createServerClient = async () => {
  const cookieStore = await cookies();
  const project = cookieStore.get("NEXT_GRAPHAND_PROJECT");
  const base = project?.value || "global";

  const encodeCookieKey = (key: string) => {
    return `${base}:${key}`.replace(/:/g, "_");
  };

  const storage: AuthStorage = {
    getItem: async (key: string) => {
      return cookieStore.get(encodeCookieKey(key))?.value || null;
    },
    setItem: async (key: string, value: string) => {
      cookieStore.set(encodeCookieKey(key), value);
    },
    removeItem: async (key: string) => {
      cookieStore.delete(encodeCookieKey(key));
    },
  };

  return createClient(storage, project?.value);
};
