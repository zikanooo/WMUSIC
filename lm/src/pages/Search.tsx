import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SI } from 'lucide-react';
import { api } from '../lib/util';
import Header from '../components/Header';
import Carousel from '../components/Carousel';
import type { Section } from '../../shared/types';
export default function Search() {
  const [q, setQ] = useState(''), [dq, setDq] = useState(''), [go, setGo] = useState('');
  useEffect(() => { const t = setTimeout(() => setDq(q), 250); return () => clearTimeout(t); }, [q]);
  const sug = useQuery({ queryKey: ['sg', dq], queryFn: () => api<string[]>(`suggest?q=${encodeURIComponent(dq)}`), enabled: dq.length > 1 && !go });
  const res = useQuery({ queryKey: ['s', go], queryFn: () => api<Section[]>(`search?q=${encodeURIComponent(go)}`), enabled: !!go });
  const submit = (s: string) => { setQ(s); setGo(s); };
  return (<>
    <Header title="Cari" />
    <div className="glass rounded-full flex items-center gap-3 px-5 h-14 mb-6"><SI size={20} className="text-white/60" />
      <input autoFocus value={q} onChange={(e) => { setQ(e.target.value); setGo(''); }} onKeyDown={(e) => e.key === 'Enter' && submit(q)} placeholder="Lagu, artis, album, playlist" className="bg-transparent outline-none flex-1 font-bold placeholder:text-white/40" /></div>
    {!go && sug.data?.map((s) => <button key={s} onClick={() => submit(s)} className="block w-full text-left py-3 px-2 font-bold border-b border-white/10">{s}</button>)}
    {res.isLoading && <p className="text-white/50 font-bold">Mencari…</p>}
    {res.data?.map((s, i) => <Carousel key={i} i={i} section={s} />)}
  </>);
}
