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
const HERO_VIDEO_MOBILE = withBase('/images/hero-cinematic-mobile.mp4');
const HERO_POSTER_MOBILE = withBase('/images/hero-poster-mobile.jpg');

/* Scrub tuning */
const SCRUB_FACTOR = 0.14;   // smoothing: lower = heavier, higher = snappier
const SCRUB_EPS = 0.01;      // seconds — smallest currentTime change we write
const FINAL_PROGRESS = 0.97; // progress that counts as "journey complete"
/* The videos are encoded with an IDR keyframe every 0.5s, so we snap each
   seek onto that grid. Landing exactly on a keyframe means the browser
   decodes a single frame per step — no decode bursts, no scroll hang. */
const KEYFRAME_STEP = 0.5;

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
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches
  );

  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const railRef = useRef(null);
  const endedRef = useRef(false);
  const targetRef = useRef(0);
  const shownRef = useRef(0);
  const writtenRef = useRef(-1);
  const durationRef = useRef(0);
  const touchDragRef = useRef(null);

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

  /* Live mobile/portrait detection → use the dedicated 9:16 video */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (typeof mq.addListener === 'function') mq.addListener(onChange);
    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange);
      else if (typeof mq.removeListener === 'function') mq.removeListener(onChange);
    };
  }, []);

  /* ─── Shared scrub sink ───
     Writes a single progress value (0..1) to the rail + video timeline.
     Both the desktop scroll loop and the mobile touch handlers feed this. */
  const applyScrub = (p) => {
    const shown = Math.min(1, Math.max(0, p));
    if (railRef.current) railRef.current.style.transform = `scaleY(${shown.toFixed(3)})`;

    const done = shown >= FINAL_PROGRESS;
    if (done !== endedRef.current) {
      endedRef.current = done;
      setEnded(done);
    }

    const duration = durationRef.current;
    const video = videoRef.current;
    if (duration > 0 && video && video.readyState >= 1) {
      const raw = shown * (duration - 0.05);
      const next = Math.min(Math.max(raw, 0), duration - 0.04);
      const snapped = Math.round(next / KEYFRAME_STEP) * KEYFRAME_STEP;
      if (Math.abs(snapped - writtenRef.current) >= SCRUB_EPS) {
        writtenRef.current = snapped;
        try { video.currentTime = Math.min(snapped, duration - 0.04); } catch { /* ignore */ }
      }
    }
  };

  /* ─── Mobile: direct touch-drag scrub ───
     Finger drag = the video timeline. Vertical drag still scrolls the page
     (native `touch-action: pan-y`), horizontal drag scrubs the story. */
  const handleTouchStart = (e) => {
    if (!e.touches || !e.touches[0]) return;
    touchDragRef.current = {
      x: e.touches[0].clientX,
      base: shownRef.current,
    };
  };
  const handleTouchMove = (e) => {
    const d = touchDragRef.current;
    if (!d || !e.touches || !e.touches[0]) return;
    const dx = e.touches[0].clientX - d.x;
    const span = Math.max(window.innerWidth || 360, 320) * 1.5;
    targetRef.current = Math.min(1, Math.max(0, d.base + dx / span));
  };
  const handleTouchEnd = () => {
    touchDragRef.current = null;
  };

  /* ─── Scrub driver ───
     One rAF loop owns the easing + video writes. Desktop feeds `targetRef`
     from scroll position through the track; when dragging on mobile the
     touch handlers wrote it already. */
  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    const video = videoRef.current;
    if (!track || !video) return;

    let raf = 0;

    const onReady = () => {
      const d = video.duration;
      if (d && Number.isFinite(d) && d > 0) {
        durationRef.current = d;
        try { video.currentTime = 0; } catch { /* ignore */ }
      }
    };
    video.addEventListener('loadedmetadata', onReady);
    video.addEventListener('loadeddata', onReady);
    onReady();

    const tick = () => {
      /* Desktop: progress through the track (0 at top, 1 at release point).
         Mobile: target was already set by the touch handlers. */
      if (!isMobile) {
        const rect = track.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const span = rect.height - vh;
        if (span > 0 && rect.bottom > 0 && rect.top < vh) {
          const p = rect.top < 0 ? -rect.top / span : 0;
          targetRef.current = Math.min(1, Math.max(0, p));
        }
      }

      /* Smooth follow + snap to target when idle. While a finger is down the
         easing is snapier so scrubbing feels direct. */
      const factor = touchDragRef.current ? 0.42 : SCRUB_FACTOR;
      let shown = shownRef.current;
      shown += (targetRef.current - shown) * factor;
      if (Math.abs(targetRef.current - shown) < 0.0004) shown = targetRef.current;
      shownRef.current = shown;

      applyScrub(shown);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('loadedmetadata', onReady);
      video.removeEventListener('loadeddata', onReady);
    };
  }, [reduced, isMobile]);

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
        {isMobile ? (
          <div className="hero-scroll-swipe"><span>⇠</span><span>⇢</span></div>
        ) : (
          <div className="hero-scroll-mouse"><div className="hero-scroll-wheel" /></div>
        )}
        <span className="hero-scroll-text">{isMobile ? h.swipe : h.scroll}</span>
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
      <section
        className={`cine-hero${ended ? ' ended' : ''}${isMobile ? ' cine-hero-touch' : ''}`}
        id="home"
        aria-labelledby="hero-title"
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
        onTouchCancel={isMobile ? handleTouchEnd : undefined}
      >
        <div className="cine-canvas">
          <video
            className="cine-video"
            ref={videoRef}
            key={isMobile ? 'm' : 'd'}
            src={isMobile ? HERO_VIDEO_MOBILE : HERO_VIDEO}
            poster={isMobile ? HERO_POSTER_MOBILE : imgs.heroFrameSide}
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
