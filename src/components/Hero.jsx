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

/* ─── Scroll helpers ─── */
function clamp01(n) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
function sweep(a, b, p) {
  if (a >= b) return clamp01(p);
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
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

  const trackRef = useRef(null);
  const stickyRef = useRef(null);
  const frameRefs = useRef([]);
  const capRefs = useRef([]);
  const resolveRef = useRef(null);
  const railFillRef = useRef(null);
  const hintRef = useRef(null);
  const resolved = useRef(false);
  const [resolveActive, setResolveActive] = useState(reduced);

  const frames = [
    { src: imgs.heroFrameSide,      alt: 'Hussaini Homes building — side view',     cap: h.frame1 },
    { src: imgs.heroFrameLeft,      alt: 'Hussaini Homes building — left / front',  cap: h.frame2 },
    { src: imgs.heroFrameFront,     alt: 'Hussaini Homes building — front view',    cap: h.frame3 },
    { src: imgs.heroFrameInterior,  alt: 'Inside the Hussaini Homes building',       cap: h.frame4 },
  ];

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

  // Pinned scroll choreography
  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    const sticky = stickyRef.current;
    if (!track || !sticky) return;

    const compact = matchMedia('(max-width: 768px)').matches;
    const motion = compact ? 0.5 : 1;

    const loops = [
      // side
      { els: [frameRefs.current[0], capRefs.current[0]], inA: 0, inB: 0.02, outA: 0.2, outB: 0.29, tx: [-0.8, -2.4], sc: [1.06, 1.14] },
      // left / front
      { els: [frameRefs.current[1], capRefs.current[1]], inA: 0.2, inB: 0.28, outA: 0.42, outB: 0.51, tx: [1.2, -1.6], sc: [1.1, 1.18] },
      // front
      { els: [frameRefs.current[2], capRefs.current[2]], inA: 0.44, inB: 0.52, outA: 0.66, outB: 0.76, tx: [1.6, -1],  sc: [1.16, 1.24] },
      // interior — stays until the end
      { els: [frameRefs.current[3], capRefs.current[3]], inA: 0.7, inB: 0.84, outA: 2, outB: 2, tx: [0.8, 0], sc: [1.35, 1.0] },
    ];

    const apply = (el, opacity, tx, scale, clip) => {
      if (!el) return;
      el.style.opacity = opacity.toFixed(3);
      if (clip) {
        el.style.clipPath = clip;
      } else {
        el.style.clipPath = '';
      }
      el.style.transform = `translate3d(${tx.toFixed(2)}%, 0, 0) scale(${scale.toFixed(3)})`;
    };

    const capApply = (el, opacity, ty, tx) => {
      if (!el) return;
      el.style.opacity = opacity.toFixed(3);
      el.style.transform = `translate3d(${tx.toFixed(1)}%, ${ty.toFixed(1)}px, 0)`;
    };

    let ticking = false;
    const offset = () => {
      ticking = false;
      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(track.offsetHeight - sticky.offsetHeight, 1);
      const p = clamp01(-rect.top / scrollable);

      loops.forEach((l, i) => {
        const exit = l.outA >= 2 ? 0 : sweep(l.outA, l.outB, p);
        const opacity = sweep(l.inA, l.inB, p) * (1 - exit);
        const lifetime = clamp01((p - l.inB) / Math.max((l.outA >= 2 ? 1 : l.outA) - l.inB, 0.001));
        const tx = lerp(l.tx[0], l.tx[1], lifetime) * motion;
        const scale = lerp(l.sc[0], l.sc[1], lifetime);
        let clip = null;
        if (i === 3) {
          // "entering the home" — window expands open
          const r = 1 - sweep(0.7, 0.86, p);
          clip = `inset(${(46 * r).toFixed(1)}% ${(40 * r).toFixed(1)}% ${(42 * r).toFixed(1)}% ${(40 * r).toFixed(1)}% round ${(12 * r).toFixed(1)}%)`;
        }
        apply(l.els[0], opacity, tx, scale, clip);

        const capIn = i === 0 ? 1 : sweep(l.inA + 0.02, l.inB + 0.03, p);
        const capOut = l.outA >= 2
          ? 1 - sweep(0.82, 0.93, p) // interior caption yields to the resolution panel
          : 1 - sweep(l.outA - 0.04, l.outA, p);
        capApply(l.els[1], Math.max(capIn * capOut, 0), (1 - capIn) * 18, tx * -0.4);
      });

      // resolution statement
      const rp = sweep(0.84, 0.98, p);
      if (resolveRef.current) {
        resolveRef.current.style.opacity = rp.toFixed(3);
        resolveRef.current.style.transform = `translate3d(0, ${(1 - rp) * 30}px, 0)`;
      }
      if (!resolved.current && rp > 0.5) {
        resolved.current = true;
        setResolveActive(true);
      }

      // scroll rail + hint
      if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
      if (hintRef.current) {
        hintRef.current.style.opacity = (1 - sweep(0, 0.06, p)).toFixed(3);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(offset);
      }
    };
    const onResize = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(offset);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    offset();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [reduced, isUrdu]);

  // Preload later frames while the first one plays
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

  const dir = isUrdu ? 'rtl' : 'ltr';

  const resolution = (
    <div className={`cine-resolve${reduced ? ' cine-resolve-visible' : ''}`} ref={resolveRef} style={reduced ? undefined : { opacity: 0 }}>
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
      <section className="cine-hero cine-hero-static" id="home" ref={trackRef} aria-labelledby="hero-title">
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
    <section className="cine-hero" id="home" ref={trackRef} aria-labelledby="hero-title">
      <div className="cine-track">
        <div className="cine-viewport" ref={stickyRef}>
          <div className="cine-stage" style={{ direction: dir }}>
            {frames.map((f, i) => (
              <figure
                key={f.src + i}
                className={`cine-frame cine-frame-${i + 1}`}
                ref={el => { frameRefs.current[i] = el; }}
                style={i === 0 ? { opacity: 1 } : undefined}
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
                <figcaption
                  className="cine-caption"
                  ref={el => { capRefs.current[i] = el; }}
                  style={i === 0 ? { opacity: 1 } : { opacity: 0 }}
                >
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
          <div className="cine-hint" ref={hintRef} aria-hidden="true">
            <div className="hero-scroll-mouse"><div className="hero-scroll-wheel" /></div>
            <span className="hero-scroll-text">{h.scroll}</span>
            <span className="cine-hint-line" />
          </div>
        </div>
      </div>
    </section>
  );
}