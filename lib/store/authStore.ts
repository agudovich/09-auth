// lib/store/authStore.ts
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user";

type AuthState = {
  hydrated: boolean; // знаем текущее состояние (гость/юзер)
  isAuthenticated: boolean;
  user: User | null;

  // экшены
  setUser: (u: User) => void; // выставляет юзера и авторизацию
  clearAuth: () => void; // сбрасывает до гостя
  setHydrated: () => void; // помечаем, что инициализация завершена
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hydrated: false,
      isAuthenticated: false,
      user: null,

      setUser: (u) =>
        set({
          user: u,
          isAuthenticated: true,
          hydrated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          isAuthenticated: false,
          hydrated: true,
        }),

      setHydrated: () => set({ hydrated: true }),
    }),
    { name: "auth" }
  )
);
