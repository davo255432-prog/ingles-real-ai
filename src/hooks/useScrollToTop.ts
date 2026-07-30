import { useLayoutEffect } from 'react';

/**
 * Starts every new app screen or lesson step at the top.
 * The second frame also covers mobile browsers that restore the previous
 * position while React is finishing the new layout.
 */
export function useScrollToTop(changeKey: unknown): void {
  useLayoutEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const frame = window.requestAnimationFrame(scrollToTop);

    return () => window.cancelAnimationFrame(frame);
  }, [changeKey]);
}
