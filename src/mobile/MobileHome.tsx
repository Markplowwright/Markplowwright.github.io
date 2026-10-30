// Phone layout (below 768px): a home screen of app icons. Tapping one opens
// it full screen with a Home button. Same content as the desktop.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { create } from 'zustand';
import { AppIcon } from '../os/AppIcon';
import { useSkinStore } from '../os/skinStore';
import { fmt, timeZone, useNow } from '../os/shared/hooks';
import { useStats } from '../apps/taskmgr/useStats';
import { runCommand } from '../apps/terminal/commands';
import { profile } from '../content/profile';
import { projects } from '../content/projects';
import { presentations, research } from '../content/presentations';
import { lab } from '../content/lab';
import { events } from '../content/events';
import { terminalText } from '../content/terminal';
import { skills } from '../content/skills';
import { interests, writing } from '../content/interests';
import { MobileGallery } from './MobileGallery';
import { fileTree } from '../content/fileTree';
import type { Target } from '../content/search';
import { SearchView } from '../apps/browser/SearchView';
import { CommandGuide } from '../apps/terminal/CommandGuide';
import { HelpDeskView } from '../apps/helpdesk/HelpDeskView';
import { useTermQueue } from '../apps/terminal/queue';
import type { TryIt } from '../content/helpdesk';
import { useBrowserEntry, useBrowserStore } from '../apps/browser/store';
import { queryParam } from '../os/storage';
import { SOCIALS, SocialTile, type SocialId } from '../os/SocialIcon';
import { ProjectTile, projectShort } from './ProjectIcons';
import './mobile.css';

type MobileApp = 'about' | 'projects' | 'slides' | 'resume' | 'contact' | 'browser' | 'helpdesk' | 'terminal' | 'network' | 'activity' | 'logs' | 'settings';

const DEFS: { id: MobileApp; label: string; icon: string; tile?: string }[] = [
  { id: 'about', label: 'About Mark', icon: 'folder', tile: 'linear-gradient(160deg,#5ac8fa,#0a84ff)' },
  { id: 'projects', label: 'Projects', icon: 'files' },
  { id: 'slides', label: 'Presentations', icon: 'slides', tile: 'linear-gradient(160deg,#ffb84d,#ff7a00)' },
  { id: 'resume', label: 'Resume', icon: 'pdf', tile: 'linear-gradient(160deg,#ff8a80,#e5281d)' },
  { id: 'contact', label: 'Contact', icon: 'doc', tile: 'linear-gradient(160deg,#6ee7a0,#1f9d55)' },
  { id: 'browser', label: 'Browser', icon: 'browser' },
  { id: 'helpdesk', label: 'Help Desk', icon: 'helpdesk' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal' },
  { id: 'network', label: 'Network', icon: 'network' },
  { id: 'activity', label: 'Activity', icon: 'taskmgr' },
  { id: 'logs', label: 'Logs', icon: 'eventlog' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];
const DOCK: MobileApp[] = ['projects', 'contact', 'browser', 'settings'];
/** The home screen pages, left to right. The dock shows on every page. */
type Group = 'projects' | 'tools';
/** The apps inside the IT Tools group. */
const TOOLS: MobileApp[] = ['helpdesk', 'terminal'];
const PAGES: (MobileApp | SocialId | `group-${Group}`)[][] = [
  ['group-projects', 'group-tools', 'about', 'slides', 'resume', 'linkedin', 'github', 'email'],
  ['activity', 'logs', 'network'],
];
const PULL = 80; // pixels to pull down before releasing opens search

/** True when the site runs as an app saved to the home screen. */
const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

type InstallPrompt = Event & { prompt: () => Promise<void> };

/** A project's main link: its live site if it has one, otherwise GitHub. */
const projectLink = (p: (typeof projects)[number]) => p.links[0]?.url;

/** An open group (like an iPhone folder): blurred home screen, a title and a panel of icons. */
function GroupLayer({ title, onClose, more, children }: { title: string; onClose: () => void; more?: { label: string; onClick: () => void }; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    panel.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="m-group-layer" role="dialog" aria-modal="true" aria-label={`${title} group`} onClick={onClose}>
      <h2 className="m-group-title">{title}</h2>
      <div className="m-group-panel" ref={panel} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      {more && (
        <button type="button" className="m-group-more" onClick={(e) => { e.stopPropagation(); more.onClick(); }}>
          {more.label} ›
        </button>
      )}
    </div>
  );
}

/** The Projects group: one icon per project, linking to its site or GitHub. */
function ProjectsGroup({ onClose, onDetails }: { onClose: () => void; onDetails: () => void }) {
  return (
    <GroupLayer title="Projects" onClose={onClose} more={{ label: 'See details for every project', onClick: onDetails }}>
      {projects.map((p) => (
        <a key={p.id} className="m-app" href={projectLink(p)} target="_blank" rel="noopener noreferrer" aria-label={`${p.name} (opens ${p.links[0]?.label ?? 'link'})`}>
          <ProjectTile id={p.id} name={p.name} />
          <span>{projectShort(p.id, p.name)}</span>
        </a>
      ))}
    </GroupLayer>
  );
}

/** The IT Tools group: Help Desk, Terminal and the other IT apps. */
function ToolsGroup({ onClose, onOpen }: { onClose: () => void; onOpen: (id: MobileApp) => void }) {
  return (
    <GroupLayer title="IT Tools" onClose={onClose}>
      {TOOLS.map((id) => {
        const d = DEFS.find((x) => x.id === id)!;
        return (
          <button key={id} type="button" className="m-app" onClick={() => onOpen(id)}>
            <Icon d={d} />
            <span>{d.label}</span>
          </button>
        );
      })}
    </GroupLayer>
  );
}

/** Small text above the dock: how to save the portfolio as an app. */
function InstallHint() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPrompt);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);
  if (prompt)
    return (
      <button type="button" className="m-install" onClick={() => prompt.prompt().catch(() => {})}>
        Save Mark's portfolio as an app: tap to install
      </button>
    );
  const apple = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return (
    <p className="m-install">
      {apple ? 'Save as an app: tap Share, then Add to Home Screen' : 'Save as an app: open the browser menu, then Add to Home screen'}
    </p>
  );
}

