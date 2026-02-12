import { create } from "zustand";

interface AuthState {
  username: string;
  setUsername: (name: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  username: "", // Pradžioje tuščia
  setUsername: (name) => set({ username: name }),
}));
