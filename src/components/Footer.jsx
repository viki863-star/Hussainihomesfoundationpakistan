import { useLang } from '../LangContext';
import { useSiteImages } from '../siteImages';

export default function Footer() {
  const { t, isUrdu } = useLang();
  const imgs = useSiteImages();
  const f = t.footer;
  const c = t.contact;

  const quickLinks = [
    { href: '#home', label: f.links.home },
    { href: '#about', label: f.links.about },
    { href: '#services', label: f.links.services },
    { href: '#building', label: f.links.building },
    { href: '#gallery', label: f.links.gallery },
  ];

  const supportLinks = [
    { href: '#donate', label: f.supportLinks.donate },
    { href: '#donate', label: f.supportLinks.sadaqah },
    { href: '#donate', label: f.supportLinks.sponsor },
    { href: '#contact', label: f.supportLinks.volunteer },
  ];

  const contactRows = [
    { href: '#contact', label: c.items[0].value },
    { href: 'tel:+923034030009', label: c.items[1].value },
    { href: 'mailto:hussainihomes@gmail.com', label: c.items[2].value },
    { href: '#contact', label: c.items[3].value },
  ];

  return (
    <footer className="footer" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="footer-bg" aria-hidden="true" />
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <h3>
              <img src={imgs.logo} alt="Hussaini Homes logo" className="footer-logo" />
              Hussaini Homes
            </h3>
            <p>{f.desc}</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="https://wa.me/923034030009" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">💬</a>
              <a href="#" aria-label="YouTube">▶️</a>
              <a href="#" aria-label="Instagram">📸</a>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>{f.quickLinks}</h4>
            <ul className="footer-links">
              {quickLinks.map((l, i) => (
                <li key={i}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4>{f.support}</h4>
            <ul className="footer-links">
              {supportLinks.map((l, i) => (
                <li key={i}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>{f.contactLabel}</h4>
            <ul className="footer-links">
              {contactRows.map((l, i) => (
                <li key={i}><a href={l.href}>{l.label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>{f.copyright}</span>
          <div className="footer-bottom-right">
            <a href="/admin" className="footer-admin-link">Admin</a>
            {f.madeWith} <span className="footer-bottom-heart">❤</span> {f.forChildren}
          </div>
        </div>
      </div>
    </footer>
  );
}
