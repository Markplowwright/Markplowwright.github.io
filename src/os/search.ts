// One search used by the Start menu, Spotlight and the Activities overview.
// It looks through app names (for the current skin) and the file tree.
import { apps } from './appRegistry';
import { fileTree, pathTo } from '../content/fileTree';
import type { AppId, SkinId } from './types';

export type SearchResult = { key: string; name: string; sub: string; icon: string } & ({ app: AppId } | { node: string });

/** Root folders and the joke files are not worth a search result. */
const SKIP = new Set(['about', 'trash', 't1', 't2', 't3']);

export function search(query: string, skin: SkinId, limit = 8): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: SearchResult[] = [];
  for (const a of apps) {
    if (out.length >= limit) break;
    if (a.title[skin].toLowerCase().includes(q)) out.push({ key: `app-${a.id}`, name: a.title[skin], sub: 'App', icon: a.icon, app: a.id });
  }
  for (const n of Object.values(fileTree)) {
    if (out.length >= limit) break;
    if (SKIP.has(n.id)) continue;
    const hay = `${n.name} ${n.kids ? n.body ?? '' : ''}`.toLowerCase();
    if (!hay.includes(q)) continue;
    // Show which folder a file is in, since several projects have an Overview.txt.
    const parent = fileTree[pathTo(n.id).slice(-2)[0]];
    out.push({ key: n.id, name: n.name, sub: n.kids ? 'Folder' : `File in ${parent?.name ?? 'About Mark'}`, icon: n.kind, node: n.id });
  }
  return out;
}
