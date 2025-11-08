// Polyfill for global object (needed for @creit.tech/stellar-wallets-kit)
if (typeof globalThis === "undefined") {
  (window as unknown as Record<string, unknown>).globalThis = window;
}
if (typeof global === "undefined") {
  (window as unknown as Record<string, unknown>).global = window;
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
