import { useState, useEffect } from 'react';

const CONTENT_URL = '/data/content.json';

const DEFAULTS = {
  stats: { children: 31, yearsActive: 7, foundedYear: 2018 },
  donate: {
    bank: {
      bankName: 'Bank Al Habib – Parachinar Branch',
      accountTitle: 'Hussaini Homes Foundation',
      iban: 'PK05BAHL2018007800509701',
    },
    mobilePay: [
      { label: 'JazzCash',  number: '0307 5905907', name: 'Sayed Ijaz' },
      { label: 'EasyPaisa', number: '0303 4030009', name: 'Iftikhar' },
      { label: 'JazzCash',  number: '0303 8189466', name: 'Talat Hussain' },
    ],
  },
  contact: {
    whatsapp: '923034030009',
    phone: '+92 303 4030009',
    email: 'hussainihomesfoundation@gmail.com',
    address: 'Parachinar, Kurram, KPK, Pakistan',
  },
  footer: {
    facebook: 'https://www.facebook.com/Hussainihome',
    whatsapp: 'https://wa.me/923034030009',
    youtube: '#',
    instagram: '#',
  },
};

function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== 'object') return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (
      overrides[key] &&
      typeof overrides[key] === 'object' &&
      !Array.isArray(overrides[key]) &&
      defaults[key] &&
      typeof defaults[key] === 'object' &&
      !Array.isArray(defaults[key])
    ) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else if (overrides[key] !== undefined && overrides[key] !== null && overrides[key] !== '') {
      result[key] = overrides[key];
    }
  }
  return result;
}

let _cached = null;
let _listeners = [];

function notifyListeners() {
  _listeners.forEach(fn => fn(_cached));
}

export async function fetchContent() {
  try {
    const r = await fetch(`${CONTENT_URL}?t=${Date.now()}`);
    if (!r.ok) throw new Error('not found');
    const json = await r.json();
    _cached = deepMerge(DEFAULTS, json);
  } catch {
    _cached = DEFAULTS;
  }
  notifyListeners();
  return _cached;
}

export function getContent() {
  return _cached || DEFAULTS;
}

export function useContent() {
  const [content, setContent] = useState(_cached || DEFAULTS);

  useEffect(() => {
    _listeners.push(setContent);
    if (!_cached) {
      fetchContent();
    }
    return () => {
      _listeners = _listeners.filter(fn => fn !== setContent);
    };
  }, []);

  return content;
}
