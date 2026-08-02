export const BASE = import.meta.env.BASE_URL;

export function withBase(p) {
  if (!p) return p;
  if (p.startsWith('http') || p.startsWith('#')) return p;
  return BASE.replace(/\/$/, '') + p;
}
