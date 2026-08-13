import { useState, useEffect, useRef } from 'react';
import { useLang } from '../LangContext';
import { useSiteImages } from '../siteImages';
import { withBase } from '../paths';

/*
  SCROLL-CONTROLLED CINEMATIC HERO
  ---------------------------------
  The hero is a tall scroll track (see `.cine-hero-track` in App.css). A
  full-screen panel sticks to the viewport while the page scrolls normally.
  The panel's scroll progress inside the track maps 0→1 directly onto the
  video timeline (video.currentTime), so the user's scroll IS the playback
  timeline:

    0%  = first frame (paused)
    100% = final frame — the journey ends and normal sections scroll in.

  No autoplay, no loop, no controls. Updates are applied straight to the
  video element inside a requestAnimationFrame loop — React state is only
  touched on rare thresholds (journey-complete), never per pixel.
*/
const HERO_VIDEO = withBase('/images/hero-cinematic.mp4');

/* Scrub tuning */
const SCRUB_FACTOR = 0.14;   // smoothing: lower = heavier, higher = snappier
const SCRUB_EPS = 0.01;      // seconds — smallest currentTime change we write
const FINAL_PROGRESS = 0.97; // progress that counts as "journey complete"

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function Hero() {
  const { t } = useLang();
  const imgs = useSiteImages();
  const h = t.hero;

  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [ended, setEnded] = useState(false);

  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const railRef = useRef(null);
  const endedRef = useRef(false);

  /* Live `prefers-reduced-motion` → static poster + normal scrolling */
  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    onChange();
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (typeof mq.addListener === 'function') mq.addListener(onChange);
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange);
      else if (typeof mq.removeListener === 'function') mq.removeListener(onChange);
    };
  }, []);

  /* ─── Scroll scrub loop ─── */
  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    const video = videoRef.current;
    if (!track || !video) return;

    let duration = 0;
    let target = 0;
    let shown = 0;
    let written = -1;
    let raf = 0;

    const onReady = () => {
      const d = video.duration;
      if (d && Number.isFinite(d) && d > 0) {
        duration = d;
        try { video.currentTime = 0; } catch { /* ignore */ }
      }
    };
    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('loadeddata', onReady);

    const tick = () => {
      /* Progress through the track (0 at the top, 1 at the release point) */
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const span = rect.height - vh;
      if (span > 0 && rect.bottom > 0 && rect.top < vh) {
        const p = rect.top < 0 ? -rect.top / span : 0;
        target = Math.min(1, Math.max(0, p));
      }

      /* Smooth follow + snap to target when idle */
      shown += (target - shown) * SCRUB_FACTOR;
      if (Math.abs(target - shown) < 0.0004) shown = target;

      /* Journey-complete threshold — a handful of state flips, not per-pixel */
      const done = shown >= FINAL_PROGRESS;
      if (done !== endedRef.current) {
        endedRef.current = done;
        setEnded(done);
      }

      /* Direct style updates — no React re-render while scrolling */
      if (railRef.current) railRef.current.style.transform = `scaleY(${shown.toFixed(3)})`;

      /* Map progress onto the video timeline, clamped, with a small deadzone
         so the video never jitters while the user is resting. */
      if (duration > 0 && video.readyState >= 1) {
        const next = shown * (duration - 0.05);
        if (Math.abs(next - written) >= SCRUB_EPS) {
          written = next;
          try { video.currentTime = Math.min(Math.max(next, 0), duration - 0.04); } catch { /* ignore */ }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('loadeddata', onReady);
    };
  }, [reduced]);

  const overlay = (
    <>
      <div className="cine-copy">
        <p className="cine-eyebrow" aria-hidden="true">{h.badge}</p>
        <h1 className="cine-title" id="hero-title">{h.tagline}</h1>
        <div className="cine-actions">
          <a href="#donate" className="cine-cta">
            <span className="cine-cta-heart" aria-hidden="true">♥</span>
            <span>{h.cta}</span>
          </a>
        </div>
      </div>

      <div className="cine-hint" aria-hidden="true">
        <div className="hero-scroll-mouse"><div className="hero-scroll-wheel" /></div>
        <span className="hero-scroll-text">{h.scroll}</span>
      </div>

      <div className="cine-rail" aria-hidden="true">
        <span className="cine-rail-fill" ref={railRef} />
      </div>
    </>
  );

  /* Reduced motion: static poster frame, normal page height, scroll freely. */
  if (reduced) {
    return (
      <section className="cine-hero cine-hero-static" id="home" aria-labelledby="hero-title">
        <div className="cine-canvas">
          <img className="cine-poster" src={imgs.heroFrameFront} alt="Hussaini Homes building — front view" decoding="async" />
          <div className="cine-grade" aria-hidden="true" />
          <div className="cine-scrim" aria-hidden="true" />
          <div className="cine-bottom-fade" aria-hidden="true" />
        </div>
        {overlay}
      </section>
    );
  }

  return (
    <div className="cine-hero-track" ref={trackRef}>
      <section className={`cine-hero${ended ? ' ended' : ''}`} id="home" aria-labelledby="hero-title">
        <div className="cine-canvas">
          <video
            className="cine-video"
            ref={videoRef}
            src={HERO_VIDEO}
            poster={imgs.heroFrameSide}
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            tabIndex={-1}
            aria-hidden="true"
          />
          <div className="cine-grade" aria-hidden="true" />
          <div className="cine-scrim" aria-hidden="true" />
          <div className="noise-overlay" aria-hidden="true" />
          <div className="cine-vignette" aria-hidden="true" />
          <div className="cine-sweep" aria-hidden="true" />
          <div className="cine-bottom-fade" aria-hidden="true" />
        </div>
        {overlay}
      </section>
    </div>
  );
}
