import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Item } from '../../shared/types';
export type Playlist = { id: string; name: string; items: Item[] };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

interface L {
  liked: Item[]; playlists: Playlist[]; recent: Item[];
  toggleLike: (i: Item) => void; pushRecent: (i: Item) => void; clearRecent: () => void;
  create: (name: string, item?: Item) => string; rename: (id: string, name: string) => void; remove: (id: string) => void;
  addTo: (pid: string, i: Item) => void; removeFrom: (pid: string, iid: string) => void;
}
export const useLib = create<L>()(persist((set) => ({
  liked: [], playlists: [], recent: [],
  toggleLike: (i) => set((s) => ({ liked: s.liked.some((x) => x.id === i.id) ? s.liked.filter((x) => x.id !== i.id) : [i, ...s.liked] })),
  pushRecent: (i) => set((s) => ({ recent: [i, ...s.recent.filter((x) => x.id !== i.id)].slice(0, 30) })),
  clearRecent: () => set({ recent: [] }),
  create: (name, item) => { const id = uid(); set((s) => ({ playlists: [{ id, name: name.trim() || 'Playlist baru', items: item ? [item] : [] }, ...s.playlists] })); return id; },
  rename: (id, name) => set((s) => ({ playlists: s.playlists.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)) })),
  remove: (id) => set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),
  addTo: (pid, i) => set((s) => ({ playlists: s.playlists.map((p) => (p.id === pid && !p.items.some((x) => x.id === i.id) ? { ...p, items: [...p.items, i] } : p)) })),
  removeFrom: (pid, iid) => set((s) => ({ playlists: s.playlists.map((p) => (p.id === pid ? { ...p, items: p.items.filter((x) => x.id !== iid) } : p)) })),
}), { name: 'lm-library' }));

/** Sheet "Tambah ke playlist" / "Playlist baru" */
export const useSheet = create<{ open: boolean; item?: Item; show: (item?: Item) => void; hide: () => void }>((set) => ({
  open: false, show: (item) => set({ open: true, item }), hide: () => set({ open: false }),
}));
