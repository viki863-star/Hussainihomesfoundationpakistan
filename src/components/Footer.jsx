import { useLang } from '../LangContext';
import { useContent } from '../useContent';
import { useSiteImages } from '../siteImages';
import { withBase } from '../paths';

export default function Footer() {
  const { t, isUrdu } = useLang();
  const imgs = useSiteImages();
  const content = useContent();
  const f = t.footer;
  const c = t.contact;

  // Social links are admin-editable via content.json (footer.*).
  // Only render links that actually point somewhere (#/empty placeholders
  // are dropped so no dead buttons are shown).
  const socials = (content && content.footer) || {};
  const socialItems = [
    { href: socials.facebook, label: 'Facebook', glyph: '📘' },
    { href: socials.whatsapp, label: 'WhatsApp', glyph: '💬' },
    { href: socials.youtube, label: 'YouTube', glyph: '▶️' },
    { href: socials.instagram, label: 'Instagram', glyph: '📸' },
  ].filter(s => s.href && s.href !== '#');

  const quickLinks = [
    { href: '#home', label: f.links.home },
    { href: '#about', label: f.links.about },
    { href: '#services', label: f.links.services },
    { href: '#building', label: f.links.building },
    { href: '#gallery', label: f.links.gallery },
    { href: withBase('/admin'), label: 'Admin' },
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
    { href: '#contact', label: c.items[2].value },
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
              {socialItems.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>{s.glyph}</a>
              ))}
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
            <a href={withBase('/admin')} className="footer-admin-link">Admin</a>
            {f.madeWith} <span className="footer-bottom-heart">❤</span> {f.forChildren}
          </div>
        </div>
      </div>
    </footer>
  );
}
