// Desktop overlays that every skin shares: the widget, context menu, quick
// settings with calendar, toasts, window switcher, snap preview and brightness.
// Their position and look come from each skin's CSS.
import { useEffect, useRef } from 'react';
import { useUiStore } from '../uiStore';
import { useSkinStore } from '../skinStore';
import { useWindowStore } from '../windowStore';
import { useSkin } from '../skins';
import { AppIcon } from '../AppIcon';
import { getApp } from '../appRegistry';
import { openApp, openNode, runTip } from '../actions';
import { useFilesStore } from '../../apps/files/store';
import { useSettingsStore } from '../../apps/settings/store';
import { fileTree } from '../../content/fileTree';
import { profile } from '../../content/profile';
import { tips } from '../../content/tips';
import { fmt, timeZone, useNow } from './hooks';

export function Widget() {
  const now = useNow();
  const on = useSkinStore((s) => s.widgets);
  if (!on) return null;
  return (
    <aside className="widget" aria-label="Clock and current projects">
      <div className="widget-time">{fmt.time(now)}</div>
      <div className="widget-date">{fmt.dateLong(now)}</div>
      <div className="widget-head">Currently building</div>
      {profile.building.map((b) => (
        <div key={b} className="widget-item">{b}</div>
      ))}
    </aside>
  );
}

