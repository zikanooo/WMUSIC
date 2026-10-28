import { useState } from 'react';
import { Check, Plus, ListMusic } from 'lucide-react';
import { useLib, useSheet } from '../store/library';
import Img from './Img';
export default function PlaylistSheet() {
  const { item, hide } = useSheet(); const { playlists, create, addTo } = useLib();
  const [name, setName] = useState('');
  const add = (pid: string) => { if (item) addTo(pid, item); hide(); };
  const make = () => { const id = create(name || 'Playlist baru', item); setName(''); hide(); return id; };
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center" onClick={hide}>
      <div className="absolute inset-0 bg-black/60 animate-[rise_.25s_both]" />
      <div onClick={(e) => e.stopPropagation()} className="glass relative w-full max-w-md rounded-t-[36px] md:rounded-[36px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] animate-[rise_.35s_cubic-bezier(.2,.8,.2,1)_both] bg-neutral-900/80">
        <h3 className="text-xl font-extrabold mb-1">{item ? 'Tambah ke playlist' : 'Playlist baru'}</h3>
        {item && <p className="text-white/50 text-sm truncate mb-4">{item.title}</p>}
        <div className="flex gap-2 mb-3">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && make()} autoFocus={!item} placeholder="Nama playlist baru" className="tile flex-1 min-w-0 rounded-full px-5 h-12 outline-none font-bold placeholder:text-white/40" />
          <button onClick={make} className="h-12 px-5 rounded-full bg-white text-black font-extrabold press flex items-center gap-1"><Plus size={18} />Buat</button>
        </div>
        <div className="max-h-[40vh] overflow-y-auto no-scrollbar space-y-1">
          {item && playlists.map((p) => { const has = p.items.some((x) => x.id === item.id); return (
            <button key={p.id} onClick={() => add(p.id)} className="w-full flex items-center gap-3 p-2 rounded-2xl text-left hover:bg-white/5 press">
              {p.items[0] ? <Img src={p.items[0].cover} size={112} className="size-12 rounded-xl" /> : <span className="size-12 rounded-xl tile grid place-items-center"><ListMusic size={20} /></span>}
              <div className="flex-1 min-w-0"><p className="font-bold truncate">{p.name}</p><p className="text-sm text-white/50">{p.items.length} lagu</p></div>{has && <Check size={20} />}
            </button>); })}
          {item && !playlists.length && <p className="text-white/50 text-sm py-3">Belum ada playlist. Buat yang pertama di atas.</p>}
        </div>
      </div>
    </div>
  );
}
