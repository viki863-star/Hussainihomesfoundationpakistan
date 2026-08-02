import { useLang } from '../LangContext';
import { withBase } from '../paths';

export default function SuccessStories() {
  const { t, isUrdu } = useLang();
  const s = t.stories;

  return (
    <section className="section stories-section" id="stories" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="text-center">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {s.eyebrow}
          </div>
          <h2 className="section-title">{s.title}</h2>
          <p className="section-subtitle">{s.subtitle}</p>
        </div>

        <div className="stories-grid stagger-group">
          {s.items.map((item, i) => (
            <div key={i} className="story-card stagger-item">
              <div className="story-card-img-wrap">
                <img src={withBase(item.img)} alt={item.title} loading="lazy" />
              </div>
              <div className="story-card-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: 48 }}>
          <a href="#donate" className="btn btn-primary btn-lg btn-shimmer">
            {s.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
