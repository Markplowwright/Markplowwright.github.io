// Short-lived desktop state: boot and lock screens, open menus and panels,
// notifications and the screen size. None of this is saved, so a reload always
// starts at the boot screen (the lock state is never remembered).
import { create } from 'zustand';
import { useSkinStore } from './skinStore';

export type Note = { id: number; title: string; body: string; tip: number };
export type ContextMenu = { x: number; y: number; kind: 'desktop' } | { x: number; y: number; kind: 'file'; id: string };

type UiState = {
  booted: boolean;
  /** 0 = locked, 1 = fading out, 2 = signed in. */
  lockStage: 0 | 1 | 2;
  launcherOpen: boolean; // start menu, Spotlight or Activities overview
  panelOpen: boolean; // quick settings and calendar
  switcherOpen: boolean;
  ctx: ContextMenu | null;
  query: string;
  toast: Note | null;
  notes: Note[];
  viewport: { width: number; height: number };
  /** Where a dragged window would snap if released now (drawn as a preview). */
  snapHint: 'left' | 'right' | 'max' | null;
  set: (patch: Partial<Omit<UiState, 'set' | 'notify' | 'closeOverlays'>>) => void;
  notify: (title: string, body: string, tip?: number) => void;
  closeOverlays: () => void;
};

let noteId = 0;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUiStore = create<UiState>((set, get) => ({
  booted: false,
  lockStage: 0,
  launcherOpen: false,
  panelOpen: false,
  switcherOpen: false,
  ctx: null,
  query: '',
  toast: null,
  notes: [],
  viewport: { width: typeof window === 'undefined' ? 1280 : window.innerWidth, height: typeof window === 'undefined' ? 800 : window.innerHeight },
  snapHint: null,
  set: (patch) => set(patch),

  // Every notification goes into the list in quick settings. A toast pops up
  // too, unless Do not disturb is on.
  notify: (title, body, tip = -1) => {
    const note: Note = { id: ++noteId, title, body, tip };
    const notes = [note, ...get().notes].slice(0, 6);
    if (useSkinStore.getState().dnd) {
      set({ notes });
      return;
    }
    set({ notes, toast: note });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), tip >= 0 ? 11000 : 6000);
  },

  closeOverlays: () => set({ launcherOpen: false, panelOpen: false, switcherOpen: false, ctx: null, query: '' }),
}));
