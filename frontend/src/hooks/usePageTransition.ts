import { useState, useEffect, useRef } from "react";

const EXIT_DURATION = 150;
const ENTER_DURATION = 200;

export function usePageTransition(section: string) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const prevSection = useRef(section);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevSection.current === section) return;

    // Clear any pending timers from previous transition
    if (exitTimer.current) clearTimeout(exitTimer.current);
    if (enterTimer.current) clearTimeout(enterTimer.current);

    prevSection.current = section;

    // Phase 1: Exit
    setIsExiting(true);
    setIsEntering(false);

    exitTimer.current = setTimeout(() => {
      setIsExiting(false);

      // Phase 2: Enter
      setIsEntering(true);

      enterTimer.current = setTimeout(() => {
        setIsEntering(false);
      }, ENTER_DURATION);
    }, EXIT_DURATION);

    return () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
      if (enterTimer.current) clearTimeout(enterTimer.current);
    };
  }, [section]);

  return {
    isEntering,
    isExiting,
    isTransitioning: isEntering || isExiting,
  };
}
