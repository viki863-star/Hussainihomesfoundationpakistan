import { useState } from 'react';
import { useLang } from '../LangContext';
import { useContent } from '../useContent';

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className="copy-btn" onClick={copy} aria-label="Copy to clipboard" title="Copy">
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span className="copy-btn-label">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

export default function Donate() {
  const { t, isUrdu } = useLang();
  const content = useContent();
  const d = t.donate;
  const bank = content.donate.bank;
  const mobilePay = content.donate.mobilePay;

  return (
    <section className="section donate-section" id="donate" dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Animated background */}
      <div className="donate-bg" aria-hidden="true">
        <div className="donate-bg-orb donate-bg-orb-1" />
        <div className="donate-bg-orb donate-bg-orb-2" />
        <div className="donate-bg-grid" />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="text-center reveal reveal-up">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {d.eyebrow}
          </div>
          <h2 className="section-title">{d.title}</h2>
          <p className="section-subtitle">{d.subtitle}</p>
        </div>

        {/* Monthly banner */}
        <div className="monthly-banner reveal reveal-scale">
          <span className="monthly-banner-icon">📊</span>
          <div className="monthly-banner-text">
            <strong>{d.monthly}</strong>
            <small>{d.monthlyNote}</small>
          </div>
        </div>

        {/* Donation cards — new premium design */}
        <div className="donate-cards-v2 stagger-group">

          {/* Bank Card */}
          <div className="donate-card-v2 stagger-item">
            <div className="donate-card-v2-header">
              <div className="donate-card-v2-icon">🏦</div>
              <div>
                <h3 className="donate-card-v2-title">{d.cards[0].title}</h3>
                <p className="donate-card-v2-desc">{d.cards[0].desc}</p>
              </div>
            </div>
            <div className="donate-field-group">
              <div className="donate-field">
                <span className="donate-field-label">{isUrdu ? 'بینک' : 'Bank'}</span>
                <div className="donate-field-value">
                  <span>{bank.bankName}</span>
                </div>
              </div>
              <div className="donate-field">
                <span className="donate-field-label">{isUrdu ? 'اکاؤنٹ ٹائٹل' : 'Account Title'}</span>
                <div className="donate-field-value">
                  <span>{bank.accountTitle}</span>
                  <CopyBtn text={bank.accountTitle} />
                </div>
              </div>
              <div className="donate-field donate-field-highlight">
                <span className="donate-field-label">IBAN</span>
                <div className="donate-field-value">
                  <span className="donate-iban">{bank.iban}</span>
                  <CopyBtn text={bank.iban} />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Pay Card */}
          <div className="donate-card-v2 stagger-item">
            <div className="donate-card-v2-header">
              <div className="donate-card-v2-icon">📱</div>
              <div>
                <h3 className="donate-card-v2-title">{d.cards[1].title}</h3>
                <p className="donate-card-v2-desc">{d.cards[1].desc}</p>
              </div>
            </div>
            <div className="donate-field-group">
              {mobilePay.map((entry, i) => (
                <div className="donate-field" key={i}>
                  <span className="donate-field-label">
                    <span className={`mobile-pay-badge mobile-pay-badge-${entry.label.toLowerCase().replace(' ', '')}`}>
                      {entry.label}
                    </span>
                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>{entry.name}</span>
                  </span>
                  <div className="donate-field-value">
                    <span className="donate-phone-number">{entry.number}</span>
                    <CopyBtn text={entry.number} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* International Card */}
          <div className="donate-card-v2 stagger-item donate-card-v2-intl">
            <div className="donate-card-v2-header">
              <div className="donate-card-v2-icon">🌍</div>
              <div>
                <h3 className="donate-card-v2-title">{d.cards[2].title}</h3>
                <p className="donate-card-v2-desc">{d.cards[2].desc}</p>
              </div>
            </div>
            <div className="donate-intl-note">
              <p>{d.intl.note}</p>
              <a href="#contact" className="btn btn-outline btn-sm donate-intl-btn">
                {isUrdu ? 'رابطہ کریں' : 'Contact Us'} →
              </a>
            </div>
          </div>
        </div>

        {/* Unique Donate CTA — opens WhatsApp with a ready message */}
        <div className="donate-cta-wrap reveal reveal-up">
          <a
            href={isUrdu
              ? 'https://wa.me/923034030009?text=' + encodeURIComponent('السلام علیکم، میں حسینی ہومز فاؤنڈیشن کو عطیہ دینا چاہتا ہوں۔')
              : 'https://wa.me/923034030009?text=' + encodeURIComponent('Assalamu Alaikum, I would like to donate to Hussaini Homes Foundation.')}
            target="_blank"
            rel="noopener noreferrer"
            className="donate-mega-btn"
            id="donate-mega-btn"
          >
            <div className="donate-mega-btn-rings" aria-hidden="true">
              <div className="donate-ring donate-ring-1" />
              <div className="donate-ring donate-ring-2" />
              <div className="donate-ring donate-ring-3" />
            </div>
            <div className="donate-mega-btn-inner">
              <span className="donate-mega-heart" aria-hidden="true">♥</span>
              <span className="donate-mega-text">
                {isUrdu ? 'آج ہی عطیہ دیں' : 'Donate Today'}
              </span>
              <span className="donate-mega-sub">
                {isUrdu ? 'ایک بچے کی زندگی بدلیں' : 'Change a child\'s life'}
              </span>
            </div>
          </a>
        </div>

        {/* Hadith quote */}
        <div className="donate-quote reveal reveal-up">
          <span className="donate-quote-mark">{d.quoteMark}</span>
          <p className="donate-quote-text">{d.quote}</p>
          <span className="donate-quote-source">{d.quoteSource}</span>
        </div>
      </div>
    </section>
  );
}
