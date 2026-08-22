/// <reference types="vite/client" />

/**
 * Dayflow HRMS — Vite environment variable type declarations.
 * All VITE_ prefixed variables are automatically exposed to the browser.
 */
interface ImportMetaEnv {
  /** Base URL of the Express backend API (e.g. http://localhost:5000) */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
