import { useEffect } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Shared focus-trap hook for modals/menus.
 * - Moves focus into the container on open.
 * - Keeps Tab/Shift+Tab cycling within it.
 * - Returns focus to the element that opened it on close.
 */
export function useFocusTrap(containerRef, active) {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;
    const previouslyFocused = document.activeElement;

    const focusables = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        el => el.offsetParent !== null || getComputedStyle(el).position === 'fixed'
      );

    const firstFocused = focusables()[0];
    if (firstFocused) firstFocused.focus();

    const onKeyDown = e => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || current === container)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef, active]);
}