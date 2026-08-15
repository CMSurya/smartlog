import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setHydrated: () => void;
  updateUser: (patch: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHydrated: () => set({ hydrated: true }),
      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
    }),
    {
      name: "smartlog-auth",
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export const selectIsAuthenticated = (s: AuthState) => Boolean(s.token);
