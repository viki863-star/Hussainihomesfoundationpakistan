import { useRef, useCallback } from 'react';
import { useLang } from '../LangContext';

function TiltCard({ children, className = '' }) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1200px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`service-card ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transition: 'transform 0.15s ease, background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease' }}
    >
      {children}
    </div>
  );
}

export default function Services() {
  const { t, isUrdu } = useLang();
  const s = t.services;

  return (
    <section className="section services-section" id="services" dir={isUrdu ? 'rtl' : 'ltr'} aria-labelledby="services-title">
      <div className="services-bg" aria-hidden="true" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-center">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {s.eyebrow}
          </div>
          <h2 className="section-title" id="services-title" style={{ color: 'var(--white)' }}>
            {s.title}
          </h2>
          <p className="section-subtitle">
            {s.subtitle}
          </p>
        </div>

        <div className="services-grid stagger-group">
          {s.items.map((item, i) => (
            <TiltCard key={i} className="stagger-item">
              <div className="service-card-top-line" />
              <div className="service-icon-wrap">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
