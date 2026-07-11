"use client";

import * as React from "react";
import { toast } from "sonner";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"] as const;
const RESET_THROTTLE_MS = 1000;

export function IdleTimeoutWatcher({ timeoutMinutes }: { timeoutMinutes: number }) {
  React.useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    let idleTimer: ReturnType<typeof setTimeout>;
    let lastReset = 0;

    async function handleIdle() {
      try {
        toast.info("You are being logged out due to inactivity.");

        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Unable to clear the session.");
        }

        toast.success("You have been logged out due to inactivity.");
        window.location.assign("/");
      } catch (error) {
        console.error("Idle timeout logout failed:", error);
        toast.error("Unable to log you out due to inactivity.");
      }
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
  }, [timeoutMinutes]);

  return null;
}
