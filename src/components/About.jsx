import { useLang } from '../LangContext';
import { useSiteImages } from '../siteImages';

export default function About() {
  const { t, isUrdu } = useLang();
  const imgs = useSiteImages();
  const a = t.about;

  const featureIcons = ['🍽️', '🏠', '📚', '🏥', '👕', '🎯'];

  return (
    <section className="section about-section" id="about">
      <div className="container">
        <div className="about-layout">
          {/* Left — Visuals */}
          <div className="reveal reveal-left">
            <div className="about-visual">
              <img
                className="about-img-main"
                src={imgs.aboutBuilding}
                alt="Hussaini Home Orphan Care Center"
              />
              <img
                className="about-img-accent"
                src={imgs.heroBuilding}
                alt="Building exterior"
              />
              <div className="about-years-badge">
                <span className="about-years-number">{a.years}</span>
                <span className="about-years-label">{a.yearsLabel}</span>
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div className="about-content reveal reveal-right" dir={isUrdu ? 'rtl' : 'ltr'}>
            <div className="section-eyebrow about-eyebrow" style={{ justifyContent: 'flex-start' }}>
              {a.eyebrow}
            </div>

            <h2 className="about-title">
              {a.title1}<br />
              <span className="text-gradient">{a.title2}</span>
            </h2>

            <p className="about-description">{a.p1}</p>
            <p className="about-description">{a.p2}</p>
            <p className="about-description">{a.p3}</p>

            <div className="about-features stagger-group">
              {a.features.map((text, i) => (
                <div key={i} className="about-feature stagger-item">
                  <span className="about-feature-icon">{featureIcons[i]}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
