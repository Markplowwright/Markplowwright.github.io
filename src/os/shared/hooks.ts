// Small hooks shared by the skins' shells.
import { useEffect, useState } from 'react';
import { apps } from '../appRegistry';
import { activeWindowId, useWindowStore } from '../windowStore';
import { useSkinStore } from '../skinStore';
import { openApp } from '../actions';
import type { AppId } from '../types';

/** The current time, refreshed every few seconds. */
export function useNow(intervalMs = 5000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** The visitor's own time zone. */
export function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'your local time zone';
  } catch {
    return 'your local time zone';
  }
}

export const fmt = {
  time: (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  dateShort: (d: Date) => d.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' }),
  dateMac: (d: Date) => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
  dateLinux: (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
  dateLong: (d: Date) => d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
};

export type Pin = { id: AppId; label: string; open: boolean; active: boolean; onClick: () => void };

/**
 * Apps for the taskbar / dock: the pinned ones, then any other app while it is
 * open (like a real taskbar), with their open and active state.
 */
export function usePins(): Pin[] {
  const skin = useSkinStore((s) => s.skin);
  const windows = useWindowStore((s) => s.windows);
  const active = activeWindowId(windows);
  const running = (id: AppId) => windows.some((w) => w.appId === id);
  // Pinned apps keep their place; other open apps join at the end.
  return [...apps.filter((a) => a.pinned), ...apps.filter((a) => !a.pinned && running(a.id))]
    .map((a) => {
      const w = windows.find((x) => x.appId === a.id);
      const isActive = !!w && w.id === active;
      return {
        id: a.id,
        label: a.title[skin],
        open: !!w,
        active: isActive,
        // Clicking the active app's button minimizes it, like a real taskbar.
        onClick: () => (isActive && w ? useWindowStore.getState().minimizeWindow(w.id) : openApp(a.id)),
      };
    });
}

/** Apps for the start menu and the Linux app grid: pinned and launcher apps. */
export function useLauncherApps(): { id: AppId; label: string }[] {
  const skin = useSkinStore((s) => s.skin);
  return apps.filter((a) => a.pinned || a.launcher).map((a) => ({ id: a.id, label: a.title[skin] }));
}
