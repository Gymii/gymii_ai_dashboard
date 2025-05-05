import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    base: "/dashboard",
    server: {
      proxy: {
        "/api": {
          target: isProduction
            ? "https://staging.gymii.ai/dashboard/api"
            : "https://localhost:5500/api",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      allowedHosts: ["staging.gymii.ai", "localhost", "gymii.ai"],
    },
  };
});
