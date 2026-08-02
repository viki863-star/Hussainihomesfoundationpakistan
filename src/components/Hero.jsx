import { useState, useEffect, useRef } from 'react';
import { useLang } from '../LangContext';
import { useSiteImages } from '../siteImages';

/* ─── Animated counter ─── */
function useCountUp(target, duration = 2200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
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
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return [count, ref];
}

function Stat({ number, label, prefix = '', suffix = '' }) {
  const [count, ref] = useCountUp(number);
  return (
    <div className="hero-stat hero-stat-animated" ref={ref}>
      <span className="hero-stat-number">{prefix}{count}{suffix}</span>
      <span className="hero-stat-label">{label}</span>
    </div>
  );
}

/* ─── Premium particle system ─── */
function Particles() {
  const colors = ['#B91C1C', '#D97706', '#F59E0B', '#EF4444', '#FBBF24', '#DC2626'];
  return (
    <div className="hero-particles" aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} className="hero-particle" style={{
          left: `${(i * 3.4 + 1) % 100}%`,
          '--duration': `${7 + (i % 7) * 1.2}s`,
          '--delay': `${(i * 0.28) % 8}s`,
          '--drift-x': `${(i % 2 === 0 ? 1 : -1) * (15 + i * 2)}px`,
          background: colors[i % colors.length],
          width: `${1.5 + (i % 3) * 0.8}px`,
          height: `${1.5 + (i % 3) * 0.8}px`,
          '--opacity-peak': `${0.3 + (i % 4) * 0.15}`,
        }} />
      ))}
    </div>
  );
}

/* ─── Morphing blob background ─── */
function MorphBlobs() {
  return (
    <div className="hero-blobs" aria-hidden="true">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />
    </div>
  );
}

