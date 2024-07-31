/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALPHA_VANTAGE_API_KEY: string
  readonly VITE_POLYGON_API_KEY: string
}
  
interface ImportMeta {
  readonly env: ImportMetaEnv
}