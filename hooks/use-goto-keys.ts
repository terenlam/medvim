"use client";

import { useEffect, useRef } from "react";

export type GotoTarget = "top" | "bottom";

export function useGotoKeys(active: boolean, onGoto: (target: GotoTarget) => void) {
  const pendingG = useRef(false);
  const onGotoRef = useRef(onGoto);

  useEffect(() => {
    onGotoRef.current = onGoto;
    if (!active) {
      pendingG.current = false;
    }
  });

  function onKeyDown(event: KeyboardEvent): boolean {
    if (event.key === "g" || event.key === "G") {
      event.preventDefault();
      if (event.key === "g") {
        if (pendingG.current) {
          pendingG.current = false;
          onGotoRef.current("top");
        } else {
          pendingG.current = true;
        }
      } else {
        pendingG.current = false;
        onGotoRef.current("bottom");
      }
      return true;
    }
    pendingG.current = false;
    return false;
  }

  return onKeyDown;
}
