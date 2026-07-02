"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/action/auth/auth.model";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"] as const;
const RESET_THROTTLE_MS = 1000;

export function IdleTimeoutWatcher({ timeoutMinutes }: { timeoutMinutes: number }) {
  const router = useRouter();

  React.useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    let idleTimer: ReturnType<typeof setTimeout>;
    let lastReset = 0;

    async function handleIdle() {
      await logoutAction();
      router.push("/?expired=1");
    }

    function resetTimer() {
      const now = Date.now();
      if (now - lastReset < RESET_THROTTLE_MS) return;
      lastReset = now;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(handleIdle, timeoutMs);
    }

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));

    return () => {
      clearTimeout(idleTimer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMinutes, router]);

  return null;
}
