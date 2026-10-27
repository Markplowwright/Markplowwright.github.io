// The window manager's state, kept in one small Zustand store.
//
// A window is plain data (WindowState): where it is, how big it is, and its
// focus order (z). Components read this data and draw it; they never keep
// their own copy. Every change goes through one of the actions below, so the
// rules for opening, focusing and closing live in one place.
//
// The store knows nothing about skins. How a window looks is the skin's job;
// how it behaves is decided here and in useWindowDrag.ts.
import { create } from 'zustand';
import type { AppId, SnapSide, WindowState } from './types';
import { getApp, isAppId } from './appRegistry';
import { isObj, loadSlice, num, saveSlice } from './storage';

type WindowStore = {
  windows: WindowState[];
  /** The highest z handed out so far. Focusing a window gives it topZ + 1. */
  topZ: number;
  openApp: (appId: AppId) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
  /** Snap to the left or right half, maximize, or (null) go back to a floating window. */
  snapWindow: (id: string, side: SnapSide | 'max' | null) => void;
};

/** Minimum window size, so a window can never be resized into nothing. */
export const MIN_W = 340;
export const MIN_H = 220;

/** Changes one window and leaves the others alone. */
const update = (wins: WindowState[], id: string, patch: Partial<WindowState>) =>
  wins.map((w) => (w.id === id ? { ...w, ...patch } : w));

/** The windows a first-time visitor sees, matching the design. */
function firstVisitWindows(): WindowState[] {
  return [
    { id: 'files', appId: 'files', title: 'File Explorer', x: 190, y: 52, w: 820, h: 460, z: 1, minimized: false, maximized: false, snap: null },
    { id: 'terminal', appId: 'terminal', title: 'Terminal', x: 360, y: 230, w: 640, h: 380, z: 2, minimized: false, maximized: false, snap: null },
  ];
}

/** Loads saved windows and drops anything that does not look right. */
function loadWindows(): WindowState[] {
  const saved = loadSlice('windows');
  if (!Array.isArray(saved)) return firstVisitWindows();
  const out: WindowState[] = [];
  for (const v of saved) {
    if (!isObj(v) || !isAppId(v.appId) || typeof v.id !== 'string') continue;
    if (out.some((w) => w.id === v.id)) continue;
    const def = getApp(v.appId);
    out.push({
      id: v.id,
      appId: v.appId,
      title: def.title.windows,
      x: num(v.x, -2000, 4000, 120),
      y: num(v.y, 0, 3000, 60),
      w: num(v.w, MIN_W, 4000, def.defaultSize.w),
      h: num(v.h, MIN_H, 3000, def.defaultSize.h),
      z: num(v.z, 0, 1e6, out.length + 1),
      minimized: v.minimized === true,
      maximized: v.maximized === true,
      snap: v.snap === 'left' || v.snap === 'right' ? v.snap : null,
    });
  }
  return out;
}

const initialWindows = loadWindows();

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: initialWindows,
  topZ: Math.max(0, ...initialWindows.map((w) => w.z)),

  openApp: (appId) => {
    const def = getApp(appId);
    const { windows, topZ } = get();
    const z = topZ + 1;
    // Single-instance apps: bring the existing window back instead of opening a second one.
    const existing = def.singleInstance ? windows.find((w) => w.appId === appId) : undefined;
    if (existing) {
      set({ topZ: z, windows: update(windows, existing.id, { minimized: false, z }) });
      return existing.id;
    }
    // New windows cascade down and to the right so they do not stack exactly.
    const n = windows.length % 6;
    const id = def.singleInstance ? appId : `${appId}-${Date.now().toString(36)}`;
    const win: WindowState = {
      id,
      appId,
      title: def.title.windows,
      x: 160 + n * 34,
      y: 60 + n * 30,
      w: def.defaultSize.w,
      h: def.defaultSize.h,
      z,
      minimized: false,
      maximized: false,
      snap: null,
    };
    set({ topZ: z, windows: [...windows, win] });
    return id;
  },

  closeWindow: (id) => set({ windows: get().windows.filter((w) => w.id !== id) }),

  // Focusing puts the window on top by giving it the next z value.
  focusWindow: (id) => {
    const { windows, topZ } = get();
    const w = windows.find((x) => x.id === id);
    if (!w || (w.z === topZ && !w.minimized)) return;
    set({ topZ: topZ + 1, windows: update(windows, id, { z: topZ + 1, minimized: false }) });
  },

  minimizeWindow: (id) => set({ windows: update(get().windows, id, { minimized: true }) }),

  toggleMaximize: (id) => {
    const w = get().windows.find((x) => x.id === id);
    if (!w) return;
    set({ windows: update(get().windows, id, { maximized: !w.maximized, snap: null }) });
  },

  moveWindow: (id, x, y) => set({ windows: update(get().windows, id, { x, y }) }),

  resizeWindow: (id, w, h) => set({ windows: update(get().windows, id, { w: Math.max(MIN_W, w), h: Math.max(MIN_H, h) }) }),

  snapWindow: (id, side) => {
    const w = get().windows.find((x) => x.id === id);
    if (!w) return;
    if (side === null) set({ windows: update(get().windows, id, { snap: null, maximized: false }) });
    else if (side === 'max') set({ windows: update(get().windows, id, { maximized: true, snap: null }) });
    else set({ windows: update(get().windows, id, { snap: side, maximized: false }) });
  },
}));

// Save open windows (position, size, minimized, maximized, snap) on every change.
useWindowStore.subscribe((s) => {
  saveSlice(
    'windows',
    s.windows.map(({ id, appId, x, y, w, h, z, minimized, maximized, snap }) => ({ id, appId, x, y, w, h, z, minimized, maximized, snap })),
  );
});

/** The window on top (not minimized), or undefined. */
export function activeWindowId(windows: WindowState[]): string | undefined {
  let best: WindowState | undefined;
  for (const w of windows) if (!w.minimized && (!best || w.z > best.z)) best = w;
  return best?.id;
}
