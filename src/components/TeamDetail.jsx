import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { useTeamData, memberPhoto } from '../teamData';
import Navbar from './Navbar';

export default function TeamDetail() {
  const { id } = useParams();
  const { t, isUrdu } = useLang();
  const teamData = useTeamData();
  const [photoErr, setPhotoErr] = useState(false);
  const allMembers = [...(teamData.officials || []), ...teamData.committees.flatMap(c => c.members || [])];
  const member = allMembers.find(m => m.id === id);

  if (!member) {
    return (
      <div className="detail-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1>{t.teamDetail.memberNotFound}</h1>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
            {t.teamDetail.backHome}
          </Link>
        </div>
      </div>
    );
  }

  const bio = (member && member.bio && String(member.bio).trim()) || t.teamDetail.bios[member.id];

  return (
    <div className="detail-page" dir={isUrdu ? 'rtl' : 'ltr'}>
      <Navbar activeSection="" />
      <div className="detail-nav">
        <div className="container">
          <Link to="/" className="detail-back">{t.teamDetail.backHome}</Link>
        </div>
      </div>

      <div className="container">
        <div className="detail-content">
          <div className="detail-image-section">
            <div className="detail-avatar">
              {photoErr ? (
                member.name.charAt(0)
              ) : (
                <img
                  src={memberPhoto(member)}
                  alt={member.name}
                  className="detail-avatar-img"
                  loading="lazy"
                  onError={() => setPhotoErr(true)}
                />
              )}
            </div>
            {photoErr && <p className="detail-img-note">{t.teamDetail.photoSoon}</p>}
          </div>

          <div className="detail-info">
            <span className="detail-badge">{t.teamDetail.official}</span>
            <h1 className="detail-name">{member.name}</h1>
            <h2 className="detail-role">{t.team.roles[member.roleKey]}</h2>

            <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="detail-phone">
              📞 {member.phone}
            </a>

            <div className="detail-bio">
              {bio ? (
                <div className="bio-content">
                  {bio.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('"') && paragraph.includes('" —')) {
                      return <blockquote key={i} className="bio-quote">{paragraph}</blockquote>;
                    }
                    return <p key={i}>{paragraph}</p>;
                  })}
                </div>
              ) : (
                <div className="bio-content">
                  <p className="detail-bio-placeholder">
                    {t.teamDetail.detailsSoon(member.name)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
