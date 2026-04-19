import { useState, useEffect } from 'react';

/**
 * Ensures loading state stays true for at least `minDelay` ms,
 * so the BrandLoader doesn't flash by too quickly.
 */
export function useMinLoader(isLoading: boolean, minDelay = 1200): boolean {
  const [minWait, setMinWait] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setMinWait(false), minDelay);
    return () => clearTimeout(timer);
  }, [minDelay]);
  return isLoading || minWait;
}
