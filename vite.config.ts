import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from /timeline-tracker/; local dev stays at the root.
  base: command === "build" ? "/timeline-tracker/" : "/",
}));
