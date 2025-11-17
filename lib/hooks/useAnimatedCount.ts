'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for animating number counts
 * @param endValue - The target value to animate to
 * @param duration - Animation duration in milliseconds (default: 500ms)
 * @returns The current animated count value
 */
export const useAnimatedCount = (endValue: number, duration: number = 500): number => {
  const [count, setCount] = useState(endValue);
  const prevValueRef = useRef(endValue);

  useEffect(() => {
    const startValue = prevValueRef.current;
    let startTime: number | null = null;

    const animationFrame = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentVal = Math.floor(progress * (endValue - startValue) + startValue);
      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animationFrame);
      }
    };

    requestAnimationFrame(animationFrame);

    return () => {
      prevValueRef.current = endValue;
    };
  }, [endValue, duration]);

  return count;
};
