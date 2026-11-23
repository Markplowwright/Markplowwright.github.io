// OPT Employer Checker app: what it is, where to get it, screenshots, what the
// chips mean and how it is built. Used by the desktop window and the phone.
import { useState } from 'react';
import { OptMark } from '../../os/OptMark';
import { projects } from '../../content/projects';
import { optCheckerShots } from '../../content/optCheckerScreenshots';
import './optchecker.css';

const project = projects.find((p) => p.id === 'p-opt')!;
const link = (start: string) => project.links.find((l) => l.label.startsWith(start))?.url ?? '';

// One example of each chip the extension draws.
const CHIPS: { cls: string; text: string; means: string }[] = [
  { cls: 'is-ok', text: 'E-Verify: enrolled', means: 'An open E-Verify enrollment is on file.' },
  { cls: 'is-off', text: 'E-Verify: ended', means: 'Only ended enrollments are on file.' },
  { cls: 'is-off', text: 'E-Verify: not found', means: 'Not in the data. Not a verdict: coverage is over 99%, not 100%.' },
  { cls: 'is-off', text: 'E-Verify: couldn’t check', means: 'The data could not be loaded. Never means “not enrolled”.' },
  { cls: 'is-h1b', text: 'H-1B: 12 · FY2025', means: 'H-1B petitions approved in the latest full fiscal year.' },
];

export function OptCheckerView({ phone, onOpenProject }: { phone?: boolean; onOpenProject?: () => void }) {
  const [i, setI] = useState(0);
  const shot = optCheckerShots[i];
  return (
    <div className={`opt${phone ? ' is-phone' : ''}`}>
      <header className="opt-hero">
        <OptMark size={phone ? 64 : 72} />
        <div>
          <h1>OPT Employer Checker</h1>
          <p>E-Verify and H-1B chips next to employers on LinkedIn job pages, so F-1 and OPT job seekers can spot problems before they accept an offer.</p>
          <div className="opt-status">Live on the Chrome Web Store · v1.0.0 · Free</div>
        </div>
      </header>

      <div className="opt-actions">
        <a className="opt-btn is-main" href={link('Chrome Web Store')} target="_blank" rel="noopener noreferrer">Add to Chrome (free)</a>
        <a className="opt-btn" href={link('About page')} target="_blank" rel="noopener noreferrer">About page</a>
        <a className="opt-btn" href={link('GitHub')} target="_blank" rel="noopener noreferrer">GitHub</a>
        <a className="opt-btn" href={link('Case study')} target="_blank" rel="noopener noreferrer">Case study</a>
        {onOpenProject && (
          <button type="button" className="opt-btn" onClick={onOpenProject}>Open project folder</button>
        )}
      </div>

      <section aria-label="Screenshots">
        <h2>Screenshots</h2>
        <figure className="opt-shot">
          <img src={shot.src} alt={shot.caption} loading="lazy" />
          <figcaption>{shot.caption}</figcaption>
        </figure>
        <div className="opt-thumbs" role="group" aria-label="Choose a screenshot">
          {optCheckerShots.map((s, k) => (
            <button key={s.src} type="button" className={k === i ? 'is-on' : ''} aria-label={`Screenshot ${k + 1}: ${s.name.replace(/\.jpg$/, '')}`} aria-pressed={k === i} onClick={() => setI(k)}>
              <img src={s.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>What the chips mean</h2>
        <ul className="opt-chips">
          {CHIPS.map((c) => (
            <li key={c.text}>
              <span className={`opt-chip ${c.cls}`}>{c.text}</span>
              <span>{c.means}</span>
            </li>
          ))}
        </ul>
        <p className="opt-note">It cannot tell you an employer will sign an I-983. This is not legal advice, and your DSO is the authority. Unofficial: not affiliated with DHS, USCIS, E-Verify or LinkedIn.</p>
      </section>

      <section>
        <h2>How it is built</h2>
        <ul className="opt-built">
          {project.built.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="opt-tech">{project.tech.join(' · ')}</p>
      </section>
    </div>
  );
}
