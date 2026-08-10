import { useState, useEffect } from 'react';
import { withBase } from './paths';

export const SITE_IMAGE_DEFAULTS = {
  heroBuilding: withBase('/images/Bulding Pic 2.jpeg'),
  aboutBuilding: withBase('/images/building-night.jpg'),
  constructionBegin: withBase('/images/construction-beginning.webp'),
  constructionToday: withBase('/images/construction-today.webp'),
  constructionPoster: withBase('/images/construction-journey-poster.webp'),
  logo: withBase('/images/ELOGO.png'),
};

let cache = null;

async function fetchSiteImages() {
  if (cache) return cache;
  try {
    const r = await fetch(withBase('/data/site-images.json'));
    if (!r.ok) throw new Error('not ok');
    const data = await r.json();
    const merged = { ...SITE_IMAGE_DEFAULTS };
    Object.keys(data).forEach(k => { if (typeof data[k] === 'string') merged[k] = withBase(data[k]); });
    cache = merged;
  } catch {
    cache = SITE_IMAGE_DEFAULTS;
  }
  return cache;
}

export function useSiteImages() {
  const [imgs, setImgs] = useState(SITE_IMAGE_DEFAULTS);
  useEffect(() => {
    let mounted = true;
    fetchSiteImages().then(d => { if (mounted) setImgs(d); });
    return () => { mounted = false; };
  }, []);
  return imgs;
}
