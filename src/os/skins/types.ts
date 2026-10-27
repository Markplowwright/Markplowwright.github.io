import type { ComponentType, PointerEvent, ReactNode } from 'react';
import type { Insets, SkinId, WindowState } from '../types';

/** What Window.tsx hands to a skin's WindowFrame. The frame only draws; it never decides behavior. */
export type WindowFrameProps = {
  win: WindowState;
  title: string;
  icon: string;
  active: boolean;
  /** Snapped or maximized: frames usually drop their rounded corners. */
  edgeToEdge: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  /** Spread onto the title bar so it can be dragged and double-clicked. */
  titleBarProps: {
    onPointerDown: (e: PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: PointerEvent<HTMLElement>) => void;
    onDoubleClick: () => void;
  };
  children: ReactNode;
};

export type Shell = { name: string; prompt: (user: string) => string };

export type Skin = {
  id: SkinId;
  /** "Windows", "macOS", "Linux" */
  label: string;
  WindowFrame: ComponentType<WindowFrameProps>;
  /** Taskbar / menu bar and dock / top panel, plus the skin's launcher. */
  Shell: ComponentType;
  /** Prompt for the default shell. */
  terminalPrompt: (user: string) => string;
  /** The two shells the Terminal can switch between. */
  shells: [Shell, Shell];
  defaultWallpaper: string;
  /** Space the bars take, for maximized and snapped windows. */
  insets: Insets;
  /** Files app: list view by default (Windows) or icon view (the others). */
  filesView: 'list' | 'grid';
  /** Cosmetic words that differ between skins. */
  words: {
    trash: string;
    sidebar: string;
    properties: string;
    personalize: string;
    unlock: string;
    aboutPc: string;
    focus: string;
    types: Record<string, string>;
  };
};
