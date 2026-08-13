import { useLang } from '../LangContext';
import { withBase } from '../paths';
import { useContent } from '../useContent';

export default function SuccessStories() {
  const { t, isUrdu } = useLang();
  const content = useContent();
  const s = t.stories;
  const cfgItems = (content && content.stories && content.stories.items) || [];
  const items = (cfgItems.length ? cfgItems : s.items.map(item => ({
    titleEn: item.title,
    titleUr: item.title,
    textEn: item.text,
    textUr: item.text,
    img: item.img,
  }))).map(item => ({
    title: item['title' + (isUrdu ? 'Ur' : 'En')] || item.titleEn || '',
    text: item['text' + (isUrdu ? 'Ur' : 'En')] || item.textEn || '',
    img: item.img || '',
  }));

  return (
    <section className="section stories-section" id="stories" dir={isUrdu ? 'rtl' : 'ltr'} aria-labelledby="stories-title">
      <div className="container">
        <div className="text-center">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {s.eyebrow}
          </div>
          <h2 className="section-title" id="stories-title">{s.title}</h2>
          <p className="section-subtitle">{s.subtitle}</p>
        </div>

        <div className="stories-grid stagger-group">
          {items.map((item, i) => (
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
