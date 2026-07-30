import { useEffect, type RefObject } from 'react';

export function useScrollToAction(
  shouldScroll: boolean,
  targetRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!shouldScroll) return;

    const timer = window.setTimeout(() => {
      targetRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [shouldScroll, targetRef]);
}
