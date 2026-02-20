'use client';

import { useState, useRef, useEffect } from 'react';

export interface UseTimerProps {
  initialTime?: number; // in seconds
  duration: number; // in seconds
}

export function useTimer({ initialTime, duration }: UseTimerProps) {
  const [timeLeft, setTime] = useState<number>(initialTime ?? 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTime(duration);
    intervalRef.current = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return [timeLeft, start] as const;
}