const BANNERS: { title: string; body: string; label: string; app: MobileApp; q?: string }[] = [
  { title: "Start with Mark's projects", body: 'Each build has the problem, what he built and links.', label: 'Open Projects', app: 'projects' },
  { title: 'Search Mark’s portfolio in the Browser', body: 'Look up a skill like Group Policy or Intune and jump to the proof.', label: 'Search in the Browser', app: 'browser', q: 'Group Policy' },
  { title: 'Get to know Mark outside of work', body: 'Music, chess, writing, books, sports, games and audio.', label: 'Open About Mark', app: 'about' },
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
  // Where a search result sent us: the app to return to, a section to scroll to,
  // and a Screenshots folder or file to show.
  const [from, setFrom] = useState<MobileApp | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [gallery, setGallery] = useState<{ rootId: string; project: string; start: string } | null>(null);
  const [page, setPage] = useState(0);
  const [groupOpen, setGroupOpen] = useState<Group | null>(null);
  const [pull, setPull] = useState(0);
  const [standalone] = useState(isStandalone);
  const pager = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; top: number } | null>(null);

  useEffect(() => {
    if (standalone) document.documentElement.dataset.standalone = 'true';
  }, [standalone]);

  const goPage = (i: number) => {
    const el = pager.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  // Pull down on the home screen to search, like an iPhone. The Browser opens
  // in the same tap so the keyboard can come up.
  const openSearch = () => {
    flushSync(() => {
      useBrowserStore.getState().go('');
      openApp('browser');
    });
    document.querySelector<HTMLInputElement>('.m-browser .sx-box input')?.focus();
  };
  const onTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, top: e.currentTarget.scrollTop };
  };
  const onTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const s = touch.current;
    if (!s || s.top > 0) return;
    const dx = e.touches[0].clientX - s.x;
    const dy = e.touches[0].clientY - s.y;
    setPull(dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.5 ? Math.min(dy, PULL * 1.5) : 0);
  };
  const onTouchEnd = () => {
    const ready = pull >= PULL;
    touch.current = null;
    setPull(0);
    if (ready) openSearch();
  };

  // ?q=intune opens the Browser on that search.
  useEffect(() => {
    const q = queryParam('q');
    if (q !== null) {
      useBrowserStore.getState().go(q);
      setApp('browser');
    }
  }, []);

  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(() => document.getElementById(focus)?.scrollIntoView({ block: 'start' }), 60);
    return () => clearTimeout(t);
  }, [app, focus]);

  const openApp = (id: MobileApp | null) => {
    setApp(id);
    setFrom(null);
    setFocus(null);
  };

  /** "open resume" and friends from the Terminal: desktop app names mapped to phone screens. */
  const openTerminalTarget = (target: string) => {
    if (target === 'capture') {
      // Packet capture apps don't exist on phones.
      const t = useMobileTerm.getState();
      t.set({ lines: [...t.lines, { cmd: false, text: 'Packet Capture is a desktop app, like Wireshark. Open this site on a computer to try it.' }] });
      return;
    }
    const apps: Record<string, MobileApp> = {
      files: 'projects', work: 'projects', terminal: 'terminal', browser: 'browser', helpdesk: 'helpdesk', taskmgr: 'activity', eventlog: 'logs',
      network: 'network', settings: 'settings', resume: 'resume', contact: 'contact', pres: 'slides',
    };
    if (apps[target]) {
      setFrom(app);
      setApp(apps[target]);
      setFocus(null);
    } else openResult({ node: target });
  };
  /** Help Desk "Try it": run a command in the Terminal, or open an app or screenshots. */
  const tryFromHelpDesk = (x: TryIt) => {
    if ('terminal' in x) {
      useTermQueue.getState().send({ cmd: x.terminal, os: x.os });
      setFrom(app);
      setApp('terminal');
      setFocus(null);
    } else if ('app' in x) {
      const map: Record<string, MobileApp> = { taskmgr: 'activity', network: 'network', eventlog: 'logs' };
      setFrom(app);
      setApp(map[x.app]);
      setFocus(null);
    } else openResult({ node: x.node });
  };
  const searchFromApp = (q: string) => {
    useBrowserStore.getState().go(q);
    setFrom(app);
    setApp('browser');
    setFocus(null);
  };

  /** Opens a search result on the phone: the matching app, section or screenshot. */
  const openResult = (t: Target) => {
    if ('href' in t) {
      window.open(t.href, '_blank', 'noopener');
      return;
    }
    const id = t.node;
    const project = projects.find((p) => id === p.id || id.startsWith(`${p.id}-`));
    if (project && id.startsWith(`${project.id}-shots`)) {
      setGallery({ rootId: `${project.id}-shots`, project: project.name, start: id });
      return;
    }
    const node = fileTree[id];
    if (node?.kind === 'pdf' && node.src && id !== 'resume') {
      window.open(node.src, '_blank', 'noopener');
      return;
    }
    const sections: Record<string, [MobileApp, string?]> = {
      resume: ['resume'],
      contact: ['contact'],
      bio: ['about'],
      experience: ['about', 'm-sec-experience'],
      education: ['about', 'm-sec-education'],
      skills: ['about', 'm-sec-skills'],
      interests: ['about', 'm-sec-interests'],
      pres: ['slides'],
      research: ['slides', 'm-sec-research'],
    };
    let dest: [MobileApp, string?] = sections[id] ?? ['about'];
    if (project) dest = ['projects', `m-p-${project.id}`];
    else if (id.startsWith('int-')) dest = ['about', 'm-sec-interests'];
    else if (presentations.some((p) => p.id === id)) dest = ['slides', `m-pres-${id}`];
    setFrom(app);
    setApp(dest[0]);
    setFocus(dest[1] ?? null);
  };

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.skin = 'mobile';
  }, [mode]);

  // Tip banners at the top of the home screen.
  useEffect(() => {
    if (!tipsOn) return;
    const timers = [6000, 26000, 46000, 66000, 86000].map((ms, i) => setTimeout(() => setBanner(i), ms));
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
        <div className="m-pull" aria-hidden="true" style={{ opacity: Math.min(1, pull / PULL), transform: `translate(-50%, ${pull / 3}px)` }}>
          <span className="m-pull-icon" />
          {pull >= PULL ? 'Release to search' : 'Pull down to search'}
        </div>
        <div
          className="m-pages"
          ref={pager}
          onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        >
          {PAGES.map((items, i) => (
            <section
              key={i}
              className="m-page"
              aria-label={`Home screen, page ${i + 1} of ${PAGES.length}`}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={pull && page === i ? { transform: `translateY(${pull / 3}px)` } : undefined}
            >
              {i === 0 && (
                <div className="m-clock">
                  <div className="m-time">{fmt.time(now)}</div>
                  <div className="m-date">{fmt.dateLong(now)}</div>
                  <div className="m-who">{profile.name} · {profile.role}</div>
                  <div className="m-hint">Pull down to search · Swipe for more apps</div>
                </div>
              )}
              <div className="m-grid">
                {items.map((id) => {
                  if (id === 'group-projects')
                    return (
                      <button key={id} type="button" className="m-app" aria-haspopup="dialog" onClick={() => setGroupOpen('projects')}>
                        <span className="m-folder" aria-hidden="true">
                          {projects.slice(0, 9).map((p) => (
                            <ProjectTile key={p.id} id={p.id} name={p.name} size={13} />
                          ))}
                        </span>
                        <span>Projects</span>
                      </button>
                    );
                  if (id === 'group-tools')
                    return (
                      <button key={id} type="button" className="m-app" aria-haspopup="dialog" onClick={() => setGroupOpen('tools')}>
                        <span className="m-folder" aria-hidden="true">
                          {TOOLS.slice(0, 9).map((t) => {
                            const d = DEFS.find((x) => x.id === t)!;
                            return d.tile ? (
                              <span key={t} className="m-tile" style={{ background: d.tile, width: 13, height: 13, borderRadius: 3 }} />
                            ) : (
                              <AppIcon key={t} app={d.icon} skin="mac" size={13} />
                            );
                          })}
                        </span>
                        <span>IT Tools</span>
                      </button>
                    );
                  const social = SOCIALS.find((x) => x.id === id);
                  if (social)
                    return (
                      <a
                        key={id}
                        className="m-app"
                        href={social.href}
                        {...(social.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        <SocialTile id={social.id} />
                        <span>{social.label}</span>
                      </a>
                    );
                  const d = DEFS.find((x) => x.id === id)!;
                  return (
                    <button key={id} type="button" className="m-app" onClick={() => openApp(d.id)}>
                      <Icon d={d} />
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
        {!standalone && <InstallHint />}
        <div className="m-dots" aria-label="Home screen pages">
          {PAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`m-dot${page === i ? ' is-on' : ''}`}
              aria-label={`Page ${i + 1} of ${PAGES.length}`}
              aria-current={page === i ? 'page' : undefined}
              onClick={() => goPage(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <nav className="m-dock" aria-label="Dock">
          {DOCK.map((id) => {
            const d = DEFS.find((x) => x.id === id)!;
            return (
              <button key={id} type="button" className="m-app" aria-label={d.label} onClick={() => openApp(id)}>
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
            <button type="button" className="m-btn" onClick={() => { const b = BANNERS[banner]; if (b.q) useBrowserStore.getState().go(b.q); openApp(b.app); setBanner(-1); }}>{BANNERS[banner].label}</button>
            <button type="button" className="m-btn-soft" onClick={() => setBanner(-1)}>Dismiss</button>
            <button type="button" className="m-btn-soft" onClick={() => { setBanner(-1); useSkinStore.getState().set({ tipsOn: false }); }}>Stop tips</button>
          </div>
        </div>
      )}

      {app && def && (
        <div className="m-sheet" role="dialog" aria-label={def.label}>
          <div className="m-sheet-head">
            {from ? (
              <button type="button" className="m-back" onClick={() => { setApp(from); setFrom(null); setFocus(null); }}>‹ {DEFS.find((d) => d.id === from)?.label}</button>
            ) : (
              <button type="button" className="m-back" onClick={() => openApp(null)}>‹ Home</button>
            )}
            <h2>{def.label}</h2>
          </div>
          <div className="m-sheet-body">
            <MobileApp id={app} onOpen={openResult} onOpenTarget={openTerminalTarget} onSearch={searchFromApp} onTry={tryFromHelpDesk} />
          </div>
        </div>
      )}
      {groupOpen === 'projects' && !app && (
        <ProjectsGroup
          onClose={() => setGroupOpen(null)}
          onDetails={() => {
            setGroupOpen(null);
            openApp('projects');
          }}
        />
      )}
      {groupOpen === 'tools' && !app && (
        <ToolsGroup
          onClose={() => setGroupOpen(null)}
          onOpen={(id) => {
            setGroupOpen(null);
            openApp(id);
          }}
        />
      )}
      {gallery && <MobileGallery key={gallery.start} rootId={gallery.rootId} project={gallery.project} start={gallery.start} closeLabel={DEFS.find((d) => d.id === app)?.label} onClose={() => setGallery(null)} />}
      <div className="m-indicator" aria-hidden="true" />
    </div>
  );
}

function Card({ children, id }: { children: ReactNode; id?: string }) {
  return <div className="m-card" id={id}>{children}</div>;
}

function ProjectsApp() {
  const [gallery, setGallery] = useState<string | null>(null);
  const open = projects.find((p) => p.id === gallery);
  return (
    <>
      {projects.map((p) => (
        <Card key={p.id} id={`m-p-${p.id}`}>
          <strong className="m-card-title">{p.name}</strong>
          <div className="m-muted">{p.category}{p.earlier ? ' · earlier project' : ''}</div>
          <p>{p.blurb}</p>
          <p className="m-muted">{p.outcome}</p>
          <div className="m-links">
            {p.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>)}
          </div>
          {p.gallery && (
            <button type="button" className="m-gal-open" onClick={() => setGallery(p.id)}>
              <span>Screenshots{p.gallery.some((s) => s.kind === 'video') ? ' and video' : ''}</span>
              <span className="m-muted">{new Set(p.gallery.map((s) => s.folder[0]).filter(Boolean)).size} folders · {p.gallery.length} items ›</span>
            </button>
          )}
        </Card>
      ))}
      {open && <MobileGallery rootId={`${open.id}-shots`} project={open.name} onClose={() => setGallery(null)} />}
    </>
  );
}

function MobileApp({ id, onOpen, onOpenTarget, onSearch, onTry }: { id: MobileApp; onOpen: (t: Target) => void; onOpenTarget: (target: string) => void; onSearch: (q: string) => void; onTry: (x: TryIt) => void }) {
  switch (id) {
    case 'about':
      return (
        <>
          <div className="m-profile">
            <img className="m-avatar" src="/brand/avatar.webp" alt="" width="64" height="64" />
            <div>
              <div className="m-name">{profile.name}</div>
              <div className="m-muted">{profile.role}</div>
            </div>
          </div>
          {profile.bio.map((p) => <p key={p}>{p}</p>)}
          <h3 id="m-sec-experience">Experience</h3>
          {profile.experience.map((j) => (
            <Card key={j.company + j.title}>
              <strong>{j.title}</strong>
              <div className="m-muted">{j.company} · {j.period}</div>
            </Card>
          ))}
          <h3 id="m-sec-education">Education</h3>
          {profile.education.map((e) => (
            <Card key={e.school}>
              <strong>{e.school}</strong>
              <div className="m-muted">{e.degree}</div>
              <div className="m-muted">{e.location} · {e.period}</div>
            </Card>
          ))}
          <h3 id="m-sec-interests">Interests</h3>
          {[...interests, writing].map((i) => (
            <Card key={i.title}>
              <strong>{i.title}</strong>
              {i.body.map((line) => <p key={line} className="m-muted">{line}</p>)}
            </Card>
          ))}
          <h3 id="m-sec-skills">Skills</h3>
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
      return <ProjectsApp />;
    case 'slides':
      return (
        <>
          {presentations.map((p) => (
            <Card key={p.id} id={`m-pres-${p.id}`}>
              <strong className="m-card-title">{p.title}</strong>
              <div className="m-muted">{p.context} · {p.slides} slides</div>
              <p>{p.summary}</p>
              <div className="m-links"><a href={p.pdf} target="_blank" rel="noopener noreferrer">Open the deck (PDF)</a></div>
            </Card>
          ))}
          <h3 id="m-sec-research">Research</h3>
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
          <ResumeDownload />
          <a className="m-btn-soft m-btn-block" href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open resume</a>
        </>
      );
    case 'contact':
      return <MobileContact />;
    case 'browser':
      return <MobileBrowser onOpen={onOpen} />;
    case 'helpdesk':
      return <HelpDeskView phone onTry={onTry} />;
    case 'terminal':
      return <MobileTerminal onOpen={onOpenTarget} onSearch={onSearch} />;
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

/**
 * Downloads the resume as a file. Phones often ignore a plain download link,
 * and a site saved to the home screen can't download links at all, so the
 * file is fetched first. Saved as an app on an iPhone, it opens the share
 * sheet (Save to Files); otherwise it saves like any download.
 */
function ResumeDownload() {
  const NAME = 'Mark-Plowright-Resume.pdf';
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<'idle' | 'done'>('idle');
  useEffect(() => {
    let live = true;
    fetch('/resume.pdf')
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => live && setFile(new File([b], NAME, { type: 'application/pdf' })))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  const download = async () => {
    if (!file) {
      window.open('/resume.pdf', '_blank', 'noopener');
      return;
    }
    if (isStandalone() && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Mark Plowright resume' });
        setState('done');
      } catch {
        /* closed the share sheet */
      }
      return;
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    setState('done');
  };
  return (
    <button type="button" className="m-btn m-btn-block" onClick={download} aria-live="polite">
      {state === 'done' ? 'Downloaded: Mark-Plowright-Resume.pdf' : 'Download resume (PDF)'}
    </button>
  );
}

function MobileBrowser({ onOpen }: { onOpen: (t: Target) => void }) {
  const entry = useBrowserEntry();
  const { i, stack, go, back, forward } = useBrowserStore();
  return (
    <div className="m-browser">
      <div className="m-browser-bar">
        <button type="button" className="m-browser-btn" aria-label="Back" disabled={i === 0} onClick={back}>‹</button>
        <button type="button" className="m-browser-btn" aria-label="Forward" disabled={i >= stack.length - 1} onClick={forward}>›</button>
        <span className="m-browser-address">{entry.q ? `markplowwright.github.io/?q=${encodeURIComponent(entry.q)}` : 'markplowwright.github.io'}</span>
      </div>
      <SearchView entry={entry} onSearch={(q, tab) => go(q, tab)} onOpen={onOpen} phone />
    </div>
  );
}

function MobileContact() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject || 'Hello Mark')}&body=${encodeURIComponent(body)}`;
  return (
    <>
      <div className="m-social-row">
        {SOCIALS.map((x) => (
          <a key={x.id} className="m-social" href={x.href} {...(x.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            <SocialTile id={x.id} size={44} />
            <span>{x.label}</span>
          </a>
        ))}
      </div>
      <Card>Email: {profile.email}</Card>
      <h3>Write Mark an email</h3>
      <label className="sr-only" htmlFor="m-sub">Subject</label>
      <input id="m-sub" className="m-input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      <label className="sr-only" htmlFor="m-msg">Message</label>
      <textarea id="m-msg" className="m-input" placeholder="Message" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      <a className="m-btn m-btn-block" href={href}>Open in my email app</a>
    </>
  );
}

type TermLine = { cmd: boolean; text: string; prompt?: string };
type TermOs = 'windows' | 'mac' | 'linux';
const PROMPTS: Record<TermOs, string> = { windows: 'PS C:\\Users\\mark>', mac: 'mark@portfolio ~ %', linux: 'mark@linux:~$' };

// Terminal history lives outside the component, so it survives leaving the app.
const useMobileTerm = create<{ lines: TermLine[]; history: string[]; os: TermOs; set: (p: Partial<{ lines: TermLine[]; history: string[]; os: TermOs }>) => void }>((set) => ({
  lines: [
    { cmd: true, text: 'whoami', prompt: PROMPTS.linux },
    { cmd: false, text: terminalText.whoami },
    { cmd: false, text: terminalText.intro },
  ],
  history: [],
  os: 'linux',
  set: (p) => set(p),
}));

/** The phone Terminal: type a command, or tap one. Same commands as the desktop, on any of the three OSes. */
function MobileTerminal({ onOpen, onSearch }: { onOpen: (target: string) => void; onSearch: (q: string) => void }) {
  const { lines, history, os, set } = useMobileTerm();
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const [guide, setGuide] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const net = { windows: 'ipconfig /all', mac: 'ifconfig', linux: 'ip a' }[os];

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  // A command sent from Help Desk "Try it": switch to its OS and run it.
  useEffect(() => {
    const c = useTermQueue.getState().take();
    if (!c) return;
    const on = (c.os ?? os) as TermOs;
    set({ os: on });
    run(c.cmd, on);
  }, []);

  const run = (c: string, on: TermOs = os) => {
    if (!c.trim()) return;
    const r = runCommand(c, { skin: on, shell: 0 });
    const now = useMobileTerm.getState().lines;
    set({ lines: r.clear ? [] : [...now, { cmd: true, text: c, prompt: PROMPTS[on] }, ...r.lines.map((t) => ({ cmd: false, text: t }))], history: [c, ...history].slice(0, 50) });
    if (r.guide) setGuide(true);
    // nslookup, ping and traceroute print once the lookup answers.
    r.later?.then((more) => {
      const cur = useMobileTerm.getState().lines;
      useMobileTerm.getState().set({ lines: [...cur, ...more.map((t) => ({ cmd: false, text: t }))] });
    });
    // Commands that open something (open resume, search intune, sudo hire mark)
    // open the matching phone screen after a moment, so the output is seen first.
    if (r.open) setTimeout(() => onOpen(r.open!), 700);
    if (r.search) setTimeout(() => onSearch(r.search!), 700);
  };
  const recall = (step: 1 | -1) => {
    if (!history.length) return;
    const i = Math.max(-1, Math.min(history.length - 1, histIdx + step));
    setHistIdx(i);
    setInput(i < 0 ? '' : history[i]);
    field.current?.focus();
  };

  return (
    <>
      <div className="m-term-os" role="group" aria-label="Operating system">
        {(['windows', 'mac', 'linux'] as TermOs[]).map((o) => (
          <button key={o} type="button" aria-pressed={os === o} onClick={() => set({ os: o })}>
            {{ windows: 'Windows', mac: 'macOS', linux: 'Linux' }[o]}
          </button>
        ))}
      </div>
      <div className="m-term" role="log" aria-live="polite" aria-label="Terminal output" onClick={() => field.current?.focus()}>
        {lines.map((l, i) => <div key={i} className={l.cmd ? 'm-term-cmd' : ''}>{l.cmd ? `${l.prompt ?? '$'} ${l.text}` : l.text || '\u00a0'}</div>)}
        <form
          className="m-term-input"
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
            setInput('');
            setHistIdx(-1);
          }}
        >
          <label htmlFor="m-term-in" className="m-term-cmd">{os === 'windows' ? 'PS>' : os === 'mac' ? '%' : '$'}</label>
          <input
            id="m-term-in"
            ref={field}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type a command"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-label="Command"
          />
          <button type="submit" className="m-term-run" aria-label="Run command">↵</button>
        </form>
        <div ref={bottom} />
      </div>
      <div className="m-chips">
        <button type="button" className="m-chip" aria-label="Previous command" disabled={!history.length} onClick={() => recall(1)}>↑</button>
        {['commands', 'help', 'whoami', 'projects', 'skills', net, 'nslookup google.com', 'search intune', os === 'windows' ? 'cls' : 'clear'].map((c) => (
          <button key={c} type="button" className="m-chip" onClick={() => run(c)}>{c}</button>
        ))}
      </div>
      {guide && (
        <CommandGuide
          phone
          os={os}
          onClose={() => setGuide(false)}
          onRun={(cmd, tab) => {
            setGuide(false);
            if (tab !== os) set({ os: tab });
            run(cmd, tab);
          }}
        />
      )}
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
