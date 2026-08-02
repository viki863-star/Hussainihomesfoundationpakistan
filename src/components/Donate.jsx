import { useLang } from '../LangContext';

export default function Donate() {
  const { t, isUrdu } = useLang();
  const d = t.donate;
  const bank = d.bank;
  const mobile = d.mobile;
  const intl = d.intl;

  const cards = [
    {
      icon: d.cards[0].icon,
      title: d.cards[0].title,
      desc: d.cards[0].desc,
      detail: (
        <>
          <strong>{bank.bankLabel}:</strong> Bank Al Habib – Parachinar Branch<br />
          <strong>{bank.accountTitleLabel}:</strong> Hussaini Homes Foundation<br />
          <strong>{bank.ibanLabel}:</strong> PK05BAHL2018007800509701
        </>
      ),
    },
    {
      icon: d.cards[1].icon,
      title: d.cards[1].title,
      desc: d.cards[1].desc,
      detail: (
        <>
          <strong>{mobile.jazzcashLabel}:</strong> 0307 5905907 (Sayed Ijaz)<br />
          <strong>{mobile.easypaisaLabel}:</strong> 0303 4030009 (Iftikhar)<br />
          <strong>{mobile.jazzcashLabel}:</strong> 0303 8189466 (Talat Hussain)
        </>
      ),
    },
    {
      icon: d.cards[2].icon,
      title: d.cards[2].title,
      desc: d.cards[2].desc,
      detail: (
        <>
          <strong>{intl.heading}:</strong><br />
          {intl.note}
        </>
      ),
    },
  ];

  return (
    <section className="section donate-section" id="donate" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Decorative circles */}
      <div className="donate-bg-circles" aria-hidden="true">
        <div className="donate-circle donate-circle-1" />
        <div className="donate-circle donate-circle-2" />
        <div className="donate-circle donate-circle-3" />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-center">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {d.eyebrow}
          </div>
          <h2 className="section-title">
            {d.title}
          </h2>
          <p className="section-subtitle">
            {d.subtitle}
          </p>
        </div>

        {/* Monthly banner */}
        <div className="monthly-banner reveal reveal-scale">
          <span className="monthly-banner-icon">📊</span>
          <div className="monthly-banner-text">
            <strong>{d.monthly}</strong>
            <small>{d.monthlyNote}</small>
          </div>
        </div>

        {/* Donation cards */}
        <div className="donate-cards stagger-group">
          {cards.map((c, i) => (
            <div key={i} className="donate-card stagger-item">
              <div className="donate-card-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div className="account-detail">{c.detail}</div>
            </div>
          ))}
        </div>

        {/* Hadith quote */}
        <div className="donate-quote reveal reveal-up">
          <span className="donate-quote-mark">{d.quoteMark}</span>
          <p className="donate-quote-text">{d.quote}</p>
          <span className="donate-quote-source">{d.quoteSource}</span>
          <div style={{ marginTop: 28 }}>
            <a href="#contact" className="btn btn-primary btn-lg btn-shimmer">
              {d.contactBtn}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
