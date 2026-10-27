// Dragging and resizing windows with Pointer Events. The same for every skin.
//
// How it works:
// 1. On pointer down we "capture" the pointer, so every following move and
//    up event comes to the same element even if the mouse leaves it.
// 2. We remember where the pointer and the window started.
// 3. On each move we add the distance moved to the starting position (or
//    size) and tell the store. The store change redraws the window.
// 4. On release after a move, we check the screen edges: left or right edge
//    snaps to that half, the top edge maximizes.
//
// The desktop fills the browser window, so pointer clientX/clientY are
// already desktop coordinates.
import { useRef, type PointerEvent } from 'react';
import { useWindowStore, MIN_W, MIN_H } from './windowStore';
import { useUiStore } from './uiStore';
import type { Insets, WindowState } from './types';

export type Edge = 'r' | 'b' | 'l' | 'rb' | 'lb';

type DragStart = {
  mode: 'move' | Edge;
  px: number; // pointer at the start
  py: number;
  x: number; // window at the start
  y: number;
  w: number;
  h: number;
  moved: boolean;
};

/** How close (px) to an edge the pointer must be to snap. */
const SNAP_ZONE = 6;
/** Keep at least this much of a window on screen horizontally. */
const KEEP_VISIBLE = 120;

export function useWindowDrag(win: WindowState, insets: Insets) {
  const start = useRef<DragStart | null>(null);
  const { moveWindow, resizeWindow, snapWindow, focusWindow } = useWindowStore.getState();

  const begin = (e: PointerEvent<HTMLElement>, mode: DragStart['mode']) => {
    if (e.button !== 0) return;
    // Clicks on the title bar buttons (close, minimize...) are not drags.
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    focusWindow(win.id);
    start.current = { mode, px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h, moved: false };
  };

  const move = (e: PointerEvent<HTMLElement>) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.px;
    const dy = e.clientY - s.py;
    if (!s.moved && Math.abs(dx) + Math.abs(dy) < 3) return; // ignore tiny jitter on a click
    s.moved = true;
    const { width, height } = useUiStore.getState().viewport;

    if (s.mode === 'move') {
      // Dragging a snapped or maximized window "pulls it off": it goes back to
      // its floating size, centered under the pointer.
      if (win.maximized || win.snap) {
        snapWindow(win.id, null);
        s.x = e.clientX - win.w / 2;
        s.y = Math.max(insets.top, e.clientY - 16);
        s.px = e.clientX;
        s.py = e.clientY;
        moveWindow(win.id, s.x, s.y);
        return;
      }
      const x = Math.min(Math.max(s.x + dx, KEEP_VISIBLE - s.w), width - KEEP_VISIBLE);
      const y = Math.min(Math.max(s.y + dy, insets.top), height - insets.bottom - 40);
      moveWindow(win.id, x, y);
      // Show where the window would snap if released here.
      const hint = e.clientX <= SNAP_ZONE ? 'left' : e.clientX >= width - SNAP_ZONE ? 'right' : e.clientY <= insets.top + SNAP_ZONE ? 'max' : null;
      if (useUiStore.getState().snapHint !== hint) useUiStore.getState().set({ snapHint: hint });
      return;
    }

    // Resizing: right and bottom edges grow the window; the left edge also moves it.
    if (win.maximized || win.snap) return;
    let { x, w, h } = s;
    if (s.mode.includes('r')) w = Math.max(MIN_W, s.w + dx);
    if (s.mode.includes('b')) h = Math.max(MIN_H, s.h + dy);
    if (s.mode.includes('l')) {
      w = Math.max(MIN_W, s.w - dx);
      x = s.x + (s.w - w);
    }
    resizeWindow(win.id, w, h);
    if (x !== win.x) moveWindow(win.id, x, win.y);
  };

  const end = (e: PointerEvent<HTMLElement>) => {
    const s = start.current;
    start.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const hint = useUiStore.getState().snapHint;
    if (hint) useUiStore.getState().set({ snapHint: null });
    if (s && s.mode === 'move' && s.moved && hint) snapWindow(win.id, hint);
  };

  return {
    titleBarProps: {
      onPointerDown: (e: PointerEvent<HTMLElement>) => begin(e, 'move'),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
    },
    edgeProps: (edge: Edge) => ({
      onPointerDown: (e: PointerEvent<HTMLElement>) => begin(e, edge),
      onPointerMove: move,
      onPointerUp: end,
      onPointerCancel: end,
    }),
  };
}
