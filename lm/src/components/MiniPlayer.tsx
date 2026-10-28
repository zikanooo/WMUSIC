import { Play, Pause, SkipForward, Loader2 } from 'lucide-react';
import { usePlayer } from '../store/player';
import { useDominant } from '../lib/useDominant';
import { thumb } from '../lib/util';
const Bar = () => { const p = usePlayer((s) => s.progress), d = usePlayer((s) => s.duration); return <span className="block h-full bg-white" style={{ width: `${d ? (p / d) * 100 : 0}%` }} />; };
export default function MiniPlayer() {
  const cur = usePlayer((s) => s.queue[s.index]); const open = usePlayer((s) => s.open);
  const playing = usePlayer((s) => s.playing), loading = usePlayer((s) => s.loading), error = usePlayer((s) => s.error);
  const toggle = usePlayer((s) => s.toggle), next = usePlayer((s) => s.next), set = usePlayer((s) => s.set);
  const rgb = useDominant(cur?.cover);
  if (!cur) return null;
  return (
    <div className={`fixed z-40 inset-x-4 md:left-[17rem] md:right-4 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+5.25rem)] md:bottom-4 transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      {error && <div className="glass rounded-full px-4 py-2 text-sm font-bold mb-2 text-center">{error}</div>}
      <div role="button" tabIndex={0} onClick={() => set({ open: true })} onKeyDown={(e) => e.key === 'Enter' && set({ open: true })}
        className="rounded-full p-2 pr-3 flex items-center gap-3 relative overflow-hidden cursor-pointer border border-white/15 backdrop-blur-2xl shadow-2xl transition-[background] duration-700"
        style={{ background: `linear-gradient(90deg, rgba(${rgb},.65), rgba(${rgb},.22))` }}>
        <img src={thumb(cur.cover, 112)} alt="" className={`size-12 rounded-[14px] object-cover`} />
        <div className="min-w-0 flex-1"><p className="font-bold truncate">{cur.title}</p><p className="text-sm text-white/70 truncate">{cur.subtitle}</p></div>
        <button onClick={(e) => { e.stopPropagation(); toggle(); }} aria-label={playing ? 'Jeda' : 'Putar'} className="size-11 rounded-full bg-white text-black grid place-items-center press">
          {loading && playing ? <Loader2 size={20} className="animate-spin" /> : playing ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Berikutnya" className="size-10 grid place-items-center press"><SkipForward size={22} fill="white" /></button>
        <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-white/20"><Bar /></span>
      </div>
    </div>
  );
}
