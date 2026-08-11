import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * The visitor's library card — everything the museum remembers about you,
 * persisted locally. Books you have read keep their gilt spines across
 * visits; the five reading stations stamp the card; the hidden room, once
 * found, stays found.
 */

export const STATIONS = ['tarot', 'astrology', 'alchemy', 'kabbalah'] as const;
export type StationId = (typeof STATIONS)[number];

interface ProgressState {
  /** entity ids of grimoires the visitor has opened */
  read: string[];
  /** stations the visitor has sat at */
  stations: StationId[];
  /** true once any prior visit has happened — used to skip the entry flight */
  returning: boolean;
  markRead: (id: string) => void;
  markStation: (s: StationId) => void;
  markReturning: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      read: [],
      stations: [],
      returning: false,
      markRead: (id) => set((s) => (s.read.includes(id) ? s : { read: [...s.read, id] })),
      markStation: (st) =>
        set((s) => (s.stations.includes(st) ? s : { stations: [...s.stations, st] })),
      markReturning: () => set({ returning: true }),
    }),
    { name: 'asterion-progress' },
  ),
);
