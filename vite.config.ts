import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.NODE_ENV === "production" ? "/algorithm-visualizer/" : "/",
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["khaclbit.github.io"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
