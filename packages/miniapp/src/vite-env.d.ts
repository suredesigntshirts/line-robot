/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The LIFF ID (public) from the MINI App channel's Web app settings. */
  readonly VITE_LIFF_ID?: string;
  /** The packages/api Lambda Function URL (public). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
