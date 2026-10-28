import type { Item } from '../../shared/types';
export const thumb = (u?: string, s = 336) => u?.replace(/=w\d+-h\d+/, `=w${s}-h${s}`);
export const fmt = (t: number) => (isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}` : '0:00');
export const isSong = (i?: Item) => i?.type === 'song' || i?.type === 'video';
export const api = async <T,>(p: string): Promise<T> => {
  const r = await fetch('/api/' + p);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? 'Gagal memuat');
  return r.json();
};
export const parseLrc = (s: string) => s.split('\n').map((l) => { const m = /^\[(\d+):(\d+(?:\.\d+)?)\](.*)/.exec(l); return m ? { t: +m[1] * 60 + +m[2], l: m[3].trim() } : null; }).filter(Boolean) as { t: number; l: string }[];
