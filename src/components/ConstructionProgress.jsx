import { useState, useEffect } from 'react';
import { useLang } from '../LangContext';
import { useSiteImages } from '../siteImages';

function ConstructionLightbox({ src, alt, caption, onClose }) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="lightbox-overlay clightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button className="clightbox-close" onClick={onClose} aria-label="Close">✕</button>

      <div
        className={`clightbox-content${zoomed ? ' zoomed' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          onClick={() => setZoomed(z => !z)}
        />
        <div className="lightbox-caption">{caption}</div>
      </div>

      <button
        className="clightbox-zoom"
        onClick={() => setZoomed(z => !z)}
        aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {zoomed ? (
            <>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </>
          ) : (
            <>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ConstructionProgress() {
  const { t, isUrdu } = useLang();
  const imgs = useSiteImages();
  const c = t.construction;
  const [open, setOpen] = useState(null);

  return (
    <section className="section construction-section" id="construction-progress" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="text-center">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {c.eyebrow}
          </div>
          <h2 className="section-title">{c.title}</h2>
          <p className="section-subtitle">{c.subtitle}</p>
        </div>
      </div>

      <div className="construction-timeline-wrap">
        <div className="construction-timeline section-scale-in">

          <figure className="construction-stage construction-stage-begin">
            <button
              type="button"
              className="construction-img-btn"
              onClick={() => setOpen('begin')}
              aria-label={`${c.imageBeginAlt} — ${c.zoomLabel}`}
            >
              <img className="construction-img" src={imgs.constructionBegin} alt={c.imageBeginAlt} loading="lazy" />
              <span className="construction-stage-chip" aria-hidden="true">
                <span className="construction-stage-chip-dot" />
                {c.labelBegin}
              </span>
              <span className="construction-zoom-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span>{c.zoomLabel}</span>
              </span>
            </button>
          </figure>

          <div className="construction-arrow" aria-hidden="true">
            <svg viewBox="0 0 120 64" className="construction-arrow-svg">
              <path className="construction-arrow-line" d="M8 52 C 32 6, 88 6, 104 20" />
              <path className="construction-arrow-head" d="M88 14 L110 24 L88 36 Z" />
            </svg>
          </div>

          <figure className="construction-stage construction-stage-today">
            <button
              type="button"
              className="construction-img-btn"
              onClick={() => setOpen('today')}
              aria-label={`${c.imageTodayAlt} — ${c.zoomLabel}`}
            >
              <img className="construction-img" src={imgs.constructionToday} alt={c.imageTodayAlt} loading="lazy" />
              <span className="construction-stage-chip" aria-hidden="true">
                <span className="construction-stage-chip-dot" />
                {c.labelToday}
              </span>
              <span className="construction-zoom-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <span>{c.zoomLabel}</span>
              </span>
            </button>
          </figure>

        </div>
      </div>

      <div className="container">
        <div className="construction-card section-fade-up delay-200">
          <h3 className="construction-card-title">{c.cardTitle}</h3>
          <p className="construction-card-text">{c.cardText}</p>

          <ul className="construction-progress-list stagger-group">
            {c.items.map((item, i) => (
              <li key={i} className="construction-progress-item stagger-item">
                <span className="construction-check" aria-hidden="true">
                  <CheckIcon />
                </span>
                <span className="construction-item-label">{item.label}</span>
                <span className="construction-item-status">{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open && (
        <ConstructionLightbox
          src={open === 'begin' ? imgs.constructionBegin : imgs.constructionToday}
          alt={open === 'begin' ? c.imageBeginAlt : c.imageTodayAlt}
          caption={c.cardTitle}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
