import { useState } from 'react';
import { thumb } from '../lib/util';
/** Placeholder shimmer + fade-in; thumbnail dipilih sesuai ukuran tampil. */
export default function Img({ src, size = 336, className = '' }: { src?: string; size?: number; className?: string }) {
  const [ok, setOk] = useState(false);
  return <img src={thumb(src, size)} alt="" loading="lazy" decoding="async" onLoad={() => setOk(true)} className={`object-cover shimmer transition-opacity duration-500 ${ok ? 'opacity-100' : 'opacity-0'} ${className}`} />;
}
