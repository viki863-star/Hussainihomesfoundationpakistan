import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../LangContext';
import { useTeamData, memberPhoto } from '../teamData';

function TeamAvatar({ src, name }) {
  const [err, setErr] = useState(false);

  if (err) {
    return <div className="team-avatar" aria-hidden="true">{name.charAt(0)}</div>;
  }

  return (
    <img
      src={src}
      alt={name}
      className="team-avatar team-avatar-photo"
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

export default function Team() {
  const { t, isUrdu } = useLang();
  const teamData = useTeamData();
  const team = t.team;
  const officials = teamData.officials;
  const committees = teamData.committees;

  return (
    <section className="section team-section" id="team" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="text-center">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
            {team.eyebrow}
          </div>
          <h2 className="section-title">
            {team.title}
          </h2>
          <p className="section-subtitle">
            {team.subtitle}
          </p>
        </div>

        <div className="team-grid stagger-group">
          {officials.map((off) => (
            <Link to={`/team/${off.id}`} key={off.id} className="team-card stagger-item">
              <TeamAvatar
                src={memberPhoto(off)}
                name={off.name}
              />
              <span className="team-role">{team.roles[off.roleKey]}</span>
              <p className="team-name">{off.name}</p>
              <span className="team-phone">📞 {off.phone}</span>
            </Link>
          ))}
        </div>

        <h3 className="committees-heading">{team.committees}</h3>
        <div className="committees-grid stagger-group">
          {committees.map((com, i) => (
            <div key={i} className="committee-card stagger-item">
              <h4 className="committee-name">{team.committeesNames[com.nameKey]}</h4>
              {com.members.map((m, j) => (
                <Link to={`/team/${m.id}`} key={j} className="committee-member">
                  <span className="committee-member-name">{m.name}</span>
                  <span className="committee-member-phone">{m.phone}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
