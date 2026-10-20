import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const GITHUB_PAGES_BASE = "/timeline-tracker/";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? GITHUB_PAGES_BASE : "/",
}));
