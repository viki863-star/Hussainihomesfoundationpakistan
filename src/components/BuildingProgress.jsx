import { useState, useEffect, useRef } from 'react';
import { useLang } from '../LangContext';
import { withBase } from '../paths';

function AnimatedBar({ label, target, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        setTimeout(() => {
          setWidth(target);
          const dur = 1600;
          const start = performance.now();
          const step = now => {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.floor(eased * target));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }, delay);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, delay]);

  return (
    <div className="progress-item stagger-item" ref={ref}>
      <div className="progress-meta">
        <span className="progress-label">
          <span
            className="progress-dot"
            style={{ background: color }}
          />
          {label}
        </span>
        <span className="progress-pct" style={{ color }}>{count}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function BuildingProgress() {
  const { t, isUrdu } = useLang();
  const b = t.building;

  const bars = [
    { label: b.bars[0], target: 100, color: '#EF4444', delay: 0 },
    { label: b.bars[1], target: 100, color: '#EF4444', delay: 200 },
    { label: b.bars[2], target: 100, color: '#F59E0B', delay: 400 },
    { label: b.bars[3], target: 0,   color: '#6B7280', delay: 600 },
    { label: b.bars[4], target: 10,  color: '#FBBF24', delay: 800 },
  ];

  const facilities = b.facilityList;

  return (
    <section className="section building-section" id="building" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="container">
        {/* Section header */}
        <div className="text-center" style={{ marginBottom: 72 }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {b.eyebrow}
          </div>
          <h2 className="section-title">{b.sectionTitle}</h2>
          <p className="section-subtitle">{b.subtitle}</p>
        </div>

        <div className="building-layout">
          {/* Left — progress */}
          <div className="reveal reveal-left">
            <h3 className="building-title">{b.title}</h3>
            <p className="building-description">{b.desc}</p>

            <div className="progress-list stagger-group">
              {bars.map((bar, i) => (
                <AnimatedBar key={i} {...bar} />
              ))}
            </div>

            <div className="budget-cards" style={{ marginTop: 36 }}>
              <div className="budget-card">
                <span className="budget-label">{b.totalBudget}</span>
                <span className="budget-value">PKR 45.5M</span>
              </div>
              <div className="budget-card">
                <span className="budget-label">{b.invested}</span>
                <span className="budget-value" style={{ color: 'var(--crimson-light)' }}>PKR 13M</span>
              </div>
              <div className="budget-card">
                <span className="budget-label">{b.monthlyCost}</span>
                <span className="budget-value" style={{ color: 'var(--gold)' }}>PKR 300K</span>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <a href="#donate" className="btn btn-crimson">
                {b.supportBtn}
              </a>
            </div>
          </div>

          {/* Right — image + facilities */}
          <div className="reveal reveal-right">
            <img
              className="building-img-main"
              src={withBase('/images/Bulding Pic 2.jpeg')}
              alt="Building under construction"
            />
            <div className="facilities-wrap">
              <h4 className="facilities-title">
                <span>🏗️</span> {b.facilities}
              </h4>
              <div className="facilities-grid">
                {facilities.map((f, i) => (
                  <span key={i} className="facility-tag">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
