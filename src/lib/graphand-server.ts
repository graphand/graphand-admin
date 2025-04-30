import { AuthStorage } from "@graphand/client-module-auth";
import { cookies } from "next/headers";
import { createClient } from "./graphand";

export const createServerClient = async () => {
  const cookieStore = await cookies();
  const project = cookieStore.get("NEXT_GRAPHAND_PROJECT");
  const base = project?.value || "global";

  const storage: AuthStorage = {
    getItem: async (key: string) => {
      return (
        cookieStore.get(encodeURIComponent(`${base}:${key}`))?.value || null
      );
    },
    setItem: async (key: string, value: string) => {
      cookieStore.set(encodeURIComponent(`${base}:${key}`), value);
    },
    removeItem: async (key: string) => {
      cookieStore.delete(encodeURIComponent(`${base}:${key}`));
    },
  };

  return createClient(storage, project?.value);
};