/* ─── Typewriter effect ─── */
function TypeWriter({ texts, speed = 80, pause = 2200 }) {
  const [display, setDisplay] = useState('');
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    let timer;
    if (!deleting && charIdx < current.length) {
      timer = setTimeout(() => setCharIdx(i => i + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timer = setTimeout(() => setCharIdx(i => i - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTextIdx(i => (i + 1) % texts.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timer);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  return (
    <span className="hero-typewriter">
      {display}
      <span className="hero-typewriter-cursor" />
    </span>
  );
}

/* ─── Main Hero ─── */
export default function Hero() {
  const { t, isUrdu } = useLang();
  const imgs = useSiteImages();
  const h = t.hero;
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const tilt = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const [parallaxY, setParallaxY] = useState(0);

  // 3D tilt on mouse move
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mousePos.current = {
        x: (e.clientX - cx) / rect.width,
        y: (e.clientY - cy) / rect.height,
      };
    };
    section.addEventListener('mousemove', onMove, { passive: true });

    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      tilt.current.x = lerp(tilt.current.x, mousePos.current.x, 0.06);
      tilt.current.y = lerp(tilt.current.y, mousePos.current.y, 0.06);
      if (visualRef.current) {
        const rotX = -tilt.current.y * 10;
        const rotY = tilt.current.x * 10;
        visualRef.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      section.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // Parallax scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setParallaxY(y * 0.35);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const typewriterEN = ['Safe Home', 'Quality Education', 'Loving Care', 'Hope & Future'];
  const typewriterUR = ['محفوظ گھر', 'معیاری تعلیم', 'محبت بھری دیکھ بھال', 'امید و مستقبل'];

  return (
    <section className="hero-section" id="home" ref={sectionRef}>
      {/* Layered backgrounds */}
      <div className="hero-bg-gradient" aria-hidden="true"
        style={{ transform: `translateY(${parallaxY * 0.2}px)` }} />
      <div className="hero-spotlight" aria-hidden="true" />
      <div className="hero-grid-pattern" aria-hidden="true"
        style={{ transform: `translateY(${parallaxY * 0.1}px)` }} />
      <MorphBlobs />
      <Particles />
      <div className="noise-overlay" aria-hidden="true" />

      {/* Parallax rings */}
      <div className="hero-ring hero-ring-1" aria-hidden="true"
        style={{ transform: `translate(-50%, -50%) translateY(${parallaxY * 0.15}px) scale(1)` }} />
      <div className="hero-ring hero-ring-2" aria-hidden="true"
        style={{ transform: `translate(-50%, -50%) translateY(${parallaxY * 0.08}px)` }} />
      <div className="hero-ring hero-ring-3" aria-hidden="true"
        style={{ transform: `translate(-50%, -50%) translateY(${parallaxY * -0.05}px)` }} />

      <div className="container" style={{ width: '100%' }}>
        <div className="hero-content" style={{ direction: isUrdu ? 'rtl' : 'ltr' }}>

          {/* ── Text column ── */}
          <div className="hero-text">

            {/* Badge with dual language */}
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span className="hero-badge-en">{h.badge}</span>
            </div>

            {/* Main headline */}
            <h1 className="hero-headline">
              <span className="hero-line">
                <span className="hero-line-inner">{h.line1}</span>
              </span>
              <span className="hero-line">
                <span className="hero-line-inner hero-line-gold">{h.line2}</span>
              </span>
              <span className="hero-line">
                <span className="hero-line-inner hero-line-crimson">{h.line3}</span>
              </span>
            </h1>

            {/* Typewriter sub-line */}
            <div className="hero-typewriter-wrap">
              <span className="hero-typewriter-prefix">
                {isUrdu ? 'فراہم کر رہے ہیں:' : 'Providing:'}
              </span>
              <TypeWriter texts={isUrdu ? typewriterUR : typewriterEN} />
            </div>

            <p className="hero-description">{h.desc}</p>

            {/* CTAs */}
            <div className="hero-actions">
              <a href="#donate" className="btn btn-primary btn-lg btn-shimmer hero-cta-primary">
                <span className="hero-cta-heart">♥</span>
                {isUrdu ? 'ابھی عطیہ دیں' : 'Donate Now'}
              </a>
              <a href="#about" className="btn btn-outline hero-cta-secondary">
                {isUrdu ? 'مزید جانیں' : 'Learn More'}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            {/* Trust badges */}
            <div className="hero-trust">
              <div className="hero-trust-item">
                <span className="hero-trust-icon">✓</span>
                {isUrdu ? 'رجسٹرڈ این جی او' : 'Registered NGO'}
              </div>
              <div className="hero-trust-item">
                <span className="hero-trust-icon">✓</span>
                {isUrdu ? '۲۰۱۸ء سے فعال' : 'Active since 2018'}
              </div>
              <div className="hero-trust-item">
                <span className="hero-trust-icon">✓</span>
                {isUrdu ? 'مکمل شفافیت' : '100% Transparent'}
              </div>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              <Stat key={`${isUrdu}-31`}   number={31}   label={h.stat1} />
              <Stat key={`${isUrdu}-7`}    number={7}    label={isUrdu ? 'سال خدمت' : 'Years Active'} suffix="+" />
              <Stat key={`${isUrdu}-2018`} number={2018} label={h.stat3} />
            </div>
          </div>

          {/* ── Visual column ── */}
          <div className="hero-visual-wrap" ref={visualRef}>
            <div className="hero-image-frame">
              {/* Animated glow border */}
              <div className="hero-image-border" aria-hidden="true" />
              <div className="hero-image-border-inner" aria-hidden="true" />

              {/* Main image */}
              <div className="hero-image-inner">
                <img
                  src={imgs.heroBuilding}
                  alt="Hussaini Homes Foundation Building"
                  className="hero-main-img"
                />
                {/* Image overlay gradient */}
                <div className="hero-image-overlay" aria-hidden="true" />
              </div>

              {/* Floating info chips */}
              <div className="hero-chip hero-chip-1">
                <span className="hero-chip-icon">🏠</span>
                <div className="hero-chip-text">
                  <span className="hero-chip-title">{h.chip1Title}</span>
                  <span className="hero-chip-sub">{h.chip1Sub}</span>
                </div>
                <div className="hero-chip-live" />
              </div>

              <div className="hero-chip hero-chip-2">
                <span className="hero-chip-icon">📚</span>
                <div className="hero-chip-text">
                  <span className="hero-chip-title">{h.chip2Title}</span>
                  <span className="hero-chip-sub">{h.chip2Sub}</span>
                </div>
              </div>

              {/* Logo watermark chip */}
              <div className="hero-chip hero-chip-3">
                <img src={imgs.logo} alt="Logo" className="hero-chip-logo" />
                <div className="hero-chip-text">
                  <span className="hero-chip-title">Hussaini Homes</span>
                  <span className="hero-chip-sub">حسینی ہومز</span>
                </div>
              </div>

              {/* Corner accent */}
              <div className="hero-img-corner hero-img-corner-tl" aria-hidden="true" />
              <div className="hero-img-corner hero-img-corner-br" aria-hidden="true" />
            </div>

            {/* Decorative orbit */}
            <div className="hero-orbit" aria-hidden="true">
              <div className="hero-orbit-ring" />
              <div className="hero-orbit-dot hero-orbit-dot-1" />
              <div className="hero-orbit-dot hero-orbit-dot-2" />
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll">
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-wheel" />
        </div>
        <div className="hero-scroll-line" />
        <span className="hero-scroll-text">{h.scroll}</span>
      </div>

      {/* Bottom gradient fade */}
      <div className="hero-bottom-fade" aria-hidden="true" />
    </section>
  );
}
