import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { api } from '../lib/util';
import { useLib } from '../store/library';
import Header from '../components/Header';
import Carousel, { Skel } from '../components/Carousel';
import type { Item, Section } from '../../shared/types';

const greet = () => { const h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam'; };

export default function Home() {
  const [m, setM] = useState(false); useEffect(() => setM(true), []);
  const home = useQuery({ queryKey: ['home'], queryFn: () => api<Section[]>('home') });
  const moods = useQuery({ queryKey: ['explore'], queryFn: () => api<Item[]>('explore') });
  const recent = useLib((s) => s.recent);
  const secs = home.data ?? [];
  return (<>
    <Header title={m ? greet() : 'Home'} />

    {moods.data && <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 mb-7">
      {moods.data.slice(0, 14).map((c) => <Link key={c.id} href={`/c/mood/${encodeURIComponent(c.id)}`} className="tile shrink-0 rounded-full px-4 py-2 font-bold text-sm flex items-center gap-2 press"><span className="size-2.5 rounded-full" style={{ background: c.color ?? '#fff' }} />{c.title}</Link>)}
    </div>}

    {home.isLoading && [0, 1, 2].map((i) => <Skel key={i} />)}
    {home.error && <div className="tile rounded-[28px] p-5 mb-8">
      <p className="font-bold">Gagal memuat Home</p><p className="text-white/60 text-sm my-1.5">{(home.error as Error).message}</p>
      <button onClick={() => home.refetch()} className="rounded-full bg-white text-black font-bold px-5 py-2 mt-2 flex items-center gap-2 press"><RefreshCw size={16} />Coba lagi</button></div>}

    {m && recent.length > 0 && <Carousel i={0} size={150} section={{ title: 'Terakhir diputar', items: recent.slice(0, 15) }} />}
    {secs.map((s, i) => <Carousel key={s.title + i} i={i + 1} size={i === 0 ? 150 : 180} section={s} />)}
  </>);
}
