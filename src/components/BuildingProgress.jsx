import { useState, useEffect, useRef } from 'react';
import { useLang } from '../LangContext';
import { withBase } from '../paths';
import { useContent } from '../useContent';
import { useInView } from '../useInView';

function AnimatedBar({ label, target, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.3, once: true });
  const animated = useRef(false);

  useEffect(() => {
    if (!inView || animated.current) return;
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
  }, [inView, target, delay]);

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
  const content = useContent();
  const b = t.building;
  const cfg = (content && content.building) || {};
  const lang = isUrdu ? 'ur' : 'en';

  const barColors = ['#EF4444', '#EF4444', '#F59E0B', '#6B7280', '#FBBF24'];
  const cfgBars = cfg.bars && cfg.bars.length ? cfg.bars : [];
  const bars = (cfgBars.length ? cfgBars : b.bars.map((label, i) => ({ en: label, ur: b.bars[i], target: [100, 100, 100, 0, 10][i] || 0 })))
    .map((bar, i) => ({
      label: bar[lang] || bar.en || b.bars[i],
      target: Number(bar.target ?? 0),
      color: barColors[i % barColors.length],
      delay: i * 200,
    }));

  const cfgBudget = cfg.budget && cfg.budget.length ? cfg.budget : [];
  const budget = (cfgBudget.length ? cfgBudget : [
    { en: b.totalBudget, ur: b.totalBudget, value: 'PKR 45.5M' },
    { en: b.invested, ur: b.invested, value: 'PKR 13M' },
    { en: b.monthlyCost, ur: b.monthlyCost, value: 'PKR 300K' },
  ]).map((item, i) => ({
    label: item[lang] || item.en || b.totalBudget,
    value: item.value || '',
    color: i === 0 ? 'var(--text)' : (i === 1 ? 'var(--crimson-light)' : 'var(--gold)'),
  }));

  const cfgFacilities = (cfg.facilities && cfg.facilities[lang]) || [];
  const facilities = cfgFacilities.length ? cfgFacilities : b.facilityList;

  const imageSrc = withBase(cfg.image || '/images/Bulding Pic 2.jpeg');

  return (
    <section className="section building-section" id="building" dir={isUrdu ? 'rtl' : 'ltr'} aria-labelledby="building-title">
      <div className="container">
        {/* Section header */}
        <div className="text-center" style={{ marginBottom: 72 }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {b.eyebrow}
          </div>
          <h2 className="section-title" id="building-title">{b.sectionTitle}</h2>
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
              {budget.map((item, i) => (
                <div className="budget-card" key={i}>
                  <span className="budget-label">{item.label}</span>
                  <span className="budget-value" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
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
              src={imageSrc}
              alt="Building under construction"
              loading="lazy"
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
