/// <reference types="vite/client" />

declare module 'virtual:pwa-register/react' {
  import type { RegisterSWOptions } from 'vite-plugin-pwa';
  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, (v: boolean) => void];
    offlineReady: [boolean, (v: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
