export default function Header({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="flex items-center justify-between mb-6 mt-2">
      <div><h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h1>{sub && <p className="text-white/50 font-bold mt-1">{sub}</p>}</div>
      <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 grid place-items-center font-extrabold text-sm">U</div>
    </header>
  );
}
