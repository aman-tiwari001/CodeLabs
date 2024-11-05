// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VITE_SERVER_URL: string;
  // Add other variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
