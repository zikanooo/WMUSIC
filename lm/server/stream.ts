import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { yt } from './youtube.js';
const run = promisify(execFile);
export type Resolved = { url: string; headers: Record<string, string>; mime: string };
const cache = new Map<string, { p: Promise<Resolved>; exp: number }>();
const UA: Record<string, string> = {
  IOS: 'com.google.ios.youtube/19.45.4 (iPhone16,2; U; CPU iOS 18_1_0 like Mac OS X)',
  ANDROID_VR: 'com.google.android.apps.youtube.vr.oculus/1.60.19 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip',
  ANDROID: 'com.google.android.youtube/19.44.38 (Linux; U; Android 11) gzip',
};

// Pastikan URL benar-benar bisa dibaca (bukan 403) SEBELUM dipakai. Kandidat yang mati dilewati, bukan dikirim ke pemutar.
async function probe(r: Resolved): Promise<Resolved> {
  const res = await fetch(r.url, { headers: { ...r.headers, range: 'bytes=0-1' }, signal: AbortSignal.timeout(8000) });
  res.body?.cancel().catch(() => {});
  if (res.status >= 400) throw new Error('URL audio ditolak (' + res.status + ')');
  return r;
}

// 1) yt-dlp. Versi baru WAJIB punya JS runtime untuk memecahkan tantangan YouTube -> kita beri node.
async function viaYtDlp(id: string): Promise<Resolved> {
  const base = ['-j', '--no-playlist', '--no-warnings', '-f', 'ba[ext=m4a]/ba/b', `https://www.youtube.com/watch?v=${id}`];
  const extra: string[] = [];
  if (process.env.YTDLP_COOKIES) extra.push('--cookies', process.env.YTDLP_COOKIES);
  if (process.env.YTDLP_BROWSER) extra.push('--cookies-from-browser', process.env.YTDLP_BROWSER); // mis. chrome / firefox
  const go = (flags: string[]) => run(process.env.YTDLP_PATH || 'yt-dlp', [...flags, ...extra, ...base], { maxBuffer: 20e6, timeout: 30_000 });
  let out;
  try { out = await go(['--js-runtimes', 'node']); }
  catch (e: any) {
    const m = String(e.stderr || e.message);
    if (/no such option/i.test(m)) out = await go([]);
    else if (/challenge|ejs|runtime|signature/i.test(m)) out = await go(['--js-runtimes', 'node', '--remote-components', 'ejs:github']);
    else throw new Error(m.trim().split('\n').pop()?.slice(0, 200));
  }
  const j = JSON.parse(out.stdout);
  if (!j.url) throw new Error('yt-dlp tidak memberi URL langsung');
  return { url: j.url, headers: j.http_headers ?? {}, mime: j.ext === 'webm' ? 'audio/webm' : 'audio/mp4' };
}

// 2) Cadangan: youtubei.js, coba beberapa client sampai ada yang lolos probe.
async function viaInnertube(id: string): Promise<Resolved> {
  const c = await yt(); const errs: string[] = [];
  for (const client of ['ANDROID_VR', 'IOS', 'TV', 'WEB_EMBEDDED', 'MWEB', 'ANDROID']) {
    try {
      const info: any = await c.getBasicInfo(id, { client } as any); let f: any;
      try { f = info.chooseFormat({ type: 'audio', quality: 'best', format: 'mp4' }); } catch { f = info.chooseFormat({ type: 'audio', quality: 'best' }); }
      const url: string = f.url ?? (await f.decipher(c.session.player));
      if (!url) throw new Error('tanpa url');
      return await probe({ url, headers: UA[client] ? { 'user-agent': UA[client] } : {}, mime: String(f.mime_type || 'audio/mp4').split(';')[0] });
    } catch (e: any) { errs.push(`${client}: ${String(e?.message ?? e).slice(0, 60)}`); }
  }
  throw new Error(errs.join(' | '));
}

async function attempt(id: string): Promise<Resolved> {
  const why: string[] = [];
  if (!process.env.VERCEL) {
    try { return await probe(await viaYtDlp(id)); } catch (e: any) { why.push('yt-dlp: ' + e.message); console.warn('[yt-dlp gagal]', id, e.message); }
  }
  try { return await viaInnertube(id); } catch (e: any) { why.push('innertube: ' + e.message); }
  throw new Error(why.join(' || '));
}
export function resolve(id: string, fresh = false): Promise<Resolved> {
  const hit = cache.get(id);
  if (!fresh && hit && hit.exp > Date.now()) return hit.p;
  const p = attempt(id); cache.set(id, { p, exp: Date.now() + 90 * 60_000 });
  p.catch(() => cache.delete(id));
  return p;
}
export const drop = (id: string) => cache.delete(id);
