import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRole } from '@masteruchile/shared';

export interface SessionUser {
  id: string;
  nombre: string;
  rol: UserRole;
  pinTemporal: boolean;
}

interface AuthState {
  token: string | null;
  user: SessionUser | null;
  hydrated: boolean;
  setSession: (token: string, user: SessionUser) => void;
  clearPinTemporal: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setSession: (token, user) => set({ token, user }),
      clearPinTemporal: () => set((s) => (s.user ? { user: { ...s.user, pinTemporal: false } } : s)),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'masteruchile-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
