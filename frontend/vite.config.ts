import path from "path";
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
  // 設置別名，指定模組導入路徑，簡化導入路徑的使用
  resolve: {
    alias: {
      "@joytify/shared-types": path.resolve(__dirname, "../share/dist/esm"),
    },
  },
  // 預編譯依賴項，減少 HMR（熱模組替換）時的延遲，提高開發時的響應速度
  optimizeDeps: {
    include: ["@joytify/shared-types"],
  },
});
