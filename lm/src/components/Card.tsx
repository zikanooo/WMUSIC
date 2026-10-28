import { memo } from 'react';
import { useLocation } from 'wouter';
import { usePlayer } from '../store/player';
import Img from './Img';
import { isSong } from '../lib/util';
import type { Item } from '../../shared/types';
export default memo(function Card({ item, siblings, size = 168 }: { item: Item; siblings?: Item[]; size?: number }) {
  const [, nav] = useLocation(); const play = usePlayer((s) => s.play);
  const go = () => (isSong(item) ? play(item, siblings) : nav(`/c/${item.type}/${encodeURIComponent(item.id)}`));
  return (
    <button onClick={go} className="snap-start shrink-0 text-left press lift" style={{ width: size }}>
      <div className="relative">
        <Img src={item.cover} size={size * 2} className={`w-full aspect-square ${item.type === 'artist' ? 'rounded-full' : 'rounded-[22px]'}`} />
      </div>
      <p className="mt-2 text-[15px] font-bold leading-tight line-clamp-2">{item.title}</p>
      {item.subtitle && <p className="text-sm text-white/50 truncate">{item.subtitle}</p>}
    </button>
  );
});
