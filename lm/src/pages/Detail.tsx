import { useQuery } from '@tanstack/react-query';
import { Play, Shuffle } from 'lucide-react';
import { api, isSong } from '../lib/util';
import { usePlayer } from '../store/player';
import Carousel from '../components/Carousel';
import SongRow from '../components/SongRow';
import Img from '../components/Img';
import type { Detail as D } from '../../shared/types';
export default function Detail({ params }: { params: { type: string; id: string } }) {
  const { type, id } = params; const playAll = usePlayer((s) => s.playAll);
  const ok = ['playlist', 'album', 'artist', 'mood'].includes(type);
  const { data, isLoading, error } = useQuery({ queryKey: [type, id], queryFn: () => api<D>(`${type}/${id}`), enabled: ok });
  const songs = data?.sections.flatMap((s) => s.items.filter(isSong)) ?? [];
  if (!ok) return <p>Halaman tidak ditemukan.</p>;
  return (<>
    <div className="flex items-end gap-5 mb-6 mt-2">
      {data?.cover && <Img src={data.cover} size={400} className="size-32 md:size-48 rounded-[32px] shrink-0" />}
      <div className="min-w-0"><h1 className="text-3xl md:text-5xl font-extrabold break-words">{data?.title ?? (isLoading ? '' : 'Tidak ditemukan')}</h1><p className="text-white/60 font-bold mt-1">{data?.subtitle}</p></div>
    </div>
    {songs.length > 0 && <div className="flex gap-2 mb-6">
      <button onClick={() => playAll(songs)} className="rounded-full bg-white text-black font-extrabold px-6 py-3 flex items-center gap-2 press"><Play size={18} fill="black" />Putar</button>
      <button onClick={() => playAll(songs, true)} className="tile rounded-full font-extrabold px-5 py-3 flex items-center gap-2 press"><Shuffle size={18} />Acak</button></div>}
    {isLoading && <div className="h-40 rounded-[28px] shimmer" />}
    {error && <p className="text-white/60">{(error as Error).message}</p>}
    {data?.sections.map((s, i) => isSong(s.items[0])
      ? <section key={i} className="mb-8"><h2 className="text-2xl font-extrabold mb-3">{s.title}</h2><div className="space-y-2">{s.items.map((it) => <SongRow key={it.id} item={it} list={s.items} tile />)}</div></section>
      : <Carousel key={i} i={i} section={s} />)}
  </>);
}
