import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeoutSeconds?: number;      // default: 900 (15 minutes)
  warningSeconds?: number;      // default: 60 (warning at 14 minutes)
  onTimeout?: () => void;
}

export function useIdleTimer({
  timeoutSeconds = 900,
  warningSeconds = 60,
  onTimeout,
}: UseIdleTimerOptions = {}) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeoutSeconds);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSecondsRemaining(timeoutSeconds);
    setShowWarning(false);
  }, [timeoutSeconds]);

  const lockImmediately = useCallback(() => {
    setIsLocked(true);
    setShowWarning(false);
    setSecondsRemaining(0);
    if (onTimeoutRef.current) {
      onTimeoutRef.current();
    }
  }, []);

  const unlock = useCallback(() => {
    setIsLocked(false);
    resetTimer();
  }, [resetTimer]);

  // Activity event listener
  useEffect(() => {
    if (isLocked) return;

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    let lastRecorded = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle activity updates to once every 2 seconds
      if (now - lastRecorded > 2000) {
        lastRecorded = now;
        lastActivityRef.current = now;
        if (showWarning) {
          setShowWarning(false);
        }
      }
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [isLocked, showWarning]);

  // Interval check every second
  useEffect(() => {
    if (isLocked) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, timeoutSeconds - elapsedSeconds);
      setSecondsRemaining(remaining);

      // Warning when remaining time is less than warningSeconds
      if (remaining <= warningSeconds && remaining > 0) {
        setShowWarning(true);
      } else if (remaining > warningSeconds) {
        setShowWarning(false);
      }

      // Timeout check (15 minutes of inactivity)
      if (remaining === 0) {
        setIsLocked(true);
        setShowWarning(false);
        if (onTimeoutRef.current) {
          onTimeoutRef.current();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, timeoutSeconds, warningSeconds]);

  return {
    isLocked,
    showWarning,
    secondsRemaining,
    resetTimer,
    lockImmediately,
    unlock,
  };
}
