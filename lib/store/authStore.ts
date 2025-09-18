"use client";
import { create } from "zustand";
import type { User } from "@/types/user";

type State = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (u: User) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<State>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (u) => set({ user: u, isAuthenticated: true }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
