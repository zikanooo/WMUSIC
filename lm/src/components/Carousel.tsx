import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './Card';
import type { Section } from '../../shared/types';
export default function Carousel({ section, i = 0, size = 168 }: { section: Section; i?: number; size?: number }) {
  const r = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => r.current?.scrollBy({ left: d * r.current.clientWidth * 0.85, behavior: 'smooth' });
  return (
    <section className="mb-9 cv rise" style={{ ['--i' as any]: Math.min(i, 6) }}>
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0"><h2 className="text-[22px] md:text-3xl font-extrabold leading-tight">{section.title}</h2>{section.sub && <p className="text-[11px] font-bold tracking-[.12em] uppercase text-white/45 mt-0.5">{section.sub}</p>}</div>
        <div className="hidden md:flex gap-2">{[-1, 1].map((d) => <button key={d} onClick={() => scroll(d)} aria-label={d < 0 ? 'Kiri' : 'Kanan'} className="tile size-9 rounded-full grid place-items-center press">{d < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}</button>)}</div>
      </div>
      <div ref={r} className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 px-5 md:mx-0 md:px-0 pb-2">
        {section.items.map((it) => <Card key={it.type + it.id} item={it} siblings={section.items} size={size} />)}
      </div>
    </section>
  );
}
export const Skel = () => <div className="mb-9"><div className="h-8 w-48 rounded-full shimmer mb-4" /><div className="flex gap-4 overflow-hidden">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="shrink-0 w-[168px]"><div className="aspect-square rounded-[28px] shimmer" /><div className="h-4 w-3/4 mt-3 rounded-full shimmer" /></div>)}</div></div>;
