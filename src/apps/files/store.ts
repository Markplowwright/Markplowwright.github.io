// State of the Files app. It lives in a store (not in the component) so it
// survives switching skins, which redraws the window frame.
import { create } from 'zustand';
import { fileTree } from '../../content/fileTree';
import { loadSlice, saveSlice } from '../../os/storage';

type FilesState = {
  path: string[];
  selected: string | null;
  search: string;
  sortDesc: boolean;
  go: (path: string[]) => void;
  select: (id: string | null) => void;
  setSearch: (q: string) => void;
  toggleSort: () => void;
};

function savedPath(): string[] {
  const p = loadSlice('filesPath');
  return Array.isArray(p) && p.length > 0 && p.every((id) => typeof id === 'string' && fileTree[id]?.kids) ? (p as string[]) : ['about'];
}

export const useFilesStore = create<FilesState>((set) => ({
  path: savedPath(),
  selected: null,
  search: '',
  sortDesc: false,
  go: (path) => set({ path, selected: null, search: '' }),
  select: (selected) => set({ selected }),
  setSearch: (search) => set({ search }),
  toggleSort: () => set((s) => ({ sortDesc: !s.sortDesc })),
}));

useFilesStore.subscribe((s) => saveSlice('filesPath', s.path));
