import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // hmr: {
    //   host: "localhost",
    //   port: 5175,
    //   protocol: "ws",
    // },
    // watch: {
    //   ignored: ["**/node_modules/**", "**/.git/**"],
    // },
  },
});
