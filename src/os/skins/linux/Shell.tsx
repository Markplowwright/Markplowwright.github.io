// Linux (GNOME-like) shell: dark top bar, left dock, Activities overview with search.
import { AppIcon } from '../../AppIcon';
import { useUiStore } from '../../uiStore';
import { useSkinStore } from '../../skinStore';
import { openApp, openNode } from '../../actions';
import { fmt, useNow, usePins } from '../../shared/hooks';
import { BatteryIcon, SearchGlyph, SearchInput, SearchResults, SkinSwitcher, VolumeIcon, WifiIcon } from '../../shared/ShellParts';

export function Shell() {
  const pins = usePins();
  const now = useNow();
  const overview = useUiStore((s) => s.launcherOpen);
  const query = useUiStore((s) => s.query);
  const wifi = useSkinStore((s) => s.wifi);
  const ui = useUiStore.getState;
  const togglePanel = () => ui().set({ panelOpen: !ui().panelOpen, launcherOpen: false, ctx: null });

  return (
    <>
      <header className="lx-topbar">
        <div className="lx-left">
          <button type="button" className="lx-activities" aria-pressed={overview} onClick={() => ui().set({ launcherOpen: !overview, query: '', panelOpen: false })}>
            Activities
          </button>
        </div>
        <button type="button" data-keep className="lx-clock" onClick={togglePanel}>
          {fmt.dateLinux(now)}&nbsp;&nbsp;{fmt.time(now)}
          <span className="sr-only">, calendar and notifications</span>
        </button>
        <div className="lx-right">
          <button type="button" className="lx-overview" onClick={() => ui().set({ switcherOpen: true, launcherOpen: false, panelOpen: false })}>
            Window overview
          </button>
          <SkinSwitcher className="skin-switch" />
          <button type="button" data-keep className="lx-system" aria-label="System menu" onClick={togglePanel}>
            <WifiIcon off={!wifi} />
            <VolumeIcon />
            <BatteryIcon />
          </button>
        </div>
      </header>

      <nav className="lx-dock" aria-label="Dock">
        {pins.map((p) => (
          <button key={p.id} type="button" className="dock-item" aria-label={p.label} title={p.label} onClick={p.onClick}>
            <span className={`lx-dot${p.open ? ' is-open' : ''}${p.active ? ' is-active' : ''}`} />
            <AppIcon app={p.id} skin="linux" size={42} />
          </button>
        ))}
        <span className="dock-sep" aria-hidden="true" />
        <button type="button" className="dock-item" aria-label="About Mark folder" title="About Mark" onClick={() => openNode('about')}>
          <AppIcon app="folder" skin="linux" size={42} />
        </button>
        <button type="button" className="dock-item" aria-label="Trash" title="Trash" onClick={() => openNode('trash')}>
          <AppIcon app="trash" skin="linux" size={42} />
        </button>
      </nav>

      {overview && (
        <div className="lx-overview-layer" role="dialog" aria-label="Activities overview">
          <div className="lx-scrim" onClick={() => ui().set({ launcherOpen: false, query: '' })} />
          <div className="lx-search" data-keep>
            <SearchGlyph />
            <SearchInput className="lx-input" label="Type to search" placeholder="Type to search" />
          </div>
          {query.trim() ? (
            <SearchResults className="lx-results" iconSize={30} />
          ) : (
            <div className="lx-grid">
              {pins.map((p) => (
                <button key={p.id} type="button" onClick={() => openApp(p.id)}>
                  <AppIcon app={p.id} skin="linux" size={72} />
                  {p.label}
                </button>
              ))}
              <button type="button" onClick={() => openNode('about')}>
                <AppIcon app="folder" skin="linux" size={72} />
                About Mark
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
