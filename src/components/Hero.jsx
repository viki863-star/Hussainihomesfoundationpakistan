import { useState, useEffect, useRef, useMemo } from 'react';
import { useLang } from '../LangContext';
import { useSiteImages } from '../siteImages';
import { useContent } from '../useContent';

/* ─── Animated counter ─── */
function useCountUp(target, duration = 2200, active = true) {
  const [count, setCount] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;
    const start = performance.now();
    const num = parseInt(target);
    const step = now => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(ease * num));
      if (p < 1) requestAnimationFrame(step);
      else setCount(num);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

function Stat({ number, label, prefix = '', suffix = '', active = true }) {
  const count = useCountUp(number, 2200, active);
  return (
    <div className="hero-stat">
      <span className="hero-stat-number">{prefix}{count}{suffix}</span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

/* ─── Main Cinematic Hero ─── */
export default function Hero() {
  const { t, isUrdu } = useLang();
  const imgs = useSiteImages();
  const content = useContent();
  const h = t.hero;
  const stats = (content && content.stats) || {};

  const reduced = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const heroRef = useRef(null);
  const resolveRef = useRef(null);
  const railFillRef = useRef(null);
  const hintRef = useRef(null);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [resolveActive, setResolveActive] = useState(false);
  const [resolveVisible, setResolveVisible] = useState(false);

  const currentFrameRef = useRef(0);
  const isLockedRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const resolvedRef = useRef(false);
  const wheelAccum = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  useEffect(() => { currentFrameRef.current = currentFrame; }, [currentFrame]);
  useEffect(() => { isLockedRef.current = isLocked; }, [isLocked]);

  const frames = [
    { src: imgs.heroFrameSide,     alt: 'Hussaini Homes building — side view',     cap: h.frame1 },
    { src: imgs.heroFrameLeft,     alt: 'Hussaini Homes building — left / front',  cap: h.frame2 },
    { src: imgs.heroFrameFront,    alt: 'Hussaini Homes building — front view',    cap: h.frame3 },
    { src: imgs.heroFrameInterior, alt: 'Inside the Hussaini Homes building',      cap: h.frame4 },
  ];

  /* ─── Preload first frame ─── */
  useEffect(() => {
    if (!imgs.heroFrameSide || reduced) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imgs.heroFrameSide;
    link.fetchPriority = 'high';
    document.head.appendChild(link);
    return () => link.remove();
  }, [imgs.heroFrameSide, reduced]);

  /* ─── Preload later frames ─── */
  useEffect(() => {
    if (reduced) return;
    const raf = requestAnimationFrame(() => {
      const later = [imgs.heroFrameLeft, imgs.heroFrameFront, imgs.heroFrameInterior];
      later.forEach(src => {
        if (!src) return;
        const img = new Image();
        img.src = src;
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [reduced, imgs.heroFrameLeft, imgs.heroFrameFront, imgs.heroFrameInterior]);

  /* ─── Lock / unlock body scroll ─── */
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isLocked]);

  /* ─── Advance / retreat frame ─── */
  const advance = useCallback(() => {
    if (isAnimatingRef.current) return;
    const next = currentFrameRef.current + 1;
    if (next > 3) {
      isLockedRef.current = false;
      setIsLocked(false);
      setResolveVisible(true);
      setResolveActive(true);
      resolvedRef.current = true;
      requestAnimationFrame(() => {
        heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    isAnimatingRef.current = true;
    currentFrameRef.current = next;
    setCurrentFrame(next);
    setTimeout(() => { isAnimatingRef.current = false; }, 900);
  }, []);

  const retreat = useCallback(() => {
    if (isAnimatingRef.current) return;
    const prev = currentFrameRef.current - 1;
    if (prev < 0) {
      // Back to frame 1 → unlock
      isLockedRef.current = false;
      setIsLocked(false);
      return;
    }
    isAnimatingRef.current = true;
    currentFrameRef.current = prev;
    setCurrentFrame(prev);
    setTimeout(() => { isAnimatingRef.current = false; }, 900);
  }, []);

  /* ─── Wheel handler ─── */
  useEffect(() => {
    if (reduced) return;
    const hero = heroRef.current;
    if (!hero) return;

    const onWheel = (e) => {
      const heroInView = hero.getBoundingClientRect().top < window.innerHeight && hero.getBoundingClientRect().bottom > 0;
      if (!heroInView) return;

      // First interaction: lock hero
      if (!isLockedRef.current) {
        e.preventDefault();
        isLockedRef.current = true;
        setIsLocked(true);
        return;
      }

      // Already locked: accumulate delta
      e.preventDefault();
      wheelAccum.current += e.deltaY;

      const threshold = 40;
      if (Math.abs(wheelAccum.current) >= threshold) {
        if (wheelAccum.current > 0) {
          advance();
        } else {
          retreat();
        }
        wheelAccum.current = 0;
      }
    };

    hero.addEventListener('wheel', onWheel, { passive: false });
    return () => hero.removeEventListener('wheel', onWheel);
  }, [reduced, advance, retreat]);

  /* ─── Touch handler ─── */
  useEffect(() => {
    if (reduced) return;
    const hero = heroRef.current;
    if (!hero) return;

    const onTouchStart = (e) => {
      const heroInView = hero.getBoundingClientRect().top < window.innerHeight && hero.getBoundingClientRect().bottom > 0;
      if (!heroInView) return;

      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();

      if (!isLockedRef.current) {
        isLockedRef.current = true;
        setIsLocked(true);
      }
    };

    const onTouchMove = (e) => {
      if (!isLockedRef.current) return;
      const deltaY = touchStartY.current - e.touches[0].clientY;
      const elapsed = Date.now() - touchStartTime.current;

      // Only trigger on fast swipes (prevents accidental triggers during slow scroll)
      if (elapsed < 500 && Math.abs(deltaY) > 50) {
        e.preventDefault();
        if (deltaY > 0) {
          advance();
        } else {
          retreat();
        }
        touchStartY.current = e.touches[0].clientY;
        touchStartTime.current = Date.now();
      }
    };

    const onTouchEnd = () => {
      touchStartY.current = 0;
    };

    hero.addEventListener('touchstart', onTouchStart, { passive: true });
    hero.addEventListener('touchmove', onTouchMove, { passive: false });
    hero.addEventListener('touchend', onTouchEnd);
    return () => {
      hero.removeEventListener('touchstart', onTouchStart);
      hero.removeEventListener('touchmove', onTouchMove);
      hero.removeEventListener('touchend', onTouchEnd);
    };
  }, [reduced, advance, retreat]);

  /* ─── Keyboard handler ─── */
  useEffect(() => {
    if (reduced) return;
    const hero = heroRef.current;
    if (!hero) return;

    const onKeyDown = (e) => {
      const heroInView = hero.getBoundingClientRect().top < window.innerHeight && hero.getBoundingClientRect().bottom > 0;
      if (!heroInView) return;

      if (!isLockedRef.current) {
        if (e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          isLockedRef.current = true;
          setIsLocked(true);
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        advance();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        retreat();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [reduced, advance, retreat]);

  /* ─── Resolution panel animation ─── */
  useEffect(() => {
    if (!resolveVisible || !resolveRef.current) return;
    resolveRef.current.style.opacity = '0';
    resolveRef.current.style.transform = 'translate3d(0, 30px, 0)';
    requestAnimationFrame(() => {
      if (resolveRef.current) {
        resolveRef.current.style.transition = 'opacity 1s ease, transform 1s ease';
        resolveRef.current.style.opacity = '1';
        resolveRef.current.style.transform = 'translate3d(0, 0, 0)';
      }
    });
  }, [resolveVisible]);

  /* ─── Rail fill animation ─── */
  useEffect(() => {
    if (!railFillRef.current) return;
    const p = (currentFrame + (resolveVisible ? 1 : 0)) / 4;
    railFillRef.current.style.transform = `scaleY(${p})`;
  }, [currentFrame, resolveVisible]);

  const dir = isUrdu ? 'rtl' : 'ltr';

  const resolution = (
    <div className="cine-resolve" ref={resolveRef} style={resolveVisible ? undefined : { opacity: 0, pointerEvents: 'none' }}>
      <div className="hero-badge cine-badge">
        <span className="hero-badge-dot" />
        <span>{h.badge}</span>
      </div>
      <h1 className="cine-title" id="hero-title">{h.tagline}</h1>
      <p className="cine-desc">{h.desc}</p>
      <div className="hero-actions cine-actions">
        <a href="#donate" className="btn btn-primary btn-lg btn-shimmer hero-cta-primary">
          <span className="hero-cta-heart">♥</span>
          {h.cta}
        </a>
        <a href="#about" className="btn btn-outline hero-cta-secondary">
          {isUrdu ? 'مزید جانیں' : 'Learn More'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
      <div className="hero-trust cine-trust">
        <div className="hero-trust-item"><span className="hero-trust-icon">✓</span>{isUrdu ? 'رجسٹرڈ این جی او' : 'Registered NGO'}</div>
        <div className="hero-trust-item"><span className="hero-trust-icon">✓</span>{isUrdu ? '۲۰۱۸ء سے فعال' : 'Active since 2018'}</div>
        <div className="hero-trust-item"><span className="hero-trust-icon">✓</span>{isUrdu ? 'مکمل شفافیت' : '100% Transparent'}</div>
      </div>
      <div className="hero-stats cine-stats">
        <Stat number={stats.children ?? 31}      label={h.stat1}                 active={resolveActive} />
        <Stat number={stats.yearsActive ?? 7}    label={isUrdu ? 'سال خدمت' : 'Years Active'} suffix="+" active={resolveActive} />
        <Stat number={stats.foundedYear ?? 2018} label={h.stat3}                 active={resolveActive} />
      </div>
    </div>
  );

  /* ── Reduced motion: calm static composition ── */
  if (reduced) {
    return (
      <section className="cine-hero cine-hero-static" id="home" ref={heroRef} aria-labelledby="hero-title">
        <div className="cine-frame cine-frame-still">
          <img className="cine-frame-img" src={imgs.heroFrameInterior} alt={frames[3].alt} decoding="async" />
          <div className="cine-scrim" aria-hidden="true" />
        </div>
        <div className="noise-overlay" aria-hidden="true" />
        {resolution}
        <div className="cine-bottom-fade" aria-hidden="true" />
      </section>
    );
  }

  return (
    <section className={`cine-hero${isLocked ? ' cine-locked' : ''}`} id="home" ref={heroRef} aria-labelledby="hero-title">
      <div className="cine-viewport">
        <div className="cine-stage" style={{ direction: dir }}>
          {frames.map((f, i) => (
            <figure
              key={f.src + i}
              className={`cine-frame${i === currentFrame ? ' active' : ''}${i === 3 && currentFrame === 3 ? ' cine-frame-enter' : ''}`}
              aria-hidden={i !== currentFrame}
            >
              <img
                className="cine-frame-img"
                src={f.src}
                alt={f.alt}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'low'}
              />
              <div className="cine-scrim" aria-hidden="true" />
              <figcaption className="cine-caption">
                <span className="cine-caption-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="cine-caption-text">{f.cap}</span>
              </figcaption>
            </figure>
          ))}

          {resolution}

          <div className="noise-overlay" aria-hidden="true" />
          <div className="cine-vignette" aria-hidden="true" />
          <div className="cine-bottom-fade" aria-hidden="true" />
        </div>

        {/* Scroll progress rail */}
        <div className="cine-rail" aria-hidden="true">
          <span className="cine-rail-fill" ref={railFillRef} />
        </div>

        {/* Scroll hint */}
        <div className="cine-hint" ref={hintRef} aria-hidden="true" style={{ opacity: currentFrame === 0 && !isLocked ? 1 : 0 }}>
          <div className="hero-scroll-mouse"><div className="hero-scroll-wheel" /></div>
          <span className="hero-scroll-text">{h.scroll}</span>
          <span className="cine-hint-line" />
        </div>

        {/* Frame indicator */}
        <div className="cine-indicator" aria-hidden="true">
          <span className={`cine-indicator-dot${currentFrame === 0 ? ' active' : ''}`} />
          <span className={`cine-indicator-dot${currentFrame === 1 ? ' active' : ''}`} />
          <span className={`cine-indicator-dot${currentFrame === 2 ? ' active' : ''}`} />
          <span className={`cine-indicator-dot${currentFrame === 3 || resolveVisible ? ' active' : ''}`} />
        </div>
      </div>
    </section>
  );
}
