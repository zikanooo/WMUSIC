import { Link } from 'wouter';
import { Heart, ListMusic, Plus } from 'lucide-react';
import Header from '../components/Header';
import SongRow from '../components/SongRow';
import Img from '../components/Img';
import { useLib, useSheet } from '../store/library';
export default function Library() {
  const { playlists, liked, recent, clearRecent } = useLib(); const show = useSheet((s) => s.show);
  return (<>
    <Header title="Library" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <Link href="/library/liked" className="rise relative h-36 rounded-[28px] p-4 bg-gradient-to-br from-indigo-500 to-pink-500 flex flex-col justify-between press"><Heart fill="white" /><div><p className="font-extrabold text-lg">Liked Songs</p><p className="text-white/80 text-sm font-bold">{liked.length} lagu</p></div></Link>
      <button onClick={() => show()} className="rise tile h-36 rounded-[28px] p-4 flex flex-col justify-between text-left press" style={{ ['--i' as any]: 1 }}><Plus /><p className="font-extrabold text-lg">Buat playlist</p></button>
      {playlists.map((p, i) => (
        <Link key={p.id} href={`/library/${p.id}`} className="rise relative h-36 rounded-[28px] overflow-hidden p-4 flex flex-col justify-end press" style={{ ['--i' as any]: Math.min(i + 2, 8) }}>
          {p.items[0] ? <Img src={p.items[0].cover} size={300} className="absolute inset-0 size-full" /> : <span className="absolute inset-0 tile grid place-items-center"><ListMusic className="text-white/30" size={40} /></span>}
          <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <span className="relative"><p className="font-extrabold truncate">{p.name}</p><p className="text-white/70 text-sm font-bold">{p.items.length} lagu</p></span>
        </Link>))}
    </div>
    {recent.length > 0 && <section>
      <div className="flex items-center justify-between mb-3"><h2 className="text-2xl font-extrabold">Riwayat</h2><button onClick={clearRecent} className="text-sm font-bold text-white/60 press">Hapus</button></div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">{recent.slice(0, 20).map((it) => <SongRow key={it.id} item={it} list={recent} tile />)}</div>
    </section>}
  </>);
}
