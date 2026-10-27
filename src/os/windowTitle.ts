// The title shown on a window. Usually the app's name for the current skin;
// Files shows the open folder and the Viewer shows the open file.
import { useSkin } from './skins';
import { getApp } from './appRegistry';
import { useFilesStore } from '../apps/files/store';
import { useViewerStore } from '../apps/viewer/store';
import { fileTree } from '../content/fileTree';
import type { AppId } from './types';

export function useWindowTitle(appId: AppId): string {
  const skin = useSkin();
  const folder = useFilesStore((s) => s.path[s.path.length - 1]);
  const file = useViewerStore((s) => s.fileId);
  if (appId === 'files') return folder === 'trash' ? skin.words.trash : fileTree[folder]?.name ?? 'Files';
  if (appId === 'viewer') return fileTree[file]?.name ?? 'Viewer';
  return getApp(appId).title[skin.id];
}
