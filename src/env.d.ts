/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key. Public by design; without it the contact form falls back to mailto. */
  readonly VITE_WEB3FORMS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
