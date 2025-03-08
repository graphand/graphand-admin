import { create } from "zustand";
import { persist } from "zustand/middleware";
import Organization from "@/lib/models/Organization";
import { ModelInstance } from "@graphand/core";

interface OrganizationState {
  selectedOrganization: ModelInstance<typeof Organization> | null;
  setSelectedOrganization: (
    organization: ModelInstance<typeof Organization> | null
  ) => void;
  clearSelectedOrganization: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      selectedOrganization: null,
      setSelectedOrganization: (organization) =>
        set({ selectedOrganization: organization }),
      clearSelectedOrganization: () => set({ selectedOrganization: null }),
    }),
    {
      name: "graphand-organization-storage",
    }
  )
);
