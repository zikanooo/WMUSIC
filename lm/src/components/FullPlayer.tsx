import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, Loader2, Heart, ListPlus } from 'lucide-react';
import { usePlayer, audio } from '../store/player';
import { useLib, useSheet } from '../store/library';
import { useDominant } from '../lib/useDominant';
import { api, fmt, parseLrc, thumb } from '../lib/util';

const tabs = [['cover', 'Pemutar'], ['lyrics', 'Lirik'], ['queue', 'Antrean']] as const;

function Seek() {
  const p = usePlayer((s) => s.progress), d = usePlayer((s) => s.duration), seek = usePlayer((s) => s.seek);
  return (<>
    <input aria-label="Posisi lagu" type="range" className="seek mt-4" min={0} max={d || 1} step={0.5} value={p} style={{ ['--p' as any]: `${d ? (p / d) * 100 : 0}%` }} onChange={(e) => seek(+e.target.value)} />
    <div className="flex justify-between text-xs text-white/60 font-bold mt-2"><span>{fmt(p)}</span><span>{fmt(d)}</span></div>
  </>);
}
function Lyrics({ id, title, artist }: { id: string; title: string; artist?: string }) {
  const q = useQuery({ queryKey: ['lyr', id], queryFn: () => api<{ synced: string | null; text: string | null }>(`lyrics/${id}?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist ?? '')}`) });
  const lines = useMemo(() => (q.data?.synced ? parseLrc(q.data.synced) : []), [q.data]);
  const p = usePlayer((s) => s.progress);
  let a = -1; for (let i = 0; i < lines.length && lines[i].t <= p + 0.2; i++) a = i;
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { box.current?.querySelector<HTMLElement>('[data-a="1"]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [a]);
  if (q.isLoading) return <p className="text-white/60 font-bold">Memuat lirik…</p>;
  if (lines.length) return <div ref={box} className="size-full overflow-y-auto no-scrollbar py-[30%]">{lines.map((l, i) => <p key={i} data-a={i === a ? 1 : 0} className={`text-2xl font-extrabold leading-snug py-1.5 transition-all duration-300 origin-left ${i === a ? 'text-white scale-100' : 'text-white/30 scale-95'}`}>{l.l || '♪'}</p>)}</div>;
  return <div className="size-full overflow-y-auto no-scrollbar text-xl font-bold leading-relaxed whitespace-pre-line">{q.data?.text ?? <span className="text-white/50">Lirik belum tersedia untuk lagu ini.</span>}</div>;
}

export default function FullPlayer() {
  const cur = usePlayer((s) => s.queue[s.index]); const queue = usePlayer((s) => s.queue), index = usePlayer((s) => s.index);
  const open = usePlayer((s) => s.open), playing = usePlayer((s) => s.playing), loading = usePlayer((s) => s.loading);
  const shuffle = usePlayer((s) => s.shuffle), repeat = usePlayer((s) => s.repeat);
  const { toggle, next, prev, toggleShuffle, cycleRepeat, jump, set } = usePlayer.getState();
  const liked = useLib((s) => (cur ? s.liked.some((x) => x.id === cur.id) : false)); const toggleLike = useLib((s) => s.toggleLike); const show = useSheet((s) => s.show);
  const rgb = useDominant(cur?.cover);
  const [tab, setTab] = useState<'cover' | 'lyrics' | 'queue'>('cover');
  const [dy, setDy] = useState(0); const y0 = useRef<number | null>(null);
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  if (!cur) return null;
  const close = () => set({ open: false });
  const drag = {
    onPointerDown: (e: React.PointerEvent) => { y0.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); },
    onPointerMove: (e: React.PointerEvent) => { if (y0.current != null) setDy(Math.max(0, e.clientY - y0.current)); },
    onPointerUp: () => { if (dy > 130) close(); setDy(0); y0.current = null; },
  };
  return (
    <div aria-hidden={!open} className="fixed inset-0 z-50 bg-black overflow-hidden will-change-transform"
      style={{ transform: `translateY(${open ? dy : window.innerHeight}px)`, visibility: open || dy ? 'visible' : 'hidden', transition: y0.current != null ? 'none' : `transform .5s cubic-bezier(.32,.72,0,1), visibility 0s linear ${open ? '0s' : '.5s'}` }}>
      <div className="absolute inset-0 transition-[background] duration-700" style={{ background: `radial-gradient(130% 75% at 50% 0%, rgba(${rgb},.9), #000 78%)` }} />
      <div className="relative mx-auto max-w-md md:max-w-lg h-full flex flex-col px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div {...drag} style={{ touchAction: 'none' }} className="flex items-center justify-between py-2 cursor-grab">
          <button onPointerDown={(e) => e.stopPropagation()} onClick={close} aria-label="Tutup" className="glass size-10 rounded-full grid place-items-center press"><ChevronDown /></button>
          <div className="glass rounded-full p-1 flex">
            {tabs.map(([k, l]) => <button key={k} onPointerDown={(e) => e.stopPropagation()} onClick={() => setTab(k)} className={`px-3.5 py-1.5 text-sm font-bold rounded-full transition-colors duration-300 ${tab === k ? 'bg-white/20' : 'text-white/70'}`}>{l}</button>)}
          </div>
          <span className="size-10" />
        </div>

        <div className="flex-1 min-h-0 flex items-center justify-center py-3" {...(tab === 'cover' ? drag : {})} style={tab === 'cover' ? { touchAction: 'none' } : undefined}>
          {tab === 'cover' && <img key={cur.id} src={thumb(cur.cover, 544)} alt="" className={`w-full max-h-full aspect-square object-cover rounded-[36px] shadow-[0_30px_80px_rgba(0,0,0,.6)] transition-transform duration-500 ease-[cubic-bezier(.3,1.4,.5,1)] ${playing ? 'scale-100' : 'scale-[.86]'}`} />}
          {tab === 'lyrics' && open && <Lyrics id={cur.id} title={cur.title} artist={cur.subtitle} />}
          {tab === 'queue' && <div className="size-full overflow-y-auto no-scrollbar space-y-1">{queue.map((q, i) => (
            <button key={q.id + i} onClick={() => jump(i)} className={`w-full flex items-center gap-3 p-2 rounded-2xl text-left transition-colors ${i === index ? 'bg-white/15' : ''}`}>
              <img src={thumb(q.cover, 112)} alt="" loading="lazy" className="size-12 rounded-xl object-cover" /><div className="min-w-0"><p className="font-bold truncate">{q.title}</p><p className="text-sm text-white/60 truncate">{q.subtitle}</p></div>
            </button>))}</div>}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1"><p className="text-2xl font-extrabold truncate">{cur.title}</p><p className="text-white/60 truncate">{cur.subtitle}</p></div>
            <button onClick={() => toggleLike(cur)} aria-label="Suka" className="size-11 glass rounded-full grid place-items-center press"><Heart size={20} className={liked ? 'text-pink-500' : ''} fill={liked ? 'currentColor' : 'none'} /></button>
            <button onClick={() => show(cur)} aria-label="Tambah ke playlist" className="size-11 glass rounded-full grid place-items-center press"><ListPlus size={20} /></button>
          </div>
          <Seek />
          <div className="flex items-center justify-between mt-3">
            <button onClick={toggleShuffle} aria-label="Acak" className={`size-11 grid place-items-center press ${shuffle ? '' : 'text-white/40'}`}><Shuffle size={22} /></button>
            <button onClick={prev} aria-label="Sebelumnya" className="press"><SkipBack size={34} fill="white" /></button>
            <button onClick={toggle} aria-label={playing ? 'Jeda' : 'Putar'} className="size-20 rounded-full bg-white text-black grid place-items-center press">
              {loading && playing ? <Loader2 size={34} className="animate-spin" /> : playing ? <Pause size={36} fill="black" /> : <Play size={36} fill="black" className="ml-1" />}
            </button>
            <button onClick={next} aria-label="Berikutnya" className="press"><SkipForward size={34} fill="white" /></button>
            <button onClick={cycleRepeat} aria-label="Ulangi" className={`size-11 grid place-items-center press ${repeat !== 'off' ? '' : 'text-white/40'}`}><RepeatIcon size={22} /></button>
          </div>
          <div className="flex items-center gap-3 mt-5"><Volume2 size={18} className="text-white/60" />
            <input aria-label="Volume" type="range" className="seek" min={0} max={1} step={0.01} defaultValue={audio.volume} style={{ ['--p' as any]: `${audio.volume * 100}%` }} onChange={(e) => { audio.volume = +e.target.value; e.currentTarget.style.setProperty('--p', `${+e.target.value * 100}%`); }} />
          </div>
        </div>
      </div>
    </div>
  );
}
