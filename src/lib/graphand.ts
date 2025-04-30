import { Client } from "@graphand/client";
import Project from "./models/Project";
import { AuthStorage, ModuleAuth } from "@graphand/client-module-auth";
import { ModuleRealtime } from "@graphand/client-module-realtime";
import Organization from "./models/Organization";
import Terms from "./models/Terms";
import Account from "./models/Account";
import OrganizationInvitation from "./models/OrganizationInvitation";

export const createClient = (
  storage: AuthStorage = LocalStorage,
  project: string | null = null
) => {
  return new Client(
    {
      endpoint: "api.graphand.dev",
      project,
      // disableCache: true,
      // disableStore: true,
    },
    [
      [ModuleAuth, { storage }],
      [
        ModuleRealtime,
        {
          autoConnect: typeof window !== "undefined",
        },
      ],
    ],
    [Project, Organization, Terms, Account, OrganizationInvitation]
  );
};

const LocalStorage: AuthStorage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  removeItem: (key: string) => localStorage.removeItem(key),
};

const client = createClient(LocalStorage);

export default client;
