import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MotionPreference = 'system' | 'reduced';

interface SettingsState {
  soundOn: boolean;
  motion: MotionPreference;
  highContrast: boolean;
  toggleSound: () => void;
  setMotion: (m: MotionPreference) => void;
  toggleHighContrast: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      soundOn: false,
      motion: 'system',
      highContrast: false,
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setMotion: (motion) => set({ motion }),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
    }),
    { name: 'asterion-settings' },
  ),
);

interface UiState {
  searchOpen: boolean;
  companionOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  setCompanionOpen: (open: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  searchOpen: false,
  companionOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setCompanionOpen: (companionOpen) => set({ companionOpen }),
}));
