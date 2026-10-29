// The "commands" guide: every Terminal command by OS and type, with what it
// does and why. Clicking a command runs it. Used on the desktop (inside the
// Terminal window) and on the phone (full screen).
import { useEffect, useRef, useState } from 'react';
import { commandGuide, guideSections, osLabel, type GuideOs } from '../../content/commandGuide';
import './guide.css';

type Props = {
  /** The OS the Terminal is using now; its tab opens first. */
  os: GuideOs;
  onRun: (cmd: string, os: GuideOs) => void;
  onClose: () => void;
  /** Desktop only: commands for another OS show its tip instead of running. */
  note?: (tab: GuideOs) => string | undefined;
  phone?: boolean;
};

const TABS: GuideOs[] = ['windows', 'mac', 'linux'];

export function CommandGuide({ os, onRun, onClose, note, phone }: Props) {
  const [tab, setTab] = useState<GuideOs>(os);
  const heading = useRef<HTMLHeadingElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  // Focus the guide once when it opens; Escape closes it.
  useEffect(() => {
    heading.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const rows = commandGuide.filter((e) => e.os.includes(tab));
  const tip = note?.(tab);

  return (
    <div className={`cg${phone ? ' is-phone' : ''}`} role="dialog" aria-label="Terminal commands" onClick={(e) => e.stopPropagation()}>
      <div className="cg-head">
        <h2 ref={heading} tabIndex={-1}>Terminal commands</h2>
        <button type="button" className="cg-close" onClick={onClose} aria-label="Close the command guide">
          {phone ? '‹ Terminal' : '×'}
        </button>
      </div>
      <div className="cg-tabs" role="tablist" aria-label="Operating system">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className="cg-tab" onClick={() => setTab(t)}>
            {osLabel[t]}
            {t === os && <span className="cg-now"> · now</span>}
          </button>
        ))}
      </div>
      <p className="cg-hint">{tip ?? 'Click a command to try it.'}</p>
      <div className="cg-body">
        {guideSections.map((section) => {
          const list = rows.filter((e) => e.section === section);
          if (!list.length) return null;
          return (
            <section key={section} className="cg-section">
              <h3>{section}</h3>
              <table className="cg-table">
                <thead className="sr-only">
                  <tr>
                    <th scope="col">Command</th>
                    <th scope="col">What it does and why</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((e) => (
                    <tr key={e.cmd}>
                      <th scope="row">
                        <button type="button" className="cg-cmd" onClick={() => onRun(e.cmd, tab)} title={`Run: ${e.cmd}`}>
                          {e.cmd}
                        </button>
                      </th>
                      <td>{e.does}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </div>
  );
}
