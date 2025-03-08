import { AuthStorage } from "@graphand/client-module-auth";
import { cookies } from "next/headers";
import { createClient } from "./graphand";

export const createServerClient = async () => {
  const storage: AuthStorage = {
    getItem: async (key: string) => (await cookies()).get(key)?.value || null,
    setItem: async (key: string, value: string) => {
      (await cookies()).set(key, value);
    },
    removeItem: async (key: string) => {
      (await cookies()).delete(key);
    },
  };

  return createClient(storage);
};
