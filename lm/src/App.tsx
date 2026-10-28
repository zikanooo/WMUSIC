import { lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Nav from './components/Nav';
import MiniPlayer from './components/MiniPlayer';
import Home from './pages/Home';
import { usePlayer } from './store/player';
import { useSheet } from './store/library';

const Explore = lazy(() => import('./pages/Explore'));
const Search = lazy(() => import('./pages/Search'));
const Library = lazy(() => import('./pages/Library'));
const LibPlaylist = lazy(() => import('./pages/LibPlaylist'));
const Detail = lazy(() => import('./pages/Detail'));
const FullPlayer = lazy(() => import('./components/FullPlayer'));
const PlaylistSheet = lazy(() => import('./components/PlaylistSheet'));

export default function App() {
  const [loc] = useLocation();
  const has = usePlayer((s) => s.queue.length > 0);
  const sheet = useSheet((s) => s.open);
  return (<>
    <Nav />
    <main className="md:ml-64 px-5 md:px-10 pt-[max(1.25rem,env(safe-area-inset-top))] pb-56 md:pb-40 max-w-[1500px]">
      <div key={loc.split('/')[1]} className="page">
        <Suspense fallback={<div className="h-64 rounded-[32px] shimmer" />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/explore" component={Explore} />
            <Route path="/search" component={Search} />
            <Route path="/library" component={Library} />
            <Route path="/library/:pid" component={LibPlaylist} />
            <Route path="/c/:type/:id" component={Detail} />
            <Route>Halaman tidak ditemukan.</Route>
          </Switch>
        </Suspense>
      </div>
    </main>
    <MiniPlayer />
    <Suspense fallback={null}>{has && <FullPlayer />}{sheet && <PlaylistSheet />}</Suspense>
  </>);
}
