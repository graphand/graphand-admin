import { Client } from "@graphand/client";
import Project from "./models/Project";
import { AuthStorage, ModuleAuth } from "@graphand/client-module-auth";
import Organization from "./models/Organization";
import Terms from "./models/Terms";
import Account from "./models/Account";
import OrganizationInvitation from "./models/OrganizationInvitation";

export const createClient = (storage: AuthStorage) => {
  return new Client(
    {
      endpoint: "api.graphand.dev",
      project: null,
    },
    [
      [
        ModuleAuth,
        {
          storage,
        },
      ],
    ],
    [Project, Organization, Terms, Account, OrganizationInvitation]
  );
};

const BrowserStorage: AuthStorage = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
};

const client = createClient(BrowserStorage);

export default client;
