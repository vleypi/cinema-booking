import { useEffect, useState } from "react";

const SECOND_MS = 1_000;

const computeRemainingSeconds = (expiresAt: string | null, nowMs: number): number => {
  if (!expiresAt) return 0;

  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - nowMs) / SECOND_MS));
};

const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
};

export const useHoldTimer = (expiresAt: string | null) => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, SECOND_MS);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const remainingSeconds = computeRemainingSeconds(expiresAt, nowMs);

  return {
    remainingSeconds,
    formattedTime: formatCountdown(remainingSeconds),
    isExpired: Boolean(expiresAt) && remainingSeconds === 0,
  };
};
