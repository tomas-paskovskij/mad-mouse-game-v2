import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Priverčia Vite tikrinti failus kas tam tikrą laiką (polling)
      // Tai padeda, jei standartinis OS "stebėtojas" grybauja
      usePolling: true,
    },
    // Užtikrina, kad HMR ryšys būtų stabilus
    hmr: {
      overlay: true, // Rodyti klaidų langą naršyklėje, kad iškart matytum, jei kas negerai
    },
  },
});
