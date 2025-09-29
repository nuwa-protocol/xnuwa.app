import { useEffect, useState } from 'react';
import { calculateTimeLeft } from '../utils';

export const useTimeLeft = (expirationTime: string) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    calculateTimeLeft(expirationTime),
  );

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const updateExpirationTime = (expirationTime: string) => {
    setTimeLeft(calculateTimeLeft(expirationTime));
  };

  return {
    timeLeft,
    updateExpirationTime,
  };
};
