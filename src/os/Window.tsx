// One window: behavior only. It works out where the window is drawn
// (floating, snapped or maximized), wires up drag and resize, and renders the
// current skin's WindowFrame around the app. The skin decides the look.
import { Suspense, type CSSProperties } from 'react';
import type { WindowState } from './types';
import { getApp } from './appRegistry';
import { useWindowStore } from './windowStore';
import { useUiStore } from './uiStore';
import { useWindowDrag, type Edge } from './useWindowDrag';
import { useSkin } from './skins';
import { useWindowTitle } from './windowTitle';

const EDGES: Edge[] = ['r', 'b', 'l', 'rb', 'lb'];

export function Window({ win, active }: { win: WindowState; active: boolean }) {
  const skin = useSkin();
  const viewport = useUiStore((s) => s.viewport);
  const { focusWindow, minimizeWindow, toggleMaximize, closeWindow } = useWindowStore.getState();
  const { titleBarProps, edgeProps } = useWindowDrag(win, skin.insets);
  const app = getApp(win.appId);
  const title = useWindowTitle(win.appId);
  const App = app.component;

  // Work out the rectangle to draw. Snapped and maximized windows fill the
  // space between the skin's bars; floating windows are kept on screen.
  const { top, bottom, left } = skin.insets;
  const areaW = viewport.width - left;
  const areaH = viewport.height - top - bottom;
  let rect: { x: number; y: number; w: number; h: number };
  if (win.maximized) rect = { x: left, y: top, w: areaW, h: areaH };
  else if (win.snap) rect = { x: win.snap === 'left' ? left : left + areaW / 2, y: top, w: areaW / 2, h: areaH };
  else {
    const w = Math.min(win.w, areaW);
    const h = Math.min(win.h, areaH);
    rect = {
      w,
      h,
      x: Math.min(Math.max(win.x, left + 120 - w), viewport.width - 120),
      y: Math.min(Math.max(win.y, top), viewport.height - bottom - 40),
    };
  }
  const edgeToEdge = win.maximized || !!win.snap;

  const style: CSSProperties = {
    left: rect.x,
    top: rect.y,
    width: rect.w,
    height: rect.h,
    zIndex: 10 + win.z,
    display: win.minimized ? 'none' : undefined,
  };

  return (
    <section
      role="dialog"
      aria-label={title}
      className={`window${active ? ' is-active' : ''}${edgeToEdge ? ' is-edge' : ''}`}
      style={style}
      onPointerDownCapture={() => focusWindow(win.id)}
      onFocusCapture={() => focusWindow(win.id)}
    >
      <skin.WindowFrame
        win={win}
        title={title}
        icon={app.icon}
        active={active}
        edgeToEdge={edgeToEdge}
        onMinimize={() => minimizeWindow(win.id)}
        onToggleMaximize={() => toggleMaximize(win.id)}
        onClose={() => closeWindow(win.id)}
        titleBarProps={{ ...titleBarProps, onDoubleClick: () => toggleMaximize(win.id) }}
      >
        <Suspense fallback={<div className="app-loading">Loading…</div>}>
          <App windowId={win.id} />
        </Suspense>
      </skin.WindowFrame>
      {!edgeToEdge && EDGES.map((edge) => <div key={edge} className={`resize resize-${edge}`} aria-hidden="true" {...edgeProps(edge)} />)}
    </section>
  );
}
