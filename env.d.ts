/// <reference types="vite/client" />

// Provide a module declaration so TS recognizes imported .vue files.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly version: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
