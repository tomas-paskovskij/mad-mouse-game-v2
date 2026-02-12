import { create } from "zustand";
import { persist } from "zustand/middleware"; // Pridedam šitą

interface AuthState {
  username: string;
  setUsername: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      username: "",
      setUsername: (name) => set({ username: name }),
    }),
    {
      name: "auth-storage", // Pavadinimas naršyklės atmintyje (localStorage)
    },
  ),
);
