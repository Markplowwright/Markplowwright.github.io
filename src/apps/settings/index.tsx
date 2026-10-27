// Settings: Personalization (skin, light/dark, wallpaper), Date & time, Network, About.
import { useSkin } from '../../os/skins';
import { SKIN_IDS, useSkinStore } from '../../os/skinStore';
import { skins } from '../../os/skins';
import { openNode } from '../../os/actions';
import { wallpaperThumb } from '../../os/shared/Wallpaper';
import { timeZone, useNow } from '../../os/shared/hooks';
import { wallpapers } from '../../content/wallpapers';
import { profile } from '../../content/profile';
import { interestsOneLine } from '../../content/interests';
import { useSettingsStore, type SettingsTab } from './store';

const TABS: [SettingsTab, string][] = [
  ['appearance', 'Personalization'],
  ['time', 'Date & time'],
  ['network', 'Network'],
  ['about', 'About'],
];

export default function SettingsApp() {
  const skin = useSkin();
  const s = useSkinStore();
  const { tab, setTab } = useSettingsStore();
  const now = useNow(30000);
  const tz = timeZone();
  const wIdx = s.wallpaper[skin.id];

  return (
    <div className="settings">
      <nav className="side side-wide" aria-label="Settings sections">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" className={`list-btn${tab === id ? ' is-on' : ''}`} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="settings-page">
        {tab === 'appearance' && (
          <>
            <h2>Personalization</h2>
            <p className="muted">Styles change the look only. Open windows, apps, folders and content stay exactly as they are.</p>
            <div className="opt-row" role="group" aria-label="Desktop style">
              {SKIN_IDS.map((id) => (
                <button key={id} type="button" className="btn btn-big" aria-pressed={s.skin === id} onClick={() => s.setSkin(id)}>
                  {skins[id].label}
                </button>
              ))}
            </div>
            <h3>Appearance</h3>
            <div className="opt-row" role="group" aria-label="Appearance">
              <button type="button" className="btn" aria-pressed={s.mode === 'light'} onClick={() => s.setMode('light')}>Light</button>
              <button type="button" className="btn" aria-pressed={s.mode === 'dark'} onClick={() => s.setMode('dark')}>Dark</button>
            </div>
            <h3>Desktop background</h3>
            <div className="opt-row" role="group" aria-label="Desktop background">
              {wallpapers[skin.id].map((wp, i) => (
                <button key={wp.id} type="button" className={`wall-opt${wIdx === i ? ' is-on' : ''}`} aria-pressed={wIdx === i} onClick={() => s.setWallpaper(i)}>
                  <span className="wall-thumb" style={{ background: wallpaperThumb(wp) }} />
                  <span>{wp.name}</span>
                </button>
              ))}
            </div>
            <h3>Desktop</h3>
            <label className="check">
              <input type="checkbox" checked={s.widgets} onChange={(e) => s.set({ widgets: e.target.checked })} /> Show the clock widget
            </label>
            <label className="check">
              <input type="checkbox" checked={s.tipsOn} onChange={(e) => s.set({ tipsOn: e.target.checked })} /> Show guided tips
            </label>
          </>
        )}
        {tab === 'time' && (
          <>
            <h2>Date and time</h2>
            <p>Current time: {now.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
            <p className="muted">Time zone: {tz} (set automatically from your device)</p>
          </>
        )}
        {tab === 'network' && (
          <>
            <h2>Network and internet</h2>
            <p className="muted">Wi-Fi is {s.wifi ? 'on' : 'off'}. The Browser app uses this setting.</p>
            <button type="button" className="btn-accent" onClick={() => s.set({ wifi: !s.wifi })}>Turn Wi-Fi {s.wifi ? 'off' : 'on'}</button>
          </>
        )}
        {tab === 'about' && (
          <>
            <h2>{skin.words.aboutPc}</h2>
            <dl className="about-grid">
              <dt>Name</dt><dd>{profile.fullName}</dd>
              <dt>Role</dt><dd>{profile.role}</dd>
              <dt>Location</dt><dd>{profile.location}</dd>
              <dt>Education</dt><dd>{profile.education.school}, B.S. Computer Information Technology</dd>
              <dt>Building</dt><dd>{profile.building.join(', ')}</dd>
              <dt>Interests</dt><dd>{interestsOneLine}</dd>
              <dt>Time zone</dt><dd>{tz}</dd>
              <dt>System</dt><dd>{profile.osName}, {skin.label} style</dd>
            </dl>
            <button type="button" className="btn-accent" onClick={() => openNode('about')}>Open the About Mark folder</button>
          </>
        )}
      </div>
    </div>
  );
}
