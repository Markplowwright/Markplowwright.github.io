import type { ComponentType } from 'react';

export type SkinId = 'windows' | 'mac' | 'linux';
export type Mode = 'light' | 'dark';

/** Every app id. Adding an app means adding its id here and one entry in appRegistry.ts. */
export type AppId = 'files' | 'viewer' | 'terminal' | 'browser' | 'helpdesk' | 'capture' | 'subnet' | 'taskmgr' | 'network' | 'settings';

export type AppDefinition = {
  id: AppId;
  /** Display name per skin, for example File Explorer / Finder / Files. */
  title: Record<SkinId, string>;
  /** Icon id understood by <AppIcon>. */
  icon: string;
  component: ComponentType<{ windowId: string }>;
  defaultSize: { w: number; h: number };
  /** If true, opening the app again focuses the existing window. */
  singleInstance?: boolean;
  /** Kept in the taskbar / dock (and the start menu) even when closed. */
  pinned?: boolean;
  /**
   * Listed in the start menu and the Linux app grid but not kept in the
   * taskbar / dock. These apps get a desktop icon instead (DesktopIcons.tsx).
   */
  launcher?: boolean;
};

export type SnapSide = 'left' | 'right';

export type WindowState = {
  id: string; // unique per window instance
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number; // focus order: highest z is the active window
  minimized: boolean;
  maximized: boolean;
  /**
   * Snapped to a half of the screen. Snapping and maximizing never change
   * x, y, w and h: they only change how the window is drawn. So leaving a snap
   * or a maximize puts the window back at its old size with nothing to restore.
   */
  snap: SnapSide | null;
};

/** Space taken by the skin's bars, so maximized and snapped windows do not cover them. */
export type Insets = { top: number; bottom: number; left: number };
