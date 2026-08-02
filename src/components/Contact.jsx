import { useState } from 'react';
import { useLang } from '../LangContext';

const WHATSAPP_NUMBER = '923034030009';
const EMAIL = 'hussainihomes@gmail.com';

export default function Contact() {
  const { t, isUrdu } = useLang();
  const c = t.contact;
  const [sent, setSent] = useState(false);
  const [mailtoUrl, setMailtoUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = [
      `${c.name}: ${data.get('name')}`,
      `${c.email}: ${data.get('email')}`,
      `${c.phone}: ${data.get('phone') || '—'}`,
      `${c.subject}: ${data.get('subject')}`,
      `${c.message}: ${data.get('message')}`,
    ].join('\n');

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setMailtoUrl(
      `mailto:${EMAIL}?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`
    );
    setSent(true);
  };

  return (
    <section className="section contact-section" id="contact" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="contact-layout">
          {/* Info column */}
          <div className="reveal reveal-left">
            <div className="section-eyebrow contact-info-eyebrow">
              {c.eyebrow}
            </div>
            <h2 className="contact-info-title">
              {c.title1}<br />
              <span className="text-gradient">{c.title2}</span>
            </h2>
            <p className="contact-info-desc">{c.desc}</p>

            <div className="contact-items">
              {c.items.map((item, i) => (
                <div key={i} className="contact-item-card">
                  <div className="contact-item-icon">{item.icon}</div>
                  <div className="contact-item-body">
                    <span className="contact-item-label">{item.label}</span>
                    <span className="contact-item-value">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="map-card">
              <div className="map-card-head">
                <span className="map-card-pin">📍</span>
                <div className="map-card-titles">
                  <strong className="map-card-title">{c.mapTitle}</strong>
                  <span className="map-card-address">{c.mapAddress}</span>
                </div>
              </div>
              <div className="map-embed map-embed-card">
                <iframe
                  title={c.mapTitle}
                  src="https://www.google.com/maps?q=33.748331,70.251645&z=16&output=embed"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <span className="map-pin-marker" aria-hidden="true">📍</span>
              </div>
              <a
                className="map-open-btn"
                href="https://maps.app.goo.gl/94yZYYtk9upQabKY9"
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.mapOpen} ↗
              </a>
            </div>
          </div>

          {/* Form column */}
          <div className="reveal reveal-right">
            <div className="contact-form-wrap">
              <h3 className="contact-form-title">{c.formTitle}</h3>
              {sent ? (
                <div className="contact-form-sent">
                  <div style={{
                    textAlign: 'center', padding: '16px 24px 0',
                    color: 'var(--crimson)', fontWeight: 600, fontSize: '1.1rem',
                  }}>
                    {c.sent}
                  </div>
                  <a
                    href={mailtoUrl}
                    className="btn btn-outline"
                    style={{ marginTop: 20 }}
                  >
                    ✉️ {c.sendEmailFallback}
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cf-name">{c.name}</label>
                      <input id="cf-name" type="text" name="name" placeholder={c.namePh} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cf-email">{c.email}</label>
                      <input id="cf-email" type="email" name="email" placeholder={c.emailPh} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cf-phone">{c.phone}</label>
                      <input id="cf-phone" type="tel" name="phone" placeholder={c.phonePh} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cf-subject">{c.subject}</label>
                      <input id="cf-subject" type="text" name="subject" placeholder={c.subjectPh} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-message">{c.message}</label>
                    <textarea id="cf-message" name="message" placeholder={c.messagePh} required />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-crimson btn-lg"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  >
                    {c.sendBtn}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
