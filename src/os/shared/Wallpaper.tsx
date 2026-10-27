// Draws the current wallpaper. All three styles are original SVG artwork that
// stretch to fill the screen (preserveAspectRatio="xMidYMid slice").
import { useId } from 'react';
import { useSkinStore } from '../skinStore';
import { wallpapers, type Wallpaper as W } from '../../content/wallpapers';

export function WallpaperArt({ wp, className }: { wp: W; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const c = wp.c;
  const common = { className, viewBox: '0 0 1280 800', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': true } as const;
  if (wp.style === 'bloom') {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id={`${uid}bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c.a} /><stop offset="1" stopColor={c.b} /></linearGradient>
          <linearGradient id={`${uid}p1`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.c} /><stop offset="1" stopColor={c.d} /></linearGradient>
          <linearGradient id={`${uid}p2`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.e} /><stop offset="1" stopColor={c.f} /></linearGradient>
          <filter id={`${uid}blur`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
        </defs>
        <rect width="1280" height="800" fill={`url(#${uid}bg)`} />
        <g filter={`url(#${uid}blur)`} opacity="0.92">
          {[0, 60, 120, 180, 240, 300].map((r, i) => (
            <ellipse key={r} cx="640" cy="300" rx="92" ry="236" fill={`url(#${uid}${i % 2 ? 'p2' : 'p1'})`} transform={`rotate(${r} 640 410)`} />
          ))}
          <circle cx="640" cy="410" r="74" fill={c.g} opacity="0.8" />
        </g>
      </svg>
    );
  }
  if (wp.style === 'dusk') {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id={`${uid}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.a} /><stop offset="0.5" stopColor={c.b} /><stop offset="0.8" stopColor={c.c} /><stop offset="1" stopColor={c.d} /></linearGradient>
          <radialGradient id={`${uid}sun`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={c.e} stopOpacity="0.95" /><stop offset="1" stopColor={c.f} stopOpacity="0" /></radialGradient>
          <linearGradient id={`${uid}lake`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.g} /><stop offset="1" stopColor={c.h} /></linearGradient>
        </defs>
        <rect width="1280" height="800" fill={`url(#${uid}sky)`} />
        <circle cx="900" cy="470" r="230" fill={`url(#${uid}sun)`} />
        <path d="M0 520L120 430L220 490L360 380L470 470L600 400L760 500L900 410L1040 480L1160 420L1280 480V660H0Z" fill={c.i} opacity="0.85" />
        <path d="M0 585L160 500L300 560L450 470L620 570L800 500L980 580L1140 510L1280 570V660H0Z" fill={c.j} />
        <rect x="0" y="640" width="1280" height="160" fill={`url(#${uid}lake)`} />
        <path d="M0 745Q320 690 640 735T1280 722V800H0Z" fill={c.k} />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <defs>
        <linearGradient id={`${uid}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.a} /><stop offset="0.55" stopColor={c.b} /><stop offset="1" stopColor={c.c} /></linearGradient>
        <radialGradient id={`${uid}sun`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={c.e} stopOpacity="0.95" /><stop offset="1" stopColor={c.f} stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1280" height="800" fill={`url(#${uid}sky)`} />
      <circle cx="980" cy="360" r="260" fill={`url(#${uid}sun)`} />
      <path d="M0 560Q200 480 400 540T800 520T1280 540V800H0Z" fill={c.i} opacity="0.85" />
      <path d="M0 640Q240 580 480 630T960 610T1280 640V800H0Z" fill={c.j} />
      <path d="M0 720Q300 680 600 715T1280 700V800H0Z" fill={c.k} />
    </svg>
  );
}

export function Wallpaper() {
  const skin = useSkinStore((s) => s.skin);
  const index = useSkinStore((s) => s.wallpaper[s.skin]);
  const wp = wallpapers[skin][index] ?? wallpapers[skin][0];
  return <WallpaperArt wp={wp} className="wallpaper" />;
}

/** A small CSS preview of a wallpaper for the Settings picker. */
export const wallpaperThumb = (wp: W) => `linear-gradient(160deg, ${wp.c.a}, ${wp.c.b} 55%, ${wp.c.c})`;
