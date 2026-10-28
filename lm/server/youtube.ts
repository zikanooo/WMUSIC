import { Innertube } from 'youtubei.js';
import type { Item, Section, Detail } from '../shared/types';

let ytp: Promise<Innertube> | null = null;
export const yt = () => (ytp ??= Innertube.create({ location: 'ID', lang: 'id' }));
const txt = (x: any): string | undefined => (typeof x === 'string' ? x : x?.text);
const cover = (t: any) => {
  const a = Array.isArray(t) ? t : t?.contents;
  return (a?.[a.length - 1]?.url as string | undefined)?.replace(/=w\d+-h\d+.*$/, '=w544-h544-l90-rj');
};
function toItem(n: any): Item | null {
  if (!n) return null;
  let t = n.item_type || n.type, id: string | undefined = n.id; const pl = n.endpoint?.payload;
  if (t === 'endpoint' || t === 'unknown' || !id) {
    if (pl?.videoId) { t = 'song'; id = pl.videoId; }
    else if (pl?.playlistId) { t = 'playlist'; id = pl.playlistId; }
    else if (pl?.browseId) { t = pl.browseId.startsWith('MPRE') ? 'album' : pl.browseId.startsWith('UC') ? 'artist' : 'playlist'; id = pl.browseId; }
  }
  if (t === 'library_artist') t = 'artist';
  if (!id || !['song', 'video', 'album', 'playlist', 'artist'].includes(t)) return null;
  if (t === 'playlist' && id.startsWith('VL')) id = id.slice(2);
  const sub = n.artists?.length ? n.artists.map((a: any) => a.name).join(', ') : txt(n.subtitle) ?? txt(n.author?.name) ?? n.author?.name;
  return { id, type: t, title: txt(n.title) ?? n.name ?? '', subtitle: sub, cover: cover(n.thumbnail ?? n.thumbnails) };
}
const items = (a: any[] = []) => a.map(toItem).filter(Boolean) as Item[];
const shelves = (r: any): Section[] =>
  (r?.sections ?? r?.contents ?? []).map((s: any) => ({ title: txt(s.header?.title) ?? txt(s.title) ?? '', sub: txt(s.header?.strapline), items: items(s.contents) })).filter((s: Section) => s.items.length);

const CURATED: [string, string, string, string][] = [
  ['All Time Hits', 'Certified classics', 'all time hits indonesia', 'playlist'],
  ['New & Trending 🔥', 'Suara saat ini', 'lagu indonesia terbaru 2026', 'playlist'],
  ['Indo Indie On Repeat', 'Indie lokal pilihan', 'indo indie playlist', 'playlist'],
  ['Dangdut Klasik', 'Rhoma, Rita Sugiarto & lainnya', 'dangdut klasik', 'playlist'],
  ['Galau Hours', 'Untuk hati yang patah', 'lagu galau indonesia', 'playlist'],
  ['Phonk & Gaming', 'Gas terus', 'phonk 2026', 'playlist'],
  ['Global Hits', 'Lagi viral', 'global top hits 2026', 'playlist'],
  ['Santai & Fokus', 'Teman kerja dan belajar', 'lofi santai indonesia', 'playlist'],
  ['Artis Populer', 'Dengarkan lebih banyak', 'artis indonesia populer', 'artist'],
];
export const music = {
  async home(): Promise<Section[]> {
    const find = async (q: string, type: string) => { try { return shelves(await (await yt()).music.search(q, { type } as any)).flatMap((s) => s.items).slice(0, 14); } catch { return []; } };
    const [feed, ...cur] = await Promise.all([
      (async () => { try { return shelves(await (await yt()).music.getHomeFeed()); } catch { return [] as Section[]; } })(),
      ...CURATED.map(async ([title, sub, q, type]) => ({ title, sub, items: await find(q, type) } as Section)),
    ]);
    const ok = (s: Section) => s.items.length >= 3;
    const quick = feed.find((s) => s.items.filter((i) => i.type === 'song' || i.type === 'video').length >= 4);
    const rest = feed.filter((s) => s !== quick && ok(s));
    const out = [quick && { ...quick, title: 'Quick picks', sub: undefined }, ...cur.slice(0, 2).filter(ok), ...rest.slice(0, 3), ...cur.slice(2).filter(ok), ...rest.slice(3)].filter(Boolean) as Section[];
    if (!out.length) throw new Error('YouTube Music tidak merespons dari server ini');
    return out;
  },
  async explore(): Promise<Item[]> {
    const ex: any = await (await yt()).music.getExplore(); const out: Item[] = [];
    for (const s of ex.sections ?? []) for (const b of s.contents ?? []) {
      const p = b.endpoint?.payload;
      if (b.type === 'MusicNavigationButton' && p?.params) { const c = b.solid_color; out.push({ id: p.params, type: 'mood', title: b.button_text, color: c != null ? '#' + (c & 0xffffff).toString(16).padStart(6, '0') : undefined }); }
    }
    return out;
  },
  async mood(id: string): Promise<Detail> {
    const r: any = await (await yt()).actions.execute('/browse', { browseId: 'FEmusic_moods_and_genres_category', params: id, client: 'YTMUSIC', parse: true });
    const sh = r.contents_memo?.getType?.('MusicCarouselShelf') ?? [];
    return { title: txt(r.header?.title), sections: sh.map((s: any) => ({ title: txt(s.header?.title) ?? '', items: items(s.contents) })).filter((s: Section) => s.items.length) };
  },
  search: async (q: string) => shelves(await (await yt()).music.search(q)),
  async suggest(q: string): Promise<string[]> {
    const r: any[] = await (await yt()).music.getSearchSuggestions(q);
    return r.flatMap((s) => (s.contents ?? []).map((c: any) => c.suggestion?.text)).filter(Boolean).slice(0, 8);
  },
  async playlist(id: string): Promise<Detail> { const p: any = await (await yt()).music.getPlaylist(id); return { title: txt(p.header?.title), subtitle: txt(p.header?.subtitle), cover: cover(p.header?.thumbnails), sections: [{ title: 'Lagu', items: items(p.items) }] }; },
  async album(id: string): Promise<Detail> { const a: any = await (await yt()).music.getAlbum(id); const th = cover(a.header?.thumbnails); return { title: txt(a.header?.title), subtitle: txt(a.header?.subtitle), cover: th, sections: [{ title: 'Lagu', items: items(a.contents).map((i) => ({ ...i, cover: i.cover ?? th })) }] }; },
  async artist(id: string): Promise<Detail> { const a: any = await (await yt()).music.getArtist(id); return { title: txt(a.header?.title), cover: cover(a.header?.thumbnails), sections: shelves(a) }; },
  async plainLyrics(id: string) { try { return txt(((await (await yt()).music.getLyrics(id)) as any)?.description) ?? null; } catch { return null; } },
};
