import { useState, useEffect } from 'react';
import { withBase } from './paths';

// Use withBase() so the data file resolves on both Render (root path) and the
// GitHub Pages mirror (sub-path base). Without it admin edits silently fall
// back to defaults on the Pages host.
const CONTENT_URL = withBase('/data/content.json');

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
  theme: {
    crimson:      '#B91C1C',
    crimsonDark:  '#7F1D1D',
    crimsonDeep:  '#450A0A',
    crimsonLight: '#EF4444',
    gold:         '#D97706',
    goldBright:   '#F59E0B',
    goldPale:     '#FEF3C7',
    goldGlow:     '#FBBF24',
    surface:      '#FAF7F7',
    surface2:     '#F3EAEA',
    card:         '#FFFFFF',
    text:         '#1F1717',
    textMuted:    '#6B5555',
    ink:          '#0F0A0A',
    inkMid:       '#1C0D0D',
    accent:       '#FFF5F5',
  },
  sections: [
    { key: 'hero',        label: 'Hero',                 enabled: true },
    { key: 'about',       label: 'About',                enabled: true },
    { key: 'services',    label: 'Services',             enabled: true },
    { key: 'team',        label: 'Team',                 enabled: true },
    { key: 'building',    label: 'Building Progress',    enabled: true },
    { key: 'construction',label: 'Construction Journey', enabled: true },
    { key: 'gallery',     label: 'Gallery',              enabled: true },
    { key: 'stories',     label: 'Success Stories',      enabled: true },
    { key: 'donate',      label: 'Donate',               enabled: true },
    { key: 'contact',     label: 'Contact',              enabled: true },
  ],
  text: { en: {}, ur: {} },
  building: {
    image: '/images/Bulding Pic 2.jpeg',
    bars: [
      { en: 'Ground Floor (Complete)',   ur: 'گراؤنڈ فلور (مکمل)',    target: 100 },
      { en: 'First Floor (Complete)',    ur: 'پہلی منزل (مکمل)',      target: 100 },
      { en: 'Second Floor (Structural)', ur: 'دوسری منزل (ڈھانچہ)',   target: 100 },
      { en: 'Third Floor (Planned)',     ur: 'تیسری منزل (منصوبہ)',   target: 0 },
      { en: 'Interior Finishing',        ur: 'اندرونی تکمیل',         target: 10 },
    ],
    budget: [
      { en: 'Total Budget', ur: 'کل بجٹ',   value: 'PKR 45.5M' },
      { en: 'Invested',     ur: 'سرمایہ کاری', value: 'PKR 13M' },
      { en: 'Monthly Cost', ur: 'ماہانہ خرچ', value: 'PKR 300K' },
    ],
    facilities: {
      en: ['Spacious Dormitories', 'Modern Classrooms', 'Library & Computer Lab', 'Islamic Education Room', 'Dining Hall & Kitchen', 'Admin Offices', 'Outdoor Play Area'],
      ur: ['کشادہ سونے کے کمرے', 'جدید کلاس رومز', 'لائبریری اور کمپیوٹر لیب', 'دینی تعلیم کا کمرہ', 'ڈائننگ ہال اور باورچی خانہ', 'انتظامی دفاتر', 'بیرونی کھیل کا میدان'],
    },
  },
  construction: {
    items: [
      { labelEn: 'Site Preparation',      labelUr: 'سائٹ کی تیاری',       statusEn: 'Completed', statusUr: 'مکمل' },
      { labelEn: 'Foundation',            labelUr: 'فاؤنڈیشن',            statusEn: 'Completed', statusUr: 'مکمل' },
      { labelEn: 'Ground Floor',          labelUr: 'گراؤنڈ فلور',          statusEn: 'Completed', statusUr: 'مکمل' },
      { labelEn: 'First Floor Structure', labelUr: 'پہلی منزل کا ڈھانچہ',  statusEn: 'Completed', statusUr: 'مکمل' },
    ],
  },
  stories: {
    items: [
      {
        titleEn: 'A Family of 31 Children',
        titleUr: '۳۱ بچوں کا ایک خاندان',
        textEn: 'Every child at Hussaini Homes is raised with love, discipline, and a sense of belonging — as members of one family.',
        textUr: 'حسینی ہومز کا ہر بچہ محبت، نظم و ضبط اور اپنائیت کے ساتھ پرورش پاتا ہے — ایک ہی خاندان کے افراد کی طرح۔',
        img: '/images/success-stories/all childern gorup pic.jfif',
      },
      {
        titleEn: 'Study Time',
        titleUr: 'مطالعے کا وقت',
        textEn: 'From early morning classes to evening revision, our children take their education seriously — and it shows.',
        textUr: 'صبح کی کلاسوں سے لے کر شام کے تکرار تک، ہمارے بچے اپنی تعلیم کو سنجیدگی سے لیتے ہیں — اور نتائج بھی نظر آتے ہیں۔',
        img: '/images/success-stories/study/Study time 1.jpeg',
      },
      {
        titleEn: 'Together at the Table',
        titleUr: 'ساتھ میز پر',
        textEn: 'Nutritious meals are served three times a day, shared together so no child ever eats alone.',
        textUr: 'روزانہ تین وقت غذائیت بخش کھانا ساتھ مل کر پیش کیا جاتا ہے تاکہ کوئی بچہ تنہا کھانا نہ کھائے۔',
        img: '/images/success-stories/eating/WhatsApp Image 2026-07-30 at 3.48.03 PM.jpeg',
      },
    ],
  },
};

export function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== 'object') return defaults;
  if (Array.isArray(defaults) && Array.isArray(overrides)) return overrides;
  const result = Array.isArray(defaults) ? [...defaults] : { ...defaults };
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