"use client";

import { create } from "zustand";
import type { Track } from "@/types/database";

interface PlayerState {
  currentTrack: Track | null;
  isReady: boolean;
  setCurrentTrack: (t: Track | null) => void;
  setReady: (ready: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentTrack: null,
  isReady: false,
  setCurrentTrack: (currentTrack) => set({ currentTrack }),
  setReady: (isReady) => set({ isReady }),
}));
