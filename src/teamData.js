import { useState, useEffect } from 'react';
import { withBase } from './paths';

export const TEAM_DEFAULTS = {
  officials: [
    { id: 'chairman',               roleKey: 'chairman',               name: 'Iftikhar Hussain Ifti', phone: '0303 4030009', photo: withBase('/images/team/Chairman.png') },
    { id: 'vice-chairman',          roleKey: 'viceChairman',           name: 'Agha Jawhar Hussain',   phone: '0306 8083264' },
    { id: 'general-secretary',      roleKey: 'generalSecretary',       name: 'Arif Hussain',          phone: '0302 9247475' },
    { id: 'finance-secretary',      roleKey: 'financeSecretary',       name: 'Sayed Ijaz Hussain',    phone: '0302 5905907' },
    { id: 'information-secretary',  roleKey: 'informationSecretary',   name: 'Wajid Hussain',         phone: '0306 9552207' },
    { id: 'broadcasting-secretary', roleKey: 'broadcastingSecretary',  name: 'Sayed Javid Hussain',   phone: '0306 9071292' },
    { id: 'counselor',              roleKey: 'counselor',              name: 'Talat Hussain',         phone: '0303 8189466' },
  ],
  committees: [
    { nameKey: 'education', members: [{ id: 'education-murtaza', name: 'Sayed Murtaza Hussain', phone: '0308 8797150' }] },
    {
      nameKey: 'accountability',
      members: [
        { id: 'accountability-khan',   name: 'M. Khan Sir',      phone: '0302 8871770' },
        { id: 'accountability-shaban', name: 'Shaban Hussain Sir', phone: '0305 9276546' },
      ],
    },
    {
      nameKey: 'health',
      members: [
        { id: 'health-ashiq', name: 'Dr. Ashiq Hussain', phone: '0302 9090206' },
        { id: 'health-hamid', name: 'Dr. Hamid Hussain', phone: '0300 0560639' },
      ],
    },
    {
      nameKey: 'audit',
      members: [
        { id: 'audit-shujaat', name: 'Shujaat Hussain Sir',     phone: '0300 0818685' },
        { id: 'audit-naqi',    name: 'Sayed Muhammad Naqi Sir', phone: '0307 5746157' },
      ],
    },
  ],
};

let cache = null;

async function fetchTeam() {
  if (cache) return cache;
  try {
    const r = await fetch(withBase('/data/team.json'));
    if (!r.ok) throw new Error('not ok');
    const data = await r.json();
    cache = {
      officials: Array.isArray(data.officials) && data.officials.length ? data.officials : TEAM_DEFAULTS.officials,
      committees: Array.isArray(data.committees) && data.committees.length ? data.committees : TEAM_DEFAULTS.committees,
    };
  } catch {
    cache = TEAM_DEFAULTS;
  }
  return cache;
}

export function useTeamData() {
  const [team, setTeam] = useState(TEAM_DEFAULTS);
  useEffect(() => {
    let mounted = true;
    fetchTeam().then(d => { if (mounted) setTeam(d); });
    return () => { mounted = false; };
  }, []);
  return team;
}

export function memberPhoto(member) {
  const p = member && member.photo;
  if (!p) return withBase(`/images/team/${member.id}.png`);
  return withBase(p.startsWith('/') ? p : `/images/team/${p}`);
}
