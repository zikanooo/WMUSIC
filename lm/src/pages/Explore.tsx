import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import { api } from '../lib/util';
import type { Item } from '../../shared/types';
export default function Explore() {
  const { data, isLoading } = useQuery({ queryKey: ['explore'], queryFn: () => api<Item[]>('explore') });
  return (<>
    <Header title="Explore" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {isLoading && Array.from({ length: 10 }, (_, i) => <div key={i} className="h-28 rounded-[28px] shimmer" />)}
      {data?.map((m, i) => { const c = m.color ?? '#6d5dfc'; return (
        <Link key={m.id} href={`/c/mood/${encodeURIComponent(m.id)}`} className="rise relative block h-28 rounded-[28px] overflow-hidden p-4 font-extrabold text-lg press" style={{ background: `linear-gradient(135deg, ${c}, ${c}88)`, ['--i' as any]: Math.min(i, 8) }}>
          {m.title}<span className="absolute -right-3 -bottom-4 size-16 rounded-2xl rotate-12 bg-white/25 border border-white/30" />
        </Link>); })}
    </div>
  </>);
}
