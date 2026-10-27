// The look of the desktop: skin, light/dark mode, wallpaper per skin, widget
// on/off, Files view, and the quick settings. Saved to localStorage.
import { create } from 'zustand';
import type { Mode, SkinId } from './types';
import { bool, isObj, loadSlice, num, queryParam, saveSlice } from './storage';
import { defaultWallpaper, wallpapers } from '../content/wallpapers';

export const SKIN_IDS: SkinId[] = ['windows', 'mac', 'linux'];
const isSkin = (v: unknown): v is SkinId => typeof v === 'string' && (SKIN_IDS as string[]).includes(v);

type SkinState = {
  skin: SkinId;
  mode: Mode;
  wallpaper: Record<SkinId, number>;
  widgets: boolean;
  filesView: 'list' | 'grid' | null; // null = the skin's default
  wifi: boolean;
  bluetooth: boolean;
  dnd: boolean;
  brightness: number; // 40 to 100
  volume: number; // 0 to 100
  tipsOn: boolean;
  setSkin: (skin: SkinId) => void;
  setMode: (mode: Mode) => void;
  setWallpaper: (index: number) => void;
  nextWallpaper: () => void;
  set: (patch: Partial<Pick<SkinState, 'widgets' | 'filesView' | 'wifi' | 'bluetooth' | 'dnd' | 'brightness' | 'volume' | 'tipsOn'>>) => void;
};

function initial() {
  const s = loadSlice('skin');
  const o = isObj(s) ? s : {};
  const wp = isObj(o.wallpaper) ? o.wallpaper : {};
  let skin: SkinId = isSkin(o.skin) ? o.skin : 'windows';
  // ?skin=mac lets Mark link straight to a look. Old ?skin=win also works.
  const q = queryParam('skin');
  if (q === 'win') skin = 'windows';
  else if (isSkin(q)) skin = q;
  let mode: Mode = o.mode === 'dark' || o.mode === 'light' ? o.mode : 'light';
  if (!isSkin(o.skin) && o.mode === undefined) {
    try {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) mode = 'dark';
    } catch {
      /* no matchMedia */
    }
  }
  const wall = (id: SkinId) => num(wp[id], 0, wallpapers[id].length - 1, defaultWallpaper[id][mode]);
  return {
    skin,
    mode,
    wallpaper: { windows: wall('windows'), mac: wall('mac'), linux: wall('linux') },
    widgets: bool(o.widgets, true),
    filesView: (o.filesView === 'list' || o.filesView === 'grid' ? o.filesView : null) as 'list' | 'grid' | null,
    wifi: bool(o.wifi, true),
    bluetooth: bool(o.bluetooth, true),
    dnd: bool(o.dnd, false),
    brightness: num(o.brightness, 40, 100, 100),
    volume: num(o.volume, 0, 100, 60),
    tipsOn: bool(o.tipsOn, true),
  };
}

export const useSkinStore = create<SkinState>((set, get) => ({
  ...initial(),
  setSkin: (skin) => set({ skin }),
  // Switching mode also moves every skin to that mode's default wallpaper.
  setMode: (mode) =>
    set({
      mode,
      wallpaper: {
        windows: defaultWallpaper.windows[mode],
        mac: defaultWallpaper.mac[mode],
        linux: defaultWallpaper.linux[mode],
      },
    }),
  setWallpaper: (index) => set({ wallpaper: { ...get().wallpaper, [get().skin]: index } }),
  nextWallpaper: () => {
    const { skin, wallpaper } = get();
    set({ wallpaper: { ...wallpaper, [skin]: (wallpaper[skin] + 1) % wallpapers[skin].length } });
  },
  set: (patch) => set(patch),
}));

useSkinStore.subscribe((s) => {
  const { skin, mode, wallpaper, widgets, filesView, wifi, bluetooth, dnd, brightness, volume, tipsOn } = s;
  saveSlice('skin', { skin, mode, wallpaper, widgets, filesView, wifi, bluetooth, dnd, brightness, volume, tipsOn });
});
