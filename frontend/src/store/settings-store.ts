import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  displayName: string;
  avatarUrl: string | null;
  emailNotifications: boolean;
  studyReminders: boolean;
  weeklyDigest: boolean;
}

interface SettingsState {
  profile: UserProfile;
  setProfile: (patch: Partial<UserProfile>) => void;
  setAvatar: (url: string | null) => void;
}

const defaultProfile: UserProfile = {
  displayName: "",
  avatarUrl: null,
  emailNotifications: true,
  studyReminders: true,
  weeklyDigest: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
      setAvatar: (avatarUrl) =>
        set((s) => ({ profile: { ...s.profile, avatarUrl } })),
    }),
    { name: "smartlog-settings" },
  ),
);
