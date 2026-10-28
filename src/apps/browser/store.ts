// The Browser's history: each search (and tab) is a page you can go Back and
// Forward through. An empty query is the search home page. Shared by the
// desktop Browser, the phone Browser, tips, the Terminal and ?q= links.
import { create } from 'zustand';
import type { Tab } from '../../content/search';

export type BrowserEntry = { q: string; tab: Tab };

type BrowserState = {
  stack: BrowserEntry[];
  i: number;
  go: (q: string, tab?: Tab) => void;
  back: () => void;
  forward: () => void;
};

export const useBrowserStore = create<BrowserState>((set, get) => ({
  stack: [{ q: '', tab: 'all' }],
  i: 0,
  go: (q, tab = 'all') => {
    const { stack, i } = get();
    const next = { q: q.trim(), tab };
    const cur = stack[i];
    if (cur.q === next.q && cur.tab === next.tab) return;
    set({ stack: [...stack.slice(0, i + 1), next], i: i + 1 });
  },
  back: () => set((s) => ({ i: Math.max(0, s.i - 1) })),
  forward: () => set((s) => ({ i: Math.min(s.stack.length - 1, s.i + 1) })),
}));

export const useBrowserEntry = () => useBrowserStore((s) => s.stack[s.i]);
