// Files app (File Explorer / Finder / Files): browse the portfolio file tree.
import { AppIcon } from '../../os/AppIcon';
import { useSkin } from '../../os/skins';
import { useSkinStore } from '../../os/skinStore';
import { useUiStore } from '../../os/uiStore';
import { openNode } from '../../os/actions';
import { fileTree, type FsNode } from '../../content/fileTree';
import { useFilesStore } from './store';

const SIDEBAR: { id: string; path: string[]; icon: string }[] = [
  { id: 'about', path: ['about'], icon: 'folder' },
  { id: 'work', path: ['about', 'work'], icon: 'folder' },
  { id: 'pres', path: ['about', 'pres'], icon: 'folder' },
  { id: 'trash', path: ['trash'], icon: 'trash' },
];

export default function FilesApp() {
  const skin = useSkin();
  const { path, selected, search, sortDesc, go, select, setSearch, toggleSort } = useFilesStore();
  const savedView = useSkinStore((s) => s.filesView);
  const view = savedView ?? skin.filesView;
  const setView = (v: 'list' | 'grid') => useSkinStore.getState().set({ filesView: v });

  const name = (n: FsNode) => (n.id === 'trash' ? skin.words.trash : n.name);
  const typeOf = (n: FsNode) => skin.words.types[n.kind] ?? 'File';
  const current = fileTree[path[path.length - 1]];
  const q = search.trim().toLowerCase();
  // Folders first, then A-Z (or Z-A).
  const items = (current.kids ?? [])
    .map((id) => fileTree[id])
    .filter((n) => !q || n.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const fa = a.kids ? 0 : 1;
      const fb = b.kids ? 0 : 1;
      if (fa !== fb) return fa - fb;
      return a.name.localeCompare(b.name) * (sortDesc ? -1 : 1);
    });
  const sel = selected ? fileTree[selected] : null;

  const open = (n: FsNode) => (n.kids ? go([...path, n.id]) : openNode(n.id));
  const up = () => path.length > 1 && go(path.slice(0, -1));
  const onItemKey = (e: React.KeyboardEvent, n: FsNode) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      open(n);
    }
  };
  const onCtx = (e: React.MouseEvent, n: FsNode) => {
    e.preventDefault();
    e.stopPropagation();
    select(n.id);
    useUiStore.getState().set({ ctx: { x: e.clientX, y: e.clientY, kind: 'file', id: n.id } });
  };

  return (
    <div className="files">
      <div className="toolbar">
        <button type="button" className="nav-btn" aria-label="Back" disabled={path.length < 2} onClick={up}>‹</button>
        <button type="button" className="nav-btn" aria-label="Up one level" disabled={path.length < 2} onClick={up}>↑</button>
        <nav className="crumbs" aria-label="Folder path">
          {path.map((id, i) => (
            <span key={id} className="crumb-wrap">
              {i > 0 && <span className="crumb-sep" aria-hidden="true">›</span>}
              <button type="button" className={`crumb${i === path.length - 1 ? ' is-current' : ''}`} aria-current={i === path.length - 1 ? 'page' : undefined} onClick={() => go(path.slice(0, i + 1))}>
                {name(fileTree[id])}
              </button>
            </span>
          ))}
        </nav>
        <button type="button" className="tool-btn" onClick={toggleSort}>{sortDesc ? 'Name Z-A' : 'Name A-Z'}</button>
        <div className="seg" role="group" aria-label="View">
          <button type="button" className="tool-btn" aria-pressed={view === 'list'} onClick={() => setView('list')}>List</button>
          <button type="button" className="tool-btn" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>Icons</button>
        </div>
        <input type="search" className="field search-box" aria-label="Search this folder" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="files-main">
        <nav className="side" aria-label={skin.words.sidebar}>
          <div className="side-title">{skin.words.sidebar}</div>
          {SIDEBAR.map((s) => (
            <button key={s.id} type="button" className={`side-btn${current.id === s.id ? ' is-on' : ''}`} onClick={() => go(s.path)}>
              <AppIcon app={s.icon} skin={skin.id} size={18} />
              {name(fileTree[s.id])}
            </button>
          ))}
        </nav>
        <div className="files-list" onClick={(e) => e.target === e.currentTarget && select(null)}>
          {view === 'list' ? (
            <div role="group" aria-label={name(current)}>
              <div className="list-head" aria-hidden="true">
                <span>Name</span>
                <span>Type</span>
              </div>
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`row${selected === n.id ? ' is-sel' : ''}`}
                  onClick={() => select(n.id)}
                  onDoubleClick={() => open(n)}
                  onKeyDown={(e) => onItemKey(e, n)}
                  onContextMenu={(e) => onCtx(e, n)}
                >
                  <AppIcon app={n.kind} skin={skin.id} size={20} />
                  <span className="row-name">{name(n)}</span>
                  <span className="row-type">{typeOf(n)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid" role="group" aria-label={name(current)}>
              {items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`cell${selected === n.id ? ' is-sel' : ''}`}
                  onClick={() => select(n.id)}
                  onDoubleClick={() => open(n)}
                  onKeyDown={(e) => onItemKey(e, n)}
                  onContextMenu={(e) => onCtx(e, n)}
                >
                  <AppIcon app={n.kind} skin={skin.id} size={52} />
                  <span>{name(n)}</span>
                </button>
              ))}
            </div>
          )}
          {items.length === 0 && <div className="empty">{q ? 'No items match your search.' : 'This folder is empty.'}</div>}
        </div>
        <aside className="preview" aria-label="Preview">
          {sel ? (
            <>
              <AppIcon app={sel.kind} skin={skin.id} size={64} />
              <div className="pv-name">{name(sel)}</div>
              <div className="pv-type">{typeOf(sel)}</div>
              {sel.kind === 'image' && sel.src && <img className="pv-img" src={sel.src} alt={sel.body ?? ''} loading="lazy" />}
              <p className="pv-body">{sel.kids ? sel.body ?? `${sel.kids.length} items` : sel.body}</p>
              <button type="button" className="btn-accent" onClick={() => open(sel)}>Open</button>
            </>
          ) : (
            <>
              <div className="pv-name">{items.length} {items.length === 1 ? 'item' : 'items'}</div>
              <p className="pv-body muted">Double-click a folder to look inside, or select a file to preview it here. Right-click for more.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
