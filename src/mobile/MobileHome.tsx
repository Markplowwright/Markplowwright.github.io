// Phone layout (below 768px): a home screen of app icons. Tapping one opens
// it full screen with a Home button. Same content as the desktop.
import { useEffect, useState, type ReactNode } from 'react';
import { AppIcon } from '../os/AppIcon';
import { useSkinStore } from '../os/skinStore';
import { fmt, timeZone, useNow } from '../os/shared/hooks';
import { useStats } from '../apps/taskmgr/useStats';
import { runCommand } from '../apps/terminal/commands';
import { profile } from '../content/profile';
import { projects } from '../content/projects';
import { presentations, research } from '../content/presentations';
import { links } from '../content/links';
import { lab } from '../content/lab';
import { events } from '../content/events';
import { terminalText } from '../content/terminal';
import { skills } from '../content/skills';
import { interests, writing } from '../content/interests';
import './mobile.css';

type MobileApp = 'about' | 'projects' | 'slides' | 'resume' | 'contact' | 'browser' | 'terminal' | 'network' | 'activity' | 'logs' | 'settings';

const DEFS: { id: MobileApp; label: string; icon: string; tile?: string }[] = [
  { id: 'about', label: 'About Mark', icon: 'folder', tile: 'linear-gradient(160deg,#5ac8fa,#0a84ff)' },
  { id: 'projects', label: 'Projects', icon: 'files' },
  { id: 'slides', label: 'Presentations', icon: 'slides', tile: 'linear-gradient(160deg,#ffb84d,#ff7a00)' },
  { id: 'resume', label: 'Resume', icon: 'pdf', tile: 'linear-gradient(160deg,#ff8a80,#e5281d)' },
  { id: 'contact', label: 'Contact', icon: 'doc', tile: 'linear-gradient(160deg,#6ee7a0,#1f9d55)' },
  { id: 'browser', label: 'Browser', icon: 'browser' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal' },
  { id: 'network', label: 'Network', icon: 'network' },
  { id: 'activity', label: 'Activity', icon: 'taskmgr' },
  { id: 'logs', label: 'Logs', icon: 'eventlog' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];
const DOCK: MobileApp[] = ['projects', 'contact', 'browser', 'settings'];

const BANNERS: { title: string; body: string; label: string; app: MobileApp }[] = [
  { title: "Start with Mark's projects", body: 'Each build has the problem, what he built and links.', label: 'Open Projects', app: 'projects' },
  { title: 'Get to know Mark outside of work', body: 'Music, chess, writing and poems, books, sports, games and audio.', label: 'Open About Mark', app: 'about' },
  { title: "Here are Mark's presentations", body: 'Seminars on network security and ML in computational chemistry.', label: 'Open Presentations', app: 'slides' },
  { title: 'Want to get in touch with Mark?', body: 'Email him, or read his resume.', label: 'Open Contact', app: 'contact' },
];

function Icon({ d }: { d: (typeof DEFS)[number] }) {
  if (!d.tile) return <AppIcon app={d.icon} skin="mac" size={60} />;
  return (
    <span className="m-tile" style={{ background: d.tile }}>
      <AppIcon app={d.icon} skin="mac" size={38} />
    </span>
  );
}

export function MobileHome() {
  const mode = useSkinStore((s) => s.mode);
  const tipsOn = useSkinStore((s) => s.tipsOn);
  const now = useNow();
  const [app, setApp] = useState<MobileApp | null>(null);
  const [banner, setBanner] = useState(-1);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.skin = 'mobile';
  }, [mode]);

  // Tip banners at the top of the home screen.
  useEffect(() => {
    if (!tipsOn) return;
    const timers = [6000, 26000, 46000, 66000].map((ms, i) => setTimeout(() => setBanner(i), ms));
    return () => timers.forEach(clearTimeout);
  }, [tipsOn]);

  const def = DEFS.find((d) => d.id === app);

  return (
    <div className="m-root">
      <h1 className="sr-only">Mark Plowright, portfolio</h1>
      <div className={`m-status${app ? ' is-app' : ''}`} aria-hidden="true">
        <span>{fmt.time(now)}</span>
        <span>●●● ▮</span>
      </div>

      <main className="m-home" aria-hidden={!!app}>
        <div className="m-clock">
          <div className="m-time">{fmt.time(now)}</div>
          <div className="m-date">{fmt.dateLong(now)}</div>
          <div className="m-who">{profile.name} · {profile.role}</div>
        </div>
        <div className="m-grid">
          {DEFS.filter((d) => !DOCK.includes(d.id)).map((d) => (
            <button key={d.id} type="button" className="m-app" onClick={() => setApp(d.id)}>
              <Icon d={d} />
              <span>{d.label}</span>
            </button>
          ))}
        </div>
        <nav className="m-dock" aria-label="Dock">
          {DOCK.map((id) => {
            const d = DEFS.find((x) => x.id === id)!;
            return (
              <button key={id} type="button" className="m-app" aria-label={d.label} onClick={() => setApp(id)}>
                <Icon d={d} />
              </button>
            );
          })}
        </nav>
      </main>

      {banner >= 0 && !app && tipsOn && (
        <div className="m-banner" role="status">
          <strong>{BANNERS[banner].title}</strong>
          <span>{BANNERS[banner].body}</span>
          <div className="m-banner-actions">
            <button type="button" className="m-btn" onClick={() => { setApp(BANNERS[banner].app); setBanner(-1); }}>{BANNERS[banner].label}</button>
            <button type="button" className="m-btn-soft" onClick={() => setBanner(-1)}>Dismiss</button>
            <button type="button" className="m-btn-soft" onClick={() => { setBanner(-1); useSkinStore.getState().set({ tipsOn: false }); }}>Stop tips</button>
          </div>
        </div>
      )}

      {app && def && (
        <div className="m-sheet" role="dialog" aria-label={def.label}>
          <div className="m-sheet-head">
            <button type="button" className="m-back" onClick={() => setApp(null)}>‹ Home</button>
            <h2>{def.label}</h2>
          </div>
          <div className="m-sheet-body">
            <MobileApp id={app} />
          </div>
        </div>
      )}
      <div className="m-indicator" aria-hidden="true" />
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="m-card">{children}</div>;
}

function MobileApp({ id }: { id: MobileApp }) {
  switch (id) {
    case 'about':
      return (
        <>
          <div className="m-profile">
            <span className="m-avatar" aria-hidden="true">{profile.name[0]}</span>
            <div>
              <div className="m-name">{profile.name}</div>
              <div className="m-muted">{profile.role}</div>
            </div>
          </div>
          {profile.bio.map((p) => <p key={p}>{p}</p>)}
          <h3>Experience</h3>
          {profile.experience.map((j) => (
            <Card key={j.company + j.title}>
              <strong>{j.title}</strong>
              <div className="m-muted">{j.company} · {j.period}</div>
            </Card>
          ))}
          <h3>Interests</h3>
          {[...interests, writing].map((i) => (
            <Card key={i.title}>
              <strong>{i.title}</strong>
              {i.body.map((line) => <p key={line} className="m-muted">{line}</p>)}
            </Card>
          ))}
          <h3>Skills</h3>
          {skills.map((s) => (
            <Card key={s.group}>
              <strong>{s.group}</strong>
              <div className="m-muted">{s.items.join(', ')}</div>
            </Card>
          ))}
          <p className="m-muted">Time zone: {timeZone()}</p>
        </>
      );
    case 'projects':
      return (
        <>
          {projects.map((p) => (
            <Card key={p.id}>
              <strong className="m-card-title">{p.name}</strong>
              <div className="m-muted">{p.category}{p.earlier ? ' · earlier project' : ''}</div>
              <p>{p.blurb}</p>
              <p className="m-muted">{p.outcome}</p>
              <div className="m-links">
                {p.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
              </div>
            </Card>
          ))}
        </>
      );
    case 'slides':
      return (
        <>
          {presentations.map((p) => (
            <Card key={p.id}>
              <strong className="m-card-title">{p.title}</strong>
              <div className="m-muted">{p.context} · {p.slides} slides</div>
              <p>{p.summary}</p>
              <div className="m-links"><a href={p.pdf} target="_blank" rel="noopener noreferrer">Open the deck (PDF)</a></div>
            </Card>
          ))}
          <h3>Research</h3>
          {research.map((r) => (
            <Card key={r.id}>
              <strong>{r.name.replace(/\.(pdf|url)$/, '')}</strong>
              <p className="m-muted">{r.body}</p>
              <div className="m-links"><a href={r.src} target="_blank" rel="noopener noreferrer">Open</a></div>
            </Card>
          ))}
        </>
      );
    case 'resume':
      return (
        <>
          <div className="m-paper">
            <div className="m-name">{profile.fullName}</div>
            <p>{profile.summary}</p>
            {profile.experience.slice(0, 4).map((j) => (
              <p key={j.company + j.title}><strong>{j.title}</strong>, {j.company}<br /><span className="m-muted">{j.period}</span></p>
            ))}
          </div>
          <a className="m-btn m-btn-block" href="/resume.pdf" download>Download resume (PDF)</a>
          <a className="m-btn-soft m-btn-block" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open resume</a>
        </>
      );
    case 'contact':
      return <MobileContact />;
    case 'browser':
      return (
        <>
          {links.map((l) => (
            <a key={l.name} className="m-card m-link" href={l.url} target="_blank" rel="noopener noreferrer">
              <strong>{l.name}</strong>
              <span className="m-muted">{l.note}</span>
            </a>
          ))}
        </>
      );
    case 'terminal':
      return <MobileTerminal />;
    case 'network':
      return <MobileNetwork />;
    case 'activity':
      return <MobileActivity />;
    case 'logs':
      return <MobileLogs />;
    case 'settings':
      return <MobileSettings />;
  }
}

function MobileContact() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject || 'Hello Mark')}&body=${encodeURIComponent(body)}`;
  return (
    <>
      <Card>
        Email: {profile.email}<br />
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a> · <a href={profile.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
      </Card>
      <h3>Write Mark an email</h3>
      <label className="sr-only" htmlFor="m-sub">Subject</label>
      <input id="m-sub" className="m-input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <label className="sr-only" htmlFor="m-msg">Message</label>
      <textarea id="m-msg" className="m-input" placeholder="Message" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      <a className="m-btn m-btn-block" href={href}>Open in my email app</a>
    </>
  );
}

function MobileTerminal() {
  const [lines, setLines] = useState<{ cmd: boolean; text: string }[]>([
    { cmd: true, text: 'whoami' },
    { cmd: false, text: terminalText.whoami },
  ]);
  const run = (c: string) => {
    const r = runCommand(c, { skin: 'linux', shell: 0 });
    setLines(r.clear ? [] : [...lines, { cmd: true, text: c }, ...r.lines.map((t) => ({ cmd: false, text: t }))]);
  };
  return (
    <>
      <div className="m-term" role="log" aria-live="polite">
        {lines.map((l, i) => <div key={i} className={l.cmd ? 'm-term-cmd' : ''}>{l.cmd ? `$ ${l.text}` : l.text}</div>)}
      </div>
      <div className="m-chips">
        {['help', 'whoami', 'projects', 'skills', 'contact', 'clear'].map((c) => (
          <button key={c} type="button" className="m-chip" onClick={() => run(c)}>{c}</button>
        ))}
      </div>
    </>
  );
}

function MobileNetwork() {
  const [sel, setSel] = useState('dc');
  const n = lab.nodes.find((x) => x.id === sel)!;
  return (
    <>
      <p className="m-muted">{lab.title}</p>
      <div className="m-chips">
        {lab.nodes.map((x) => (
          <button key={x.id} type="button" className={`m-chip${sel === x.id ? ' is-on' : ''}`} aria-pressed={sel === x.id} onClick={() => setSel(x.id)}>{x.name}</button>
        ))}
      </div>
      <Card>
        <strong>{n.name} · {n.role}</strong>
        <p>{n.text}</p>
        <div className="m-mono m-muted">Sample ping to {n.ip}: 3 replies, 0% loss, ~21 ms</div>
      </Card>
    </>
  );
}

function MobileActivity() {
  const s = useStats();
  return (
    <>
      {[['CPU', s.cpu, 'var(--accent)'], ['Memory', s.mem, 'var(--accent-2)']].map(([name, v, c]) => (
        <Card key={name as string}>
          <div className="m-row"><strong>{name}</strong><span>{v}%</span></div>
          <div className="m-bar"><div style={{ width: `${v}%`, background: c as string }} /></div>
        </Card>
      ))}
      {s.procs.slice(0, 6).map((p) => (
        <div key={p.name} className="m-row m-proc"><span>{p.name}</span><span className="m-muted">{p.cpu}%</span></div>
      ))}
      <p className="m-muted">Sample data.</p>
    </>
  );
}

function MobileLogs() {
  const [open, setOpen] = useState(0);
  return (
    <>
      {events.map((e, i) => (
        <button key={e.title} type="button" className={`m-card m-event${open === i ? ' is-on' : ''}`} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
          <strong>{e.title}</strong>
          <span className="m-muted">{e.source} · {e.level}</span>
          {open === i && (
            <span className="m-event-body">
              <b>Means:</b> {e.means}
              <br />
              <b>Do:</b> {e.fix}
            </span>
          )}
        </button>
      ))}
    </>
  );
}

function MobileSettings() {
  const mode = useSkinStore((s) => s.mode);
  const tipsOn = useSkinStore((s) => s.tipsOn);
  const st = useSkinStore.getState();
  return (
    <>
      <div className="m-card m-row">
        <strong id="m-dark">Dark mode</strong>
        <button type="button" role="switch" aria-checked={mode === 'dark'} aria-labelledby="m-dark" className={`m-switch${mode === 'dark' ? ' is-on' : ''}`} onClick={() => st.setMode(mode === 'dark' ? 'light' : 'dark')}>
          <span />
        </button>
      </div>
      <div className="m-card m-row">
        <strong id="m-tips">Tips</strong>
        <button type="button" role="switch" aria-checked={tipsOn} aria-labelledby="m-tips" className={`m-switch${tipsOn ? ' is-on' : ''}`} onClick={() => st.set({ tipsOn: !tipsOn })}>
          <span />
        </button>
      </div>
      <Card>
        <strong>About</strong>
        <p className="m-muted">{profile.osName}, phone view. On a larger screen this site becomes a desktop with Windows, macOS and Linux looks.</p>
      </Card>
    </>
  );
}
