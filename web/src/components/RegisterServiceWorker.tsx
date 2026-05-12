"use client";

import { useEffect } from "react";

/**
 * Registers the app shell service worker in production, or when
 * NEXT_PUBLIC_ENABLE_SW=1 (used by Playwright offline tests).
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const enable =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_SW === "1";
    if (!enable) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
