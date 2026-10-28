// Small helpers for the project Screenshots folders, shared by the phone
// gallery and the search.
import { fileTree, type FsNode } from './fileTree';

export const isMedia = (n?: FsNode) => n?.kind === 'image' || n?.kind === 'video';
/** "2 Group Policy" -> "Group Policy", "03 Map SHARED as S.jpg" -> "Map SHARED as S" */
export const label = (n: FsNode) => n.name.replace(/^\d+ /, '').replace(/\.(jpg|png|mp4)$/i, '');
export const thumbOf = (n: FsNode) => (n.kind === 'video' ? n.poster : n.src);
export const subfolders = (n: FsNode) => (n.kids ?? []).filter((k) => fileTree[k].kind === 'folder').length;

export function firstThumb(id: string): string | undefined {
  const n = fileTree[id];
  if (isMedia(n)) return thumbOf(n);
  for (const kid of n.kids ?? []) {
    const t = firstThumb(kid);
    if (t) return t;
  }
  return undefined;
}

function countMedia(id: string): { shots: number; videos: number } {
  const n = fileTree[id];
  if (n.kind === 'image') return { shots: 1, videos: 0 };
  if (n.kind === 'video') return { shots: 0, videos: 1 };
  return (n.kids ?? []).map(countMedia).reduce((a, b) => ({ shots: a.shots + b.shots, videos: a.videos + b.videos }), { shots: 0, videos: 0 });
}

/** "4 screenshots · 1 video" */
export function countText(id: string) {
  const { shots, videos } = countMedia(id);
  const parts = [];
  if (shots) parts.push(`${shots} screenshot${shots === 1 ? '' : 's'}`);
  if (videos) parts.push(`${videos} video${videos === 1 ? '' : 's'}`);
  return parts.join(' · ');
}
