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
      document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    scrollToTop();
    const frame = window.requestAnimationFrame(scrollToTop);
    // WhatsApp, Safari and some Android webviews restore the old scroll
    // position shortly after React paints or an image establishes its size.
    const retries = [50, 150, 300].map((delay) =>
      window.setTimeout(scrollToTop, delay),
    );

    return () => {
      window.cancelAnimationFrame(frame);
      retries.forEach((timer) => window.clearTimeout(timer));
    };
  }, [changeKey]);
}
