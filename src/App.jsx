import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './LangContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Team from './components/Team';
import TeamDetail from './components/TeamDetail';
import Services from './components/Services';
import BuildingProgress from './components/BuildingProgress';
import ConstructionProgress from './components/ConstructionProgress';
import Gallery from './components/Gallery';
import SuccessStories from './components/SuccessStories';
import Donate from './components/Donate';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from './components/Admin';
import { useSiteImages } from './siteImages';
import './App.css';
import './admin.css';

/* ---- Custom Cursor ---- */
function CustomCursor() {
  const glowRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div className="cursor-glow" ref={glowRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
}

/* ---- Marquee Ticker (uses lang via prop) ---- */
function MarqueeTicker({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-section" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((text, i) => (
          <div key={i} className="marquee-item">
            <span>✦</span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Floating Donate ---- */
function FloatingDonate({ label }) {
  return (
    <a href="#donate" className="floating-donate" aria-label={label}>
      ♥
      <span className="tooltip">{label}</span>
    </a>
  );
}

/* ---- Floating WhatsApp ---- */
function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/923034030009"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="30" height="30">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="tooltip">WhatsApp</span>
    </a>
  );
}

/* ---- Back to top ---- */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`back-to-top${show ? ' show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

/* ---- Branded preloader ---- */
function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);
  const imgs = useSiteImages();

  useEffect(() => {
    const t1 = setTimeout(() => setHidden(true), 1200);
    const t2 = setTimeout(() => setGone(true), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (gone) return null;
  return (
    <div className={`preloader${hidden ? ' preloader-hidden' : ''}`} aria-hidden="true">
      <img src={imgs.logo} alt="" className="preloader-logo" />
      <div className="preloader-bar"><div className="preloader-bar-fill" /></div>
    </div>
  );
}

/* ---- Surprise Scroll Animations Setup ---- */
function useScrollAnimations() {
  useEffect(() => {
    // 1. Reveal observer
    const revealObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          e.target.classList.add('just-revealed');
          setTimeout(() => e.target.classList.remove('just-revealed'), 1200);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // 2. Stagger observer
    const staggerObs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    // 3. Section title observer
    const titleObs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.5 }
    );

    // 4. Counter observer (for surprise number pop)
    const counterObs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('pop-in'); }),
      { threshold: 0.6 }
    );

    // 5. Premium fade-in observers (section-level)
    const makeObs = (threshold, rootMargin) => new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold, rootMargin }
    );
    const fadeObs = makeObs(0.12, '0px 0px -60px 0px');

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
    document.querySelectorAll('.stagger-group').forEach(el => staggerObs.observe(el));
    document.querySelectorAll('.section-title').forEach(el => titleObs.observe(el));
    document.querySelectorAll('.surprise-number').forEach(el => counterObs.observe(el));
    document.querySelectorAll('.section-fade-up, .section-fade-left, .section-fade-right, .section-scale-in').forEach(el => fadeObs.observe(el));

    return () => {
      revealObs.disconnect();
      staggerObs.disconnect();
      titleObs.disconnect();
      counterObs.disconnect();
      fadeObs.disconnect();
    };
  }, []);
}

/* ---- Active Section Tracker ---- */
function useActiveSection() {
  const [activeSection, setActiveSection] = useState('home');
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.3, rootMargin: '0px 0px -30% 0px' }
    );
    document.querySelectorAll('section[id]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return activeSection;
}

/* ---- Home Page ---- */
import { useLang } from './LangContext';

function HomePage() {
  const { t } = useLang();
  const activeSection = useActiveSection();
  useScrollAnimations();

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Preloader />
      <CustomCursor />
      <Navbar activeSection={activeSection} />
      <div id="main-content">
        <Hero />
        <MarqueeTicker items={t.marquee} />
        <About />
        <Services />
        <Team />
        <BuildingProgress />
        <ConstructionProgress />
        <Gallery />
        <SuccessStories />
        <Donate />
        <Contact />
      </div>
      <Footer />
      <FloatingDonate label={t.nav.donate} />
      <FloatingWhatsApp />
      <BackToTop />
    </>
  );
}

/* ---- App ---- */
// The build bakes a subpath base (e.g. GitHub Pages), but Render serves the
// same build from the site root. Only require the base in the URL when the
// page actually sits under it, so one build works on both.
function routerBasename() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base && window.location.pathname.startsWith(base) ? base : '';
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter basename={routerBasename()}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/team/:id" element={<TeamDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}
