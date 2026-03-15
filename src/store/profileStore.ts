import { create } from 'zustand';
import {
  loadProfiles,
  saveProfile,
  deleteProfile as deleteProfileStorage,
  hashPseudo,
} from '../utils/localStorage';
import type {
  PlayerProfile,
  Avatar,
  AppVersion,
  ModuleId,
  BadgeId,
} from '../types/profile';
import type { SessionSummary } from '../types/session';

const defaultLevels: Record<ModuleId, number> = {
  gonogo: 1,
  oneback: 1,
  dccs: 1,
  cpt: 1,
  nback: 1,
  stopsignal: 1,
  taskswitch: 1,
};

interface ProfileStore {
  profiles: PlayerProfile[];
  activeProfile: PlayerProfile | null;
  loadAll: () => void;
  createProfile: (
    pseudo: string,
    avatar: Avatar,
    color: string,
    version: AppVersion
  ) => PlayerProfile;
  selectProfile: (id: string) => void;
  updateLevel: (moduleId: ModuleId, level: number) => void;
  addSession: (summary: SessionSummary) => void;
  unlockBadge: (badge: BadgeId) => void;
  deleteProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profiles: [],
  activeProfile: null,
  loadAll: () => set({ profiles: loadProfiles() }),
  createProfile: (pseudo, avatar, color, version) => {
    const profile: PlayerProfile = {
      id: hashPseudo(pseudo + Date.now()),
      pseudo,
      avatar,
      colorTheme: color,
      version,
      createdMonth: new Date().toISOString().slice(0, 7),
      currentLevels: { ...defaultLevels },
      badges: [],
      sessions: [],
    };
    saveProfile(profile);
    set((s) => ({ profiles: [...s.profiles, profile], activeProfile: profile }));
    return profile;
  },
  selectProfile: (id) => {
    const p = get().profiles.find((x) => x.id === id) ?? null;
    set({ activeProfile: p });
  },
  updateLevel: (moduleId, level) => {
    const p = get().activeProfile;
    if (!p) return;
    const updated = {
      ...p,
      currentLevels: { ...p.currentLevels, [moduleId]: level },
    };
    saveProfile(updated);
    set({ activeProfile: updated });
  },
  addSession: (summary) => {
    const p = get().activeProfile;
    if (!p) return;
    const sessions = [...p.sessions.slice(-99), summary];
    const updated = { ...p, sessions };
    saveProfile(updated);
    set({ activeProfile: updated });
  },
  unlockBadge: (badge) => {
    const p = get().activeProfile;
    if (!p || p.badges.includes(badge)) return;
    const updated = { ...p, badges: [...p.badges, badge] };
    saveProfile(updated);
    set({ activeProfile: updated });
  },
  deleteProfile: (id) => {
    deleteProfileStorage(id);
    set((s) => ({
      profiles: s.profiles.filter((p) => p.id !== id),
      activeProfile: s.activeProfile?.id === id ? null : s.activeProfile,
    }));
  },
}));
