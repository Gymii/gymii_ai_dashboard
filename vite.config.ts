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
            ? "https://staging.gymii.ai:5500"
            : "http://localhost:5500",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      allowedHosts: ["staging.gymii.ai", "localhost", "gymii.ai"],
    },
  };
});
