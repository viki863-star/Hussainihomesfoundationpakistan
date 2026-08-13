import { useEffect, useRef, useState } from 'react';

const hasIO = typeof IntersectionObserver !== 'undefined';

/**
 * Shared "is this element in view" hook — the single place IntersectionObserver
 * entry logic lives. Handles the browsers that lack IO by reporting visible.
 *
 * @param {object} opts
 * @param {number}   [opts.threshold=0.1]
 * @param {string}   [opts.rootMargin='0px']
 * @param {boolean}  [opts.once=false] keep observing after first reveal
 * @returns {[RefObject, boolean]} ref to attach, true once on-screen
 */
export function useInView({ threshold = 0.1, rootMargin = '0px', once = false } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(!hasIO);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasIO) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) fired.current = true;
        } else if (!once && !fired.current) {
          setInView(false);
        }
      });
    }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * IO-driven class toggle: adds `className` to matching elements the moment they
 * enter the viewport once. Centralizes the ".reveal → .visible" pattern.
 * Returns a disconnect function for effect cleanup.
 */
export function observeInView(selectors, className, options = {}) {
  if (!hasIO) {
    document.querySelectorAll(selectors).forEach(el => el.classList.add(className));
    return { disconnect() {} };
  }
  const { threshold = 0.1, rootMargin = '0px' } = options;
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add(className); }),
    { threshold, rootMargin }
  );
  document.querySelectorAll(selectors).forEach(el => obs.observe(el));
  return obs;
}