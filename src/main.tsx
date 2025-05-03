import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initializeGlobalErrorHandling } from "./lib/error-utils";

// Initialize global error handling
initializeGlobalErrorHandling();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
