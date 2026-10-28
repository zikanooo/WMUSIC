import { memo } from 'react';
import { Heart, Plus, X } from 'lucide-react';
import { usePlayer } from '../store/player';
import { useLib, useSheet } from '../store/library';
import Img from './Img';
import type { Item } from '../../shared/types';
export default memo(function SongRow({ item, list, tile, onRemove }: { item: Item; list: Item[]; tile?: boolean; onRemove?: () => void }) {
  const play = usePlayer((s) => s.play);
  const active = usePlayer((s) => s.queue[s.index]?.id === item.id);
  const playing = usePlayer((s) => s.playing);
  const liked = useLib((s) => s.liked.some((x) => x.id === item.id));
  const toggleLike = useLib((s) => s.toggleLike); const show = useSheet((s) => s.show);
  return (
    <div className={`flex items-center gap-1 pr-2 rounded-full ${tile ? 'tile' : ''} ${active ? 'bg-white/15' : ''}`}>
      <button onClick={() => play(item, list)} className="flex-1 min-w-0 flex items-center gap-3 p-2 text-left press">
        <Img src={item.cover} size={112} className="size-14 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1"><p className="font-bold truncate">{item.title}</p><p className="text-sm text-white/50 truncate">{item.subtitle}</p></div>
        {active && <span className={`eq ${playing ? '' : 'off'}`}><i /><i /><i /></span>}
      </button>
      <button onClick={() => toggleLike(item)} aria-label="Suka" className="size-9 grid place-items-center press"><Heart size={19} className={liked ? 'text-pink-500' : 'text-white/50'} fill={liked ? 'currentColor' : 'none'} /></button>
      {onRemove ? <button onClick={onRemove} aria-label="Hapus" className="size-9 grid place-items-center press"><X size={19} className="text-white/50" /></button>
        : <button onClick={() => show(item)} aria-label="Tambah ke playlist" className="size-9 grid place-items-center press"><Plus size={20} className="text-white/50" /></button>}
    </div>
  );
});
