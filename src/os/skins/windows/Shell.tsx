// Windows style shell: centered taskbar, start menu with search, tray and clock.
import { AppIcon } from '../../AppIcon';
import { SOCIALS, SocialTile, openSocial } from '../../SocialIcon';
import { useUiStore } from '../../uiStore';
import { useSkinStore } from '../../skinStore';
import { openApp, openNode } from '../../actions';
import { fmt, useNow, usePins } from '../../shared/hooks';
import { BatteryIcon, SearchGlyph, SearchInput, SearchResults, SkinSwitcher, VolumeIcon, WifiIcon } from '../../shared/ShellParts';
import { profile } from '../../../content/profile';

const RECOMMENDED = [
  { node: 'resume', name: 'Resume.pdf', sub: 'About Mark', icon: 'pdf' },
  { node: 'work', name: 'Work & Projects', sub: 'Folder', icon: 'folder' },
  { node: 'pres', name: 'Presentations', sub: 'Folder', icon: 'folder' },
  { node: 'bio', name: 'Bio.txt', sub: 'About Mark', icon: 'doc' },
];

export function Shell() {
  const pins = usePins();
  const now = useNow();
  const startOpen = useUiStore((s) => s.launcherOpen);
  const query = useUiStore((s) => s.query);
  const wifi = useSkinStore((s) => s.wifi);
  const ui = useUiStore.getState;

  return (
    <>
      <nav className="win-taskbar" aria-label="Taskbar">
        <button type="button" data-keep className={`tb-btn${startOpen ? ' is-on' : ''}`} aria-label="Start" aria-expanded={startOpen} onClick={() => ui().set({ launcherOpen: !startOpen, panelOpen: false, query: '' })}>
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <rect x="1.5" y="1.5" width="8.2" height="8.2" rx="2" fill="#0f6cbd" />
            <rect x="12.3" y="1.5" width="8.2" height="8.2" rx="2" fill="#3a96dd" />
            <rect x="1.5" y="12.3" width="8.2" height="8.2" rx="2" fill="#3a96dd" />
            <rect x="12.3" y="12.3" width="8.2" height="8.2" rx="2" fill="#0f6cbd" />
          </svg>
        </button>
        <button type="button" className="tb-btn" aria-label="Task view (Alt+`)" onClick={() => ui().set({ switcherOpen: true, launcherOpen: false, panelOpen: false })}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <rect x="2" y="4" width="11" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <rect x="7" y="8" width="11" height="9" rx="2" fill="var(--taskbar-bg-solid)" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        {pins.map((p) => (
          <button key={p.id} type="button" className={`tb-btn tb-app${p.active ? ' is-on' : ''}`} aria-label={p.label} aria-pressed={p.active} onClick={p.onClick}>
            <AppIcon app={p.id} skin="windows" size={26} />
            <span className={`tb-bar${p.open ? ' is-open' : ''}${p.active ? ' is-active' : ''}`} />
          </button>
        ))}
      </nav>

      <div className="win-tray">
        <SkinSwitcher className="skin-switch" />
        <button type="button" data-keep className="tray-btn" aria-label="Quick settings" onClick={() => ui().set({ panelOpen: !ui().panelOpen, launcherOpen: false, ctx: null })}>
          <WifiIcon off={!wifi} />
          <VolumeIcon />
          <BatteryIcon />
        </button>
        <button type="button" data-keep className="tray-btn tray-clock" onClick={() => ui().set({ panelOpen: !ui().panelOpen, launcherOpen: false, ctx: null })}>
          <span>{fmt.time(now)}</span>
          <span>{fmt.dateShort(now)}</span>
          <span className="sr-only">, calendar and notifications</span>
        </button>
      </div>

      {startOpen && (
        <div className="win-start" data-keep role="dialog" aria-label="Start menu">
          <div className="start-search">
            <SearchGlyph />
            <SearchInput className="start-input" label="Search apps and files" placeholder="Search for apps, settings, and documents" />
          </div>
          {query.trim() ? (
            <div className="start-results">
              <div className="start-heading">Best match</div>
              <SearchResults className="start-list" iconSize={28} />
            </div>
          ) : (
            <>
              <div className="start-row">
                <strong>Pinned</strong>
              </div>
              <div className="start-grid">
                {pins.map((p) => (
                  <button key={p.id} type="button" onClick={() => openApp(p.id)}>
                    <AppIcon app={p.id} skin="windows" size={36} />
                    {p.label}
                  </button>
                ))}
                <button type="button" onClick={() => openNode('about')}>
                  <AppIcon app="folder" skin="windows" size={36} />
                  About Mark
                </button>
                {SOCIALS.map((x) => (
                  <button key={x.id} type="button" onClick={() => openSocial(x.id)}>
                    <SocialTile id={x.id} size={34} className="" />
                    {x.label}
                  </button>
                ))}
              </div>
              <div className="start-row">
                <strong>Recommended</strong>
              </div>
              <div className="start-recs">
                {RECOMMENDED.map((r) => (
                  <button key={r.node} type="button" className="search-result" onClick={() => openNode(r.node)}>
                    <AppIcon app={r.icon} skin="windows" size={30} />
                    <span>
                      <span className="sr-name">{r.name}</span>
                      <span className="sr-sub">{r.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="start-foot">
            <span className="avatar" aria-hidden="true">{profile.name[0]}</span>
            <span className="start-name">{profile.name}</span>
            <span className="spacer" />
            <button type="button" onClick={() => ui().set({ lockStage: 0, launcherOpen: false })}>
              Lock
            </button>
          </div>
        </div>
      )}
    </>
  );
}
