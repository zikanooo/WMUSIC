import { useEffect, useState } from 'react';
const memo = new Map<string, string>();
/** Warna rata-rata cover (canvas 1x1, di-cache) untuk aksen dinamis. */
export function useDominant(src?: string) {
  const [c, setC] = useState(() => (src && memo.get(src)) || '90,90,120');
  useEffect(() => {
    if (!src) return; const hit = memo.get(src); if (hit) return setC(hit);
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = src;
    img.onload = () => { try { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const x = cv.getContext('2d')!; x.drawImage(img, 0, 0, 1, 1); const [r, g, b] = x.getImageData(0, 0, 1, 1).data; const v = `${r},${g},${b}`; memo.set(src, v); setC(v); } catch {} };
  }, [src]);
  return c;
}
