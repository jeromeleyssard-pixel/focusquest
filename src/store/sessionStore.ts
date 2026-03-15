import { create } from 'zustand';
import type { SessionData } from '../types/session';

interface SessionStore {
  currentSession: SessionData | null;
  setCurrentSession: (data: SessionData | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  currentSession: null,
  setCurrentSession: (data) => set({ currentSession: data }),
  clearSession: () => set({ currentSession: null }),
}));
