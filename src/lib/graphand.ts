import { Client } from "@graphand/client";
import Project from "./models/Project";
import { AuthStorage, ModuleAuth } from "@graphand/client-module-auth";
import Organization from "./models/Organization";
import Terms from "./models/Terms";
import Account from "./models/Account";
import OrganizationInvitation from "./models/OrganizationInvitation";

export const createClient = async (
  storage: AuthStorage = LocalStorage,
  project: string | null = null
) => {
  const client = new Client(
    {
      endpoint: "api.graphand.com",
      project,
      // disableCache: true,
      // disableStore: true,
    },
    [[ModuleAuth, { storage }]],
    [Project, Organization, Terms, Account, OrganizationInvitation]
  );

  if (typeof window !== "undefined") {
    const { ModuleRealtime } = await import("@graphand/client-module-realtime");
    client.useModule(ModuleRealtime);
  }

  return client;
};

const LocalStorage: AuthStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};
