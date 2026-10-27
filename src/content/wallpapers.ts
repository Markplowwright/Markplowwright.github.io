// Wallpapers: original SVG artwork drawn by src/os/shared/Wallpaper.tsx.
// Every entry must have a license (the type makes it required, and
// wallpapers.test.ts fails the build if one is empty).
import type { SkinId } from '../os/types';

export type Wallpaper = {
  id: string;
  name: string;
  /** Which drawing to use. */
  style: 'bloom' | 'dusk' | 'hills';
  /** Colors used by the drawing (a to k, see Wallpaper.tsx). */
  c: Record<string, string>;
  license: string;
};

const ORIGINAL = 'Original SVG artwork made for this site (MIT, same as the code)';

export const wallpapers: Record<SkinId, Wallpaper[]> = {
  windows: [
    { id: 'bloom', name: 'Bloom', style: 'bloom', license: ORIGINAL, c: { a: '#eaf2ff', b: '#b4d0f7', c: '#2f7df0', d: '#7b5df0', e: '#58b6ff', f: '#3a63e8', g: '#ffffff' } },
    { id: 'midnight', name: 'Midnight Bloom', style: 'bloom', license: ORIGINAL, c: { a: '#0b1226', b: '#1b2a55', c: '#2f7df0', d: '#8a5cf6', e: '#38bdf8', f: '#4f46e5', g: '#cbd5ff' } },
    { id: 'glow', name: 'Glow', style: 'bloom', license: ORIGINAL, c: { a: '#fff1e6', b: '#ffc9a8', c: '#ff7a59', d: '#d946ef', e: '#ffb454', f: '#f43f5e', g: '#fff7ed' } },
  ],
  mac: [
    { id: 'dusk', name: 'Dusk', style: 'dusk', license: ORIGINAL, c: { a: '#1c2670', b: '#7a5cd6', c: '#ff9e85', d: '#ffd2a1', e: '#fff2d4', f: '#ffb48a', g: '#8d6bdc', h: '#171c52', i: '#4a3fa8', j: '#2c2a7c', k: '#0d1033' } },
    { id: 'dawn', name: 'Dawn', style: 'dusk', license: ORIGINAL, c: { a: '#3b3b8f', b: '#d58ab8', c: '#ffb38a', d: '#ffe5b8', e: '#fff6dc', f: '#ffc29a', g: '#c58bd0', h: '#3a2c70', i: '#8a5fb8', j: '#5b3f94', k: '#2a1f55' } },
    { id: 'night', name: 'Night', style: 'dusk', license: ORIGINAL, c: { a: '#050816', b: '#0f1a4a', c: '#243b8a', d: '#3d5cb0', e: '#bcd2ff', f: '#4768c9', g: '#1c2c66', h: '#050816', i: '#15235a', j: '#0c1540', k: '#040612' } },
  ],
  linux: [
    { id: 'sunset', name: 'Sunset', style: 'hills', license: ORIGINAL, c: { a: '#2a1a4d', b: '#a2386c', c: '#f4864a', e: '#ffe3b8', f: '#ffb070', i: '#6b2a73', j: '#3c1c5e', k: '#1d1038' } },
    { id: 'aubergine', name: 'Aubergine', style: 'hills', license: ORIGINAL, c: { a: '#1a0f2e', b: '#4b1e63', c: '#8a3f8f', e: '#f1b3e8', f: '#b05fc0', i: '#5a2a7a', j: '#34184d', k: '#1a0b2e' } },
    { id: 'teal', name: 'Teal', style: 'hills', license: ORIGINAL, c: { a: '#04202a', b: '#0a5c63', c: '#28b5a0', e: '#c6fff1', f: '#5fe3c9', i: '#0a6b6b', j: '#07484f', k: '#031f26' } },
  ],
};

/** Index of the default wallpaper per skin for light and dark mode. */
export const defaultWallpaper: Record<SkinId, { light: number; dark: number }> = {
  windows: { light: 0, dark: 1 },
  mac: { light: 0, dark: 2 },
  linux: { light: 0, dark: 1 },
};
