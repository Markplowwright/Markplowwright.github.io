// macOS style shell: translucent menu bar, floating glass dock, Spotlight search.
import { AppIcon } from '../../AppIcon';
import { useUiStore } from '../../uiStore';
import { useSkinStore } from '../../skinStore';
import { useWindowStore, activeWindowId } from '../../windowStore';
import { openApp, openNode } from '../../actions';
import { useSettingsStore } from '../../../apps/settings/store';
import { useWindowTitle } from '../../windowTitle';
import { fmt, useNow, usePins } from '../../shared/hooks';
import { BatteryIcon, SearchGlyph, SearchInput, SearchResults, SkinSwitcher, WifiIcon } from '../../shared/ShellParts';
import type { AppId } from '../../types';

function FocusedTitle({ appId }: { appId: AppId }) {
  return <span className="mb-app">{useWindowTitle(appId)}</span>;
}

export function Shell() {
  const pins = usePins();
  const now = useNow();
  const spotOpen = useUiStore((s) => s.launcherOpen);
  const wifi = useSkinStore((s) => s.wifi);
  const windows = useWindowStore((s) => s.windows);
  const activeId = activeWindowId(windows);
  const active = windows.find((w) => w.id === activeId);
  const ui = useUiStore.getState;
  const togglePanel = () => ui().set({ panelOpen: !ui().panelOpen, launcherOpen: false, ctx: null });

  return (
    <>
      <header className="mac-menubar">
        <button
          type="button"
          className="mb-brand"
          onClick={() => {
            useSettingsStore.getState().setTab('about');
            openApp('settings');
          }}
        >
          Portfolio
        </button>
        {active && <FocusedTitle appId={active.appId} />}
        <span className="spacer" />
        <SkinSwitcher className="skin-switch" />
        <button type="button" className="mb-icon" aria-label="Mission Control (Alt+`)" onClick={() => ui().set({ switcherOpen: true, launcherOpen: false, panelOpen: false })}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <rect x="1.5" y="3" width="13" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <rect x="4" y="12" width="8" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
        <button type="button" data-keep className="mb-icon" aria-label="Spotlight search" onClick={() => ui().set({ launcherOpen: !spotOpen, query: '', panelOpen: false })}>
          <SearchGlyph />
        </button>
        <button type="button" data-keep className="mb-icon mb-cc" aria-label="Control Center" onClick={togglePanel}>
          <svg width="18" height="16" viewBox="0 0 18 16" aria-hidden="true">
            <rect x="1" y="2" width="9" height="5.5" rx="2.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="7.2" cy="4.75" r="1.5" fill="currentColor" />
            <rect x="8" y="9" width="9" height="5.5" rx="2.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="11.8" cy="11.75" r="1.5" fill="currentColor" />
          </svg>
          <WifiIcon off={!wifi} />
          <BatteryIcon />
        </button>
        <button type="button" data-keep className="mb-clock" onClick={togglePanel}>
          {fmt.dateMac(now)}&nbsp;&nbsp;{fmt.time(now)}
          <span className="sr-only">, Notification Center</span>
        </button>
      </header>

      <nav className="mac-dock" aria-label="Dock">
        {pins.map((p) => (
          <button key={p.id} type="button" className="dock-item" aria-label={p.label} title={p.label} onClick={p.onClick}>
            <AppIcon app={p.id} skin="mac" size={54} />
            <span className={`dock-dot${p.open ? ' is-open' : ''}`} />
          </button>
        ))}
        <span className="dock-sep" aria-hidden="true" />
        <button type="button" className="dock-item" aria-label="About Mark folder" title="About Mark" onClick={() => openNode('about')}>
          <AppIcon app="folder" skin="mac" size={54} />
          <span className="dock-dot" />
        </button>
        <button type="button" className="dock-item" aria-label="Trash" title="Trash" onClick={() => openNode('trash')}>
          <AppIcon app="trash" skin="mac" size={54} />
          <span className="dock-dot" />
        </button>
      </nav>

      {spotOpen && (
        <>
          <div className="spot-scrim" onClick={() => ui().set({ launcherOpen: false, query: '' })} />
          <div className="mac-spotlight" data-keep role="dialog" aria-label="Spotlight">
            <div className="spot-row">
              <SearchGlyph />
              <SearchInput className="spot-input" label="Spotlight search" placeholder="Spotlight Search" />
            </div>
            <SearchResults className="spot-results" iconSize={30} />
          </div>
        </>
      )}
    </>
  );
}
