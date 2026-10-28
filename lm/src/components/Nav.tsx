import { Link, useLocation } from 'wouter';
import { Home, Compass, Library, Search } from 'lucide-react';
const tabs = [['/', 'Home', Home], ['/explore', 'Explore', Compass], ['/library', 'Library', Library]] as const;
export default function Nav() {
  const [p] = useLocation();
  const on = (h: string) => (h === '/' ? p === '/' : p.startsWith(h));
  return (<>
    <nav className="md:hidden fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex gap-3">
      <div className="glass flex-1 rounded-full p-1.5 flex">
        {tabs.map(([h, l, I]) => <Link key={h} href={h} className={`flex-1 flex flex-col items-center py-2 rounded-full text-[11px] font-bold transition-colors duration-300 ${on(h) ? 'bg-white/15' : 'text-white/70'}`}><I size={22} />{l}</Link>)}
      </div>
      <Link href="/search" aria-label="Cari" className={`glass size-[62px] rounded-full grid place-items-center press ${on('/search') ? 'bg-white/20' : ''}`}><Search size={24} /></Link>
    </nav>
    <aside className="hidden md:flex fixed left-4 top-4 bottom-28 w-56 z-30 glass rounded-4xl p-4 flex-col gap-1">
      <h1 className="text-2xl font-extrabold px-3 py-4">Liquid</h1>
      {[...tabs, ['/search', 'Cari', Search] as const].map(([h, l, I]) => <Link key={h} href={h} className={`flex items-center gap-3 rounded-full px-4 py-3 font-bold transition-colors ${on(h) ? 'bg-white/15' : 'text-white/60 hover:text-white hover:bg-white/5'}`}><I size={20} />{l}</Link>)}
    </aside>
  </>);
}
