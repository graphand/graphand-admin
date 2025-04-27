import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmailState {
  email: string | null;
  setEmail: (email: string) => void;
  clearEmail: () => void;
}

export const useEmailStore = create<EmailState>()(
  persist(
    (set) => ({
      email: null,
      setEmail: (email) => set({ email }),
      clearEmail: () => set({ email: null }),
    }),
    {
      name: "email-store",
    }
  )
);
