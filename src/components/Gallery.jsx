import { useState, useEffect, useCallback } from 'react';
import { useLang } from '../LangContext';
import { withBase } from '../paths';

function Lightbox({ items, index, onClose, setIndex }) {
  const next = useCallback(() => setIndex((index + 1) % items.length), [index, items.length, setIndex]);
  const prev = useCallback(() => setIndex((index - 1 + items.length) % items.length), [index, items.length, setIndex]);

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, next, prev]);

  const item = items[index];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
      <button className="lightbox-nav lightbox-nav-prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        {item.src ? (
          <img src={item.src} alt={item.label} />
        ) : (
          <div className="gallery-placeholder" style={{ width: 400, height: 300 }}>
            <span className="gallery-placeholder-icon">{item.icon}</span>
            <span className="gallery-placeholder-text">{item.label}</span>
          </div>
        )}
        <div className="lightbox-caption">{item.label}</div>
      </div>
      <button className="lightbox-nav lightbox-nav-next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
    </div>
  );
}

function GalleryCard({ item, catLabel, tilt, onOpen }) {
  const [err, setErr] = useState(false);

  return (
    <div
      className="gallery-card stagger-item"
      style={{ '--tilt': tilt }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
      aria-label={`View ${item.label}`}
    >
      <div className="gallery-card-media">
        {err ? (
          <div className="gallery-card-placeholder" aria-hidden="true">
            <span className="gallery-card-placeholder-icon">{item.icon}</span>
          </div>
        ) : (
          <img src={item.src} alt={item.label} loading="lazy" onError={() => setErr(true)} />
        )}
        <span className="gallery-card-corner gallery-card-corner-tl" aria-hidden="true">{item.icon}</span>
        <span className="gallery-card-corner gallery-card-corner-br" aria-hidden="true">{item.icon}</span>
      </div>
      <div className="gallery-card-body">
        <span className="gallery-card-cat">{catLabel}</span>
        <h4 className="gallery-card-label">{item.label}</h4>
        {item.detail && <p className="gallery-card-detail">{item.detail}</p>}
      </div>
    </div>
  );
}

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [cat, setCat] = useState('all');
  const { t, isUrdu } = useLang();
  const g = t.gallery;

  const [items, setItems] = useState(null);

  useEffect(() => {
    fetch(withBase('/data/gallery.json'))
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then(d => setItems(Array.isArray(d) ? d : (d && d.items) || []))
      .catch(() => setItems([]));
  }, []);

  const lang = isUrdu ? 'ur' : 'en';
  const mapped = (items || []).map(it => ({
    ...it,
    src: it.src ? withBase(it.src) : it.src,
    label: (it.label && it.label[lang]) || '',
    detail: (it.detail && it.detail[lang]) || '',
  }));
  const filtered = cat === 'all' ? mapped : mapped.filter(it => it.cat === cat);
  const cats = ['all', 'building', 'foundation', 'students', 'meals', 'school', 'prayer', 'events'];

  return (
    <section className="section gallery-section" id="gallery" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="text-center">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {g.eyebrow}
          </div>
          <h2 className="section-title">{g.title}</h2>
          <p className="section-subtitle">
            {g.subtitle}
          </p>
        </div>

        <div className="gallery-filters">
          {cats.map(c => (
            <button
              key={c}
              className={`gallery-filter${cat === c ? ' active' : ''}`}
              onClick={() => setCat(c)}
            >
              {g.categories[c]}
            </button>
          ))}
        </div>

        <div className="gallery-carousel reveal">
          <div className="gallery-marquee">
            <div
              key={cat}
              className="gallery-track"
              style={{ '--slide-count': Math.max(filtered.length, 1) }}
            >
              {[...filtered, ...filtered].map((item, i) => (
                <GalleryCard
                  key={`${item.src}-${i}`}
                  item={item}
                  catLabel={g.categories[item.cat]}
                  tilt={`${i % 2 === 0 ? -2 : 2}deg`}
                  onOpen={() => setActiveIndex(i % filtered.length)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeIndex !== null && (
        <Lightbox
          items={filtered}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          setIndex={setActiveIndex}
        />
      )}
    </section>
  );
}
