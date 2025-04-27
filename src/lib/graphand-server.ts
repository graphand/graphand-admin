import { AuthStorage } from "@graphand/client-module-auth";
import { cookies } from "next/headers";
import { createClient } from "./graphand";

export const createServerClient = async () => {
  const storage: AuthStorage = {
    getItem: async (key: string) => {
      const cookieStore = await cookies();
      return cookieStore.get(key)?.value || null;
    },
    setItem: async (key: string, value: string) => {
      const cookieStore = await cookies();
      cookieStore.set(key, value);
    },
    removeItem: async (key: string) => {
      const cookieStore = await cookies();
      cookieStore.delete(key);
    },
  };

  return createClient(storage);
};
