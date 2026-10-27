// Pieces the skins' shells share: the skin switcher, search results and the
// tray icons. Each skin styles them through its own CSS.
import { useSkinStore, SKIN_IDS } from '../skinStore';
import { useUiStore } from '../uiStore';
import { search, type SearchResult } from '../search';
import { openApp, openNode } from '../actions';
import { AppIcon } from '../AppIcon';
import { skins } from '../skins';

export function SkinSwitcher({ className }: { className: string }) {
  const skin = useSkinStore((s) => s.skin);
  const setSkin = useSkinStore((s) => s.setSkin);
  return (
    <div className={className} role="group" aria-label="Desktop style">
      {SKIN_IDS.map((id) => (
        <button key={id} type="button" aria-pressed={skin === id} onClick={() => setSkin(id)}>
          {skins[id].label}
        </button>
      ))}
    </div>
  );
}

export function runResult(r: SearchResult) {
  if ('app' in r) openApp(r.app);
  else openNode(r.node);
}

/** Search results for the current query, or null when there is no query. */
export function SearchResults({ className, iconSize }: { className: string; iconSize: number }) {
  const query = useUiStore((s) => s.query);
  const skin = useSkinStore((s) => s.skin);
  if (!query.trim()) return null;
  const results = search(query, skin);
  return (
    <div className={className} role="group" aria-label="Search results">
      {results.map((r) => (
        <button key={r.key} type="button" className="search-result" onClick={() => runResult(r)}>
          <AppIcon app={r.icon} skin={skin} size={iconSize} />
          <span>
            <span className="sr-name">{r.name}</span>
            <span className="sr-sub">{r.sub}</span>
          </span>
        </button>
      ))}
      {results.length === 0 && <div className="search-empty">No results found.</div>}
    </div>
  );
}

/** The search box. Pressing Enter opens the first result. */
export function SearchInput({ label, placeholder, className }: { label: string; placeholder: string; className: string }) {
  const query = useUiStore((s) => s.query);
  const skin = useSkinStore((s) => s.skin);
  return (
    <input
      type="text"
      className={className}
      aria-label={label}
      placeholder={placeholder}
      value={query}
      autoFocus
      onChange={(e) => useUiStore.getState().set({ query: e.target.value })}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const first = search(query, skin)[0];
          if (first) runResult(first);
        }
      }}
    />
  );
}

export const WifiIcon = ({ off = false }: { off?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M1.5 6a9.5 9.5 0 0 1 13 0M3.8 8.7a6.2 6.2 0 0 1 8.4 0M6.1 11.3a2.9 2.9 0 0 1 3.8 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity={off ? 0.35 : 1} />
    <circle cx="8" cy="13.4" r="0.9" fill="currentColor" />
    {off && <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
  </svg>
);

export const VolumeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
    <path d="M11.5 5.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const BatteryIcon = () => (
  <svg width="22" height="14" viewBox="0 0 24 14" aria-hidden="true">
    <rect x="1" y="2" width="19" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <rect x="2.8" y="3.8" width="13" height="6.4" rx="1.6" fill="currentColor" />
    <rect x="21" y="5" width="2" height="4" rx="1" fill="currentColor" />
  </svg>
);

export const SearchGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="6.8" cy="6.8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10.3 10.3L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
