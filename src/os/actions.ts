// Shared actions that cross app boundaries: opening a file tree node (from the
// desktop, search, tips or the terminal) and following a tip.
import { fileTree, folderPathFor } from '../content/fileTree';
import { tips } from '../content/tips';
import { useWindowStore } from './windowStore';
import { useUiStore } from './uiStore';
import { useFilesStore } from '../apps/files/store';
import { useViewerStore } from '../apps/viewer/store';
import { useBrowserStore } from '../apps/browser/store';
import { isAppId } from './appRegistry';
import type { AppId } from './types';

export function openApp(id: AppId) {
  useUiStore.getState().closeOverlays();
  useWindowStore.getState().openApp(id);
}

/** Opens a folder in Files, a file in the Viewer, or a link in a new tab. */
export function openNode(id: string) {
  const node = fileTree[id];
  if (!node) return;
  if (node.kids) {
    useFilesStore.getState().go(folderPathFor(id));
    openApp('files');
  } else if (node.kind === 'link' && node.src) {
    window.open(node.src, '_blank', 'noopener');
  } else {
    useViewerStore.getState().open(id);
    openApp('viewer');
  }
}

/** Opens the Browser on a search (used by tips, the Terminal and ?q= links). */
export function openSearch(q: string) {
  useBrowserStore.getState().go(q);
  openApp('browser');
}

/** Opens an app id or a file tree id (used by ?open= and tips). */
export function openTarget(target: string): boolean {
  if (isAppId(target)) {
    openApp(target);
    return true;
  }
  if (fileTree[target]) {
    openNode(target);
    return true;
  }
  return false;
}

export function runTip(index: number) {
  const t = tips[index];
  if (!t) return;
  useUiStore.getState().set({ toast: null });
  if ('app' in t.target) openTarget(t.target.app);
  else if ('search' in t.target) openSearch(t.target.search);
  else openNode(t.target.node);
}