export function ContextMenu() {
  const ctx = useUiStore((s) => s.ctx);
  const skin = useSkin();
  const widgets = useSkinStore((s) => s.widgets);
  const viewport = useUiStore((s) => s.viewport);
  const firstRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    firstRef.current?.focus();
  }, [ctx]);
  if (!ctx) return null;
  const close = (fn: () => void) => () => {
    useUiStore.getState().set({ ctx: null });
    fn();
  };
  const items: { label: string; act: () => void }[] =
    ctx.kind === 'file'
      ? [
          { label: 'Open', act: () => openFromFiles(ctx.id) },
          { label: skin.words.properties, act: () => useFilesStore.getState().select(ctx.id) },
        ]
      : [
          { label: 'New folder', act: () => useUiStore.getState().notify('New folder', 'This is a demo, so nothing was actually created.') },
          { label: 'Refresh', act: () => undefined },
          { label: 'Change wallpaper', act: () => useSkinStore.getState().nextWallpaper() },
          { label: widgets ? 'Hide widgets' : 'Show widgets', act: () => useSkinStore.getState().set({ widgets: !widgets }) },
          { label: 'Open Terminal', act: () => openApp('terminal') },
          {
            label: skin.words.personalize,
            act: () => {
              useSettingsStore.getState().setTab('appearance');
              openApp('settings');
            },
          },
          { label: 'Lock screen', act: () => useUiStore.getState().set({ lockStage: 0 }) },
        ];
  const x = Math.min(ctx.x, viewport.width - 215);
  const y = Math.min(ctx.y, viewport.height - (items.length * 34 + 20));
  return (
    <div
      className="ctx-menu"
      role="menu"
      data-keep
      style={{ left: x, top: y }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') useUiStore.getState().set({ ctx: null });
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const btns = Array.from(e.currentTarget.querySelectorAll('button'));
          const i = btns.indexOf(document.activeElement as HTMLButtonElement);
          btns[(i + (e.key === 'ArrowDown' ? 1 : btns.length - 1)) % btns.length]?.focus();
        }
      }}
    >
      {items.map((it, i) => (
        <button key={it.label} ref={i === 0 ? firstRef : undefined} type="button" role="menuitem" onClick={close(it.act)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/** Opening a file from the Files right-click menu: folders open in place. */
function openFromFiles(id: string) {
  const n = fileTree[id];
  if (n?.kids) {
    const fs = useFilesStore.getState();
    fs.go([...fs.path, id]);
  } else openNode(id);
}

export function QuickSettings() {
  const open = useUiStore((s) => s.panelOpen);
  const notes = useUiStore((s) => s.notes);
  const s = useSkinStore();
  const skin = useSkin();
  const now = useNow(30000);
  if (!open) return null;
  const toggles = [
    { name: 'Wi-Fi', on: s.wifi, state: s.wifi ? 'Connected' : 'Off', act: () => s.set({ wifi: !s.wifi }) },
    { name: 'Bluetooth', on: s.bluetooth, state: s.bluetooth ? 'On' : 'Off', act: () => s.set({ bluetooth: !s.bluetooth }) },
    { name: skin.words.focus, on: s.dnd, state: s.dnd ? 'On' : 'Off', act: () => s.set({ dnd: !s.dnd }) },
    { name: 'Dark mode', on: s.mode === 'dark', state: s.mode === 'dark' ? 'On' : 'Off', act: () => s.setMode(s.mode === 'dark' ? 'light' : 'dark') },
    { name: 'Lock screen', on: false, state: 'Tap to lock', act: () => useUiStore.getState().set({ lockStage: 0, panelOpen: false }) },
  ];
  const sliders = [
    { name: 'Brightness', pct: Math.round(((s.brightness - 40) / 60) * 100), down: () => s.set({ brightness: Math.max(40, s.brightness - 10) }), up: () => s.set({ brightness: Math.min(100, s.brightness + 10) }) },
    { name: 'Volume', pct: s.volume, down: () => s.set({ volume: Math.max(0, s.volume - 10) }), up: () => s.set({ volume: Math.min(100, s.volume + 10) }) },
  ];
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  return (
    <div className="quick-panel" data-keep role="dialog" aria-label="Quick settings">
      <div className="qp-title">Quick settings</div>
      <div className="qp-toggles">
        {toggles.map((t) => (
          <button key={t.name} type="button" aria-pressed={t.on} className={t.on ? 'is-on' : ''} onClick={t.act}>
            <span className="qp-name">{t.name}</span>
            <span className="qp-state">{t.state}</span>
          </button>
        ))}
      </div>
      <div className="qp-sliders">
        {sliders.map((l) => (
          <div key={l.name} className="qp-slider">
            <span className="qp-sname">{l.name}</span>
            <button type="button" aria-label={`Lower ${l.name}`} onClick={l.down}>−</button>
            <div className="qp-track" role="meter" aria-label={l.name} aria-valuenow={l.pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="qp-fill" style={{ width: `${l.pct}%` }} />
            </div>
            <button type="button" aria-label={`Raise ${l.name}`} onClick={l.up}>+</button>
          </div>
        ))}
      </div>
      {notes.length > 0 && (
        <div className="qp-notes">
          <div className="qp-notes-head">
            <strong>Notifications</strong>
            <button type="button" className="btn-soft" onClick={() => useUiStore.getState().set({ notes: [] })}>Clear</button>
          </div>
          {notes.slice(0, 3).map((n) => (
            <div key={n.id} className="qp-note">
              <strong>{n.title}</strong>
              <span>{n.body}</span>
              {n.tip >= 0 && tips[n.tip] && (
                <button
                  type="button"
                  className="btn-accent"
                  onClick={() => {
                    useUiStore.getState().set({ panelOpen: false });
                    runTip(n.tip);
                  }}
                >
                  {tips[n.tip].label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="qp-month">{now.toLocaleDateString([], { month: 'long', year: 'numeric' })}</div>
      <div className="qp-cal" role="grid" aria-label="Calendar">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((h, i) => (
          <div key={`h${i}`} className="qp-cal-head" aria-hidden="true">{h}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={`qp-day${d === now.getDate() ? ' is-today' : ''}`}>{d ?? ''}</div>
        ))}
      </div>
      <div className="qp-tz">Time zone: {timeZone()}</div>
    </div>
  );
}

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const covered = useUiStore((s) => s.panelOpen || s.launcherOpen);
  // The quick settings panel already lists notifications, so no toast on top of it.
  if (!toast || covered) return null;
  const tip = toast.tip >= 0 ? tips[toast.tip] : undefined;
  return (
    <div className="toast" role="status" aria-live="polite">
      <strong>{toast.title}</strong>
      <span>{toast.body}</span>
      {tip && (
        <div className="toast-actions">
          <button type="button" className="btn-accent" onClick={() => runTip(toast.tip)}>{tip.label}</button>
          <button type="button" className="btn-soft" onClick={() => useUiStore.getState().set({ toast: null })}>Dismiss</button>
          <button
            type="button"
            className="btn-soft"
            onClick={() => {
              useUiStore.getState().set({ toast: null });
              useSkinStore.getState().set({ tipsOn: false });
            }}
          >
            Stop tips
          </button>
        </div>
      )}
    </div>
  );
}

export function Switcher() {
  const open = useUiStore((s) => s.switcherOpen);
  const windows = useWindowStore((s) => s.windows);
  const skin = useSkin();
  const firstRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) firstRef.current?.focus();
  }, [open]);
  if (!open) return null;
  const sorted = [...windows].sort((a, b) => b.z - a.z);
  return (
    <div className="switcher" role="dialog" aria-label="Open windows" onClick={() => useUiStore.getState().set({ switcherOpen: false })}>
      {sorted.map((w, i) => (
        <button
          key={w.id}
          ref={i === 0 ? firstRef : undefined}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            useUiStore.getState().set({ switcherOpen: false });
            useWindowStore.getState().focusWindow(w.id);
          }}
        >
          <AppIcon app={getApp(w.appId).icon} skin={skin.id} size={56} />
          {getApp(w.appId).title[skin.id]}
        </button>
      ))}
      {sorted.length === 0 && <div className="switcher-empty">No open windows</div>}
    </div>
  );
}

export function SnapPreview() {
  const hint = useUiStore((s) => s.snapHint);
  const skin = useSkin();
  const viewport = useUiStore((s) => s.viewport);
  if (!hint) return null;
  const { top, bottom, left } = skin.insets;
  const w = viewport.width - left;
  const style = {
    top,
    height: viewport.height - top - bottom,
    left: hint === 'right' ? left + w / 2 : left,
    width: hint === 'max' ? w : w / 2,
  };
  return <div className="snap-preview" style={style} aria-hidden="true" />;
}

export function Dimmer() {
  const brightness = useSkinStore((s) => s.brightness);
  return <div className="dimmer" style={{ opacity: ((100 - brightness) / 100) * 0.7 }} aria-hidden="true" />;
}
