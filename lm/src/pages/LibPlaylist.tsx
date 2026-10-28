import { useLocation } from 'wouter';
import { Heart, ListMusic, Pencil, Play, Shuffle, Trash2 } from 'lucide-react';
import SongRow from '../components/SongRow';
import Img from '../components/Img';
import { useLib } from '../store/library';
import { usePlayer } from '../store/player';
export default function LibPlaylist({ params }: { params: { pid: string } }) {
  const { pid } = params; const [, nav] = useLocation();
  const lib = useLib(); const playAll = usePlayer((s) => s.playAll);
  const liked = pid === 'liked'; const pl = lib.playlists.find((p) => p.id === pid);
  if (!liked && !pl) return <p className="text-white/60">Playlist tidak ditemukan.</p>;
  const name = liked ? 'Liked Songs' : pl!.name; const items = liked ? lib.liked : pl!.items;
  return (<>
    <div className="flex items-end gap-5 mb-6 mt-2">
      {liked ? <span className="size-32 md:size-44 rounded-[32px] grid place-items-center bg-gradient-to-br from-indigo-500 to-pink-500 shrink-0"><Heart fill="white" size={44} /></span>
        : items[0] ? <Img src={items[0].cover} size={400} className="size-32 md:size-44 rounded-[32px] shrink-0" /> : <span className="size-32 md:size-44 rounded-[32px] tile grid place-items-center shrink-0"><ListMusic size={44} className="text-white/30" /></span>}
      <div className="min-w-0"><h1 className="text-3xl md:text-5xl font-extrabold break-words">{name}</h1><p className="text-white/60 font-bold mt-1">{items.length} lagu</p></div>
    </div>
    <div className="flex flex-wrap gap-2 mb-6">
      <button disabled={!items.length} onClick={() => playAll(items)} className="rounded-full bg-white text-black font-extrabold px-6 py-3 flex items-center gap-2 press disabled:opacity-40"><Play size={18} fill="black" />Putar</button>
      <button disabled={!items.length} onClick={() => playAll(items, true)} className="tile rounded-full font-extrabold px-5 py-3 flex items-center gap-2 press disabled:opacity-40"><Shuffle size={18} />Acak</button>
      {!liked && <>
        <button onClick={() => { const n = prompt('Nama playlist', name); if (n) lib.rename(pid, n); }} aria-label="Ubah nama" className="tile size-12 rounded-full grid place-items-center press"><Pencil size={18} /></button>
        <button onClick={() => { if (confirm(`Hapus playlist "${name}"?`)) { lib.remove(pid); nav('/library'); } }} aria-label="Hapus playlist" className="tile size-12 rounded-full grid place-items-center press text-red-400"><Trash2 size={18} /></button></>}
    </div>
    {!items.length && <p className="text-white/50">Belum ada lagu. Tekan ikon + pada lagu mana saja untuk menambahkan ke sini.</p>}
    <div className="space-y-2">{items.map((it) => <SongRow key={it.id} item={it} list={items} tile onRemove={liked ? undefined : () => lib.removeFrom(pid, it.id)} />)}</div>
  </>);
}
