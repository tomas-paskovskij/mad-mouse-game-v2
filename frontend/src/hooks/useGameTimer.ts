import { useState, useEffect, useRef } from "react";

export const useGameTimer = () => {
  const [elapsed, setElapsed] = useState(0);
  const elapsedIv = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    elapsedIv.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedIv.current) clearInterval(elapsedIv.current);
    };
  }, []);

  return { elapsed };
};
