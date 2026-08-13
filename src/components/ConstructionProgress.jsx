import { useState, useEffect, useRef } from 'react';
import { useLang } from '../LangContext';
import { useSiteImages } from '../siteImages';
import { useContent } from '../useContent';
import { useFocusTrap } from '../useFocusTrap';

function ConstructionLightbox({ src, alt, onClose }) {
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef(null);

  useFocusTrap(dialogRef, true);

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
      ref={dialogRef}
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
  const content = useContent();
  const c = t.construction;
  const [open, setOpen] = useState(false);

  const cfgItems = (content && content.construction && content.construction.items) || [];
  const items = (cfgItems.length ? cfgItems : c.items.map(item => ({
    labelEn: item.label,
    labelUr: item.label,
    statusEn: item.status,
    statusUr: item.status,
  }))).map(item => ({
    label: item['label' + (isUrdu ? 'Ur' : 'En')] || item.labelEn || item.label || '',
    status: item['status' + (isUrdu ? 'Ur' : 'En')] || item.statusEn || item.status || '',
  }));

  return (
    <section className="section construction-section" id="construction-progress" dir={isUrdu ? 'rtl' : 'ltr'} aria-labelledby="construction-title">
      <div className="container">
        <div className="text-center">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {c.eyebrow}
          </div>
          <h2 className="section-title" id="construction-title">{c.title}</h2>
          <p className="section-subtitle">{c.subtitle}</p>
        </div>
      </div>

      <div className="construction-poster-wrap section-scale-in">
        <button
          type="button"
          className="construction-img-btn construction-poster-btn"
          onClick={() => setOpen(true)}
          aria-label={`${c.imageAlt} — ${c.zoomLabel}`}
        >
          <img
            className="construction-img construction-poster"
            src={imgs.constructionPoster}
            alt={c.imageAlt}
            loading="lazy"
          />
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
      </div>

      <div className="container">
        <div className="construction-card section-fade-up delay-200">
          <h3 className="construction-card-title">{c.cardTitle}</h3>
          <p className="construction-card-text">{c.cardText}</p>

          <ul className="construction-progress-list stagger-group">
            {items.map((item, i) => (
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
          src={imgs.constructionPoster}
          alt={c.imageAlt}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}