import { useEffect, useState } from 'react';

const calculateTimeLeft = (estimatedExpirationDate: string) => {
  const expirationTime = new Date(estimatedExpirationDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((expirationTime - now) / 1000));
};

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

  return {
    timeLeft,
  };
};
