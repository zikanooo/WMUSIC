import express from 'express';
import path from 'node:path';
import { Readable } from 'node:stream';
import { music } from './youtube.js';
import { resolve, drop } from './stream.js';

const app = express();
const store = new Map<string, { v: unknown; exp: number }>();
const cached = async <T,>(k: string, ttl: number, fn: () => Promise<T>): Promise<T> => {
  const h = store.get(k); if (h && h.exp > Date.now()) return h.v as T;
  const v = await fn(); store.set(k, { v, exp: Date.now() + ttl * 1000 });
  if (store.size > 500) store.delete(store.keys().next().value as string);
  return v;
};
const h = (fn: (req: express.Request) => Promise<unknown>) => async (req: express.Request, res: express.Response) => {
  try { res.set('Cache-Control', 'private, max-age=60'); res.json(await fn(req)); } catch (e: any) { res.status(502).json({ error: e?.message ?? 'error' }); }
};
const CHUNK = 3 * 1024 * 1024; // potong per 3MB: aman untuk batas durasi serverless & seek cepat
const q = (r: express.Request) => String(r.query.q ?? '');

app.get('/api/home', h(() => cached('home', 300, music.home)));
app.get('/api/explore', h(() => cached('explore', 3600, music.explore)));
app.get('/api/search', h((r) => cached('s' + q(r), 300, () => music.search(q(r)))));
app.get('/api/suggest', h((r) => cached('g' + q(r), 300, () => music.suggest(q(r)))));
for (const k of ['mood', 'playlist', 'album', 'artist'] as const)
  app.get(`/api/${k}/:id`, h((r) => cached(k + r.params.id, 600, () => music[k](r.params.id))));

// Lirik: synced dari LRCLIB, cadangan teks dari YouTube Music
app.get('/api/lyrics/:id', h((r) => cached('l' + r.params.id, 86400, async () => {
  const title = String(r.query.title ?? ''), artist = String(r.query.artist ?? '');
  try {
    const l: any[] = await (await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`)).json();
    const hit = l.find((x) => x.syncedLyrics) ?? l[0];
    if (hit?.syncedLyrics || hit?.plainLyrics) return { synced: hit.syncedLyrics ?? null, text: hit.plainLyrics ?? null };
  } catch {}
  return { synced: null, text: await music.plainLyrics(r.params.id) };
})));

app.get('/api/warm/:id', h(async (r) => { await resolve(r.params.id); return { ok: true }; }));

// Proxy audio + HTTP Range (seek). Coba ulang sekali dengan URL baru bila ditolak upstream.
app.get('/api/stream/:id', async (req, res) => {
  const id = req.params.id; let last: any;
  for (let i = 0; i < 2; i++) {
    try {
      const s = await resolve(id, i > 0);
      const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
      const st = m?.[1] ? +m[1] : 0, en = Math.min(m?.[2] ? +m[2] : Infinity, st + CHUNK - 1);
      const ac = new AbortController(); res.on('close', () => ac.abort());
      const up = await fetch(s.url, { headers: { ...s.headers, range: `bytes=${st}-${en}` }, signal: ac.signal });
      if (up.status >= 400 || !up.body) { drop(id); last = new Error('upstream ' + up.status); continue; }
      res.status(up.status);
      for (const k of ['content-length', 'content-range']) { const v = up.headers.get(k); if (v) res.setHeader(k, v); }
      res.setHeader('Content-Type', s.mime); res.setHeader('Accept-Ranges', 'bytes'); res.setHeader('Cache-Control', 'private, max-age=3600');
      Readable.fromWeb(up.body as any).on('error', () => res.end()).pipe(res);
      return;
    } catch (e) { last = e; drop(id); }
  }
  console.error('[stream gagal]', id, last?.message);
  if (!res.headersSent) res.status(502).json({ error: last?.message ?? 'stream gagal' });
});

if (process.argv.includes('--prod')) {
  app.use(express.static('dist', { maxAge: '1h' }));
  app.get('*', (_, res) => res.sendFile(path.resolve('dist/index.html')));
}
const PORT = +(process.env.PORT ?? 3001);
if (!process.env.VERCEL) app.listen(PORT, () => console.log(`Liquid Music API :${PORT}`));
export default app;
