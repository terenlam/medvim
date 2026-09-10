import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      callback();
    };

    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  };

  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  );
}

