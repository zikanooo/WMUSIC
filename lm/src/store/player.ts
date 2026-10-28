import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Item } from '../../shared/types';
import { useLib } from './library';
import { isSong } from '../lib/util';

export const audio = new Audio();
audio.preload = 'auto';
type Repeat = 'off' | 'all' | 'one';
interface S {
  queue: Item[]; index: number; playing: boolean; progress: number; duration: number; loading: boolean; error: string | null; open: boolean;
  repeat: Repeat; shuffle: boolean;
  play: (item: Item, queue?: Item[]) => void; playAll: (items: Item[], shuffle?: boolean) => void; jump: (i: number) => void;
  toggle: () => void; next: () => void; prev: () => void; seek: (t: number) => void; toggleShuffle: () => void; cycleRepeat: () => void;
  set: (p: Partial<S>) => void;
}
let fails = 0, retried = '';

export const usePlayer = create<S>()(persist((set, get) => {
  // PENTING: audio.play() dipanggil sinkron di dalam handler klik -> lolos aturan autoplay (iOS/Safari/Chrome).
  const load = (i: number) => {
    const t = get().queue[i]; if (!t) return;
    set({ index: i, playing: true, loading: true, error: null, progress: 0, duration: 0 });
    audio.src = `/api/stream/${t.id}`;
    audio.play().catch((e) => e.name === 'NotAllowedError' && set({ playing: false }));
    useLib.getState().pushRecent(t);
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.subtitle ?? '', artwork: t.cover ? [{ src: t.cover, sizes: '544x544', type: 'image/jpeg' }] : [] });
    const n = get().queue[i + 1]; if (n) setTimeout(() => fetch(`/api/warm/${n.id}`).catch(() => {}), 1500);
  };
  return {
    queue: [], index: -1, playing: false, progress: 0, duration: 0, loading: false, error: null, open: false, repeat: 'off', shuffle: false,
    play: (item, queue) => { const q = (queue ?? [item]).filter(isSong); const i = Math.max(0, q.findIndex((x) => x.id === item.id)); retried = ''; set({ queue: q }); load(i); },
    playAll: (items, shuffle) => { const q = items.filter(isSong); if (!q.length) return; set({ queue: q, shuffle: !!shuffle }); load(shuffle ? Math.floor(Math.random() * q.length) : 0); },
    jump: (i) => { retried = ''; load(i); },
    toggle: () => { const a = audio; if (!a.src) return; if (a.paused) { set({ playing: true }); a.play().catch(() => set({ playing: false })); } else { set({ playing: false }); a.pause(); } },
    next: () => {
      const { queue, index, shuffle, repeat } = get(); if (!queue.length) return;
      if (shuffle && queue.length > 1) { let r = index; while (r === index) r = Math.floor(Math.random() * queue.length); return load(r); }
      if (index < queue.length - 1) return load(index + 1);
      if (repeat === 'all') return load(0);
      set({ playing: false });
    },
    prev: () => { if (audio.currentTime > 3) audio.currentTime = 0; else load(Math.max(0, get().index - 1)); },
    seek: (t) => { audio.currentTime = t; set({ progress: t }); },
    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
    cycleRepeat: () => set((s) => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
    set: (p) => set(p),
  };
}, { name: 'lm-player', partialize: (s) => ({ repeat: s.repeat, shuffle: s.shuffle }) as any }));

const S = usePlayer.getState, set = usePlayer.setState;
audio.addEventListener('timeupdate', () => {
  set({ progress: audio.currentTime });
  if ('mediaSession' in navigator && isFinite(audio.duration)) try { navigator.mediaSession.setPositionState({ duration: audio.duration, position: audio.currentTime, playbackRate: 1 }); } catch {}
});
audio.addEventListener('loadedmetadata', () => set({ duration: audio.duration }));
audio.addEventListener('waiting', () => set({ loading: true }));
audio.addEventListener('canplay', () => set({ loading: false }));
audio.addEventListener('playing', () => { fails = 0; set({ loading: false, playing: true, error: null }); });
audio.addEventListener('ended', () => { const s = S(); if (s.repeat === 'one' || (s.repeat === 'all' && s.queue.length === 1)) { audio.currentTime = 0; audio.play(); } else s.next(); });
audio.addEventListener('error', () => {
  const t = S().queue[S().index]; if (!t) return;
  if (retried !== t.id) { retried = t.id; audio.src = `/api/stream/${t.id}?r=${Date.now()}`; audio.play().catch(() => {}); return; }
  set({ loading: false, error: 'Lagu ini tidak bisa diputar' });
  if (++fails < 3) setTimeout(() => S().next(), 1200); else set({ playing: false });
});
if ('mediaSession' in navigator) {
  const m = navigator.mediaSession;
  m.setActionHandler('play', () => S().toggle()); m.setActionHandler('pause', () => S().toggle());
  m.setActionHandler('nexttrack', () => S().next()); m.setActionHandler('previoustrack', () => S().prev());
  m.setActionHandler('seekto', (d) => d.seekTime != null && S().seek(d.seekTime));
}
addEventListener('keydown', (e) => {
  if ((e.target as HTMLElement)?.closest('input,textarea')) return;
  if (e.code === 'Space') { e.preventDefault(); S().toggle(); }
  else if (e.code === 'ArrowRight') audio.currentTime += 5; else if (e.code === 'ArrowLeft') audio.currentTime -= 5;
});
