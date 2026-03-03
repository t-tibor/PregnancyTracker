"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query hook using useSyncExternalStore.
 * Returns `false` during SSR, then syncs with the actual media query on the client.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Convenience hook: returns `true` when viewport is <= 768px.
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}
