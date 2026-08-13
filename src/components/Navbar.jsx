import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../LangContext';
import { useSiteImages } from '../siteImages';
import { useFocusTrap } from '../useFocusTrap';

function ThemeToggle({ isDark, onClick }) {
  return (
    <button
      className="theme-toggle"
      onClick={onClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar({ activeSection = 'home' }) {
  const { t, toggle, isUrdu, isDark, toggleTheme } = useLang();
  const imgs = useSiteImages();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [logoHovered, setLogoHovered] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const location = useLocation();
  const onHome = location.pathname === '/';

  // Modal-style mobile menu: trap focus while open, Escape closes it,
  // and focus returns to the toggle (handled inside useFocusTrap cleanup).
  useFocusTrap(menuRef, open);

  useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === 'Escape') {
        setOpen(false);
        if (toggleRef.current) toggleRef.current.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to section after navigating (e.g. from /team/:id to /#section)
  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (!el) return;
    const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => clearTimeout(t);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const navIds = ['home', 'about', 'team', 'services', 'building', 'gallery', 'contact'];
  const labels = [t.nav.home, t.nav.about, t.nav.team, t.nav.services, t.nav.building, t.nav.gallery, t.nav.contact];

  // Scroll progress bar
  const progressWidth = Math.min(
    (scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1)) * 100,
    100
  );

  return (
    <>
      {/* Scroll progress bar */}
      <div className="scroll-progress" style={{ width: `${progressWidth}%` }} />

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
        <div className="navbar-inner">

          {/* ─── ENHANCED LOGO ─── */}
          <Link
            to={onHome ? '#home' : '/#home'}
            className={`nav-logo${logoHovered ? ' logo-hovered' : ''}`}
            onClick={() => setOpen(false)}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <div className="nav-logo-img-wrap">
              <img
                src={imgs.logo}
                alt="Hussaini Homes Foundation Logo"
                className="nav-logo-img"
              />
            </div>
            <div className="nav-logo-text">
              {isUrdu ? (
                <span className="nav-logo-ur">حسینی ہومز فاؤنڈیشن</span>
              ) : (
                <span className="nav-logo-en">Hussaini Homes</span>
              )}
            </div>
          </Link>

          {/* ─── DESKTOP LINKS (mobile = fullscreen menu) ─── */}
          <ul
            className={`nav-links${open ? ' open' : ''}`}
            ref={menuRef}
            id="primary-nav"
            aria-label="Main navigation"
          >
            {navIds.map((id, i) => (
              <li key={id}>
                <Link
                  to={onHome ? `#${id}` : `/#${id}`}
                  className={activeSection === id ? 'active' : ''}
                  onClick={() => setOpen(false)}
                >
                  {labels[i]}
                  {activeSection === id && <span className="nav-active-dot" />}
                </Link>
              </li>
            ))}

            {/* Donate button */}
            <li>
              <Link to={onHome ? '#donate' : '/#donate'} className="donate-nav-btn" onClick={() => setOpen(false)}>
                <span className="donate-nav-heart">♥</span>
                {t.nav.donate.replace('♥ ', '')}
              </Link>
            </li>
          </ul>

          {/* ─── RIGHT CONTROLS ─── */}
          <div className="nav-right-controls">
            <ThemeToggle isDark={isDark} onClick={toggleTheme} />
            {/* Language toggle — beautiful slide switch */}
            <button
              className={`lang-toggle-pill${isUrdu ? ' lang-toggle-pill-ur' : ''}`}
              onClick={toggle}
              aria-label="Switch language"
            >
              <span className="lang-pill-track">
                <span className="lang-pill-thumb" />
              </span>
              <span className="lang-pill-en">EN</span>
              <span className="lang-pill-ur">اردو</span>
            </button>

            {/* Hamburger — proper button with expanded state + connected target */}
            <button
              type="button"
              ref={toggleRef}
              className={`nav-toggle${open ? ' open' : ''}`}
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="primary-nav"
            >
              <span /><span /><span />
            </button>
          </div>

        </div>
      </nav>
    </>
  );
}
