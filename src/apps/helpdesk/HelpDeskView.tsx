// Help Desk: a ServiceNow-style queue of practice tickets. The first item
// explains Mark's method; each ticket shows his steps, sample evidence, the
// outcome, and things to try in the portfolio. Used on the desktop and phone.
import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { method, priorityLabel, tickets, type Ticket, type TryIt } from '../../content/helpdesk';
import './helpdesk.css';

type Filter = 'All' | Ticket['state'];
const METHOD = 'method';

/** `code` in Mark's steps becomes a code span. */
function withCode(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>,
  );
}

function MethodView() {
  return (
    <article className="hd-ticket" aria-labelledby="hd-method-title">
      <p className="hd-kicker">Start here</p>
      <h2 id="hd-method-title">How Mark works a ticket</h2>
      <p className="hd-muted">The same pattern for every problem. Each ticket in the queue follows it.</p>
      <ol className="hd-method">
        {method.map((m) => (
          <li key={m.title}>
            <strong>{m.title}:</strong> {m.text}
          </li>
        ))}
      </ol>
      <p className="hd-note">These are practice tickets: common problems and how Mark handles them. Callers are fictional and the evidence is sample output.</p>
    </article>
  );
}

function TicketView({ t, onTry }: { t: Ticket; onTry: (x: TryIt) => void }) {
  return (
    <article className="hd-ticket" aria-labelledby="hd-title">
      <p className="hd-kicker">{t.number}</p>
      <h2 id="hd-title">{t.title}</h2>
      <dl className="hd-fields">
        <div><dt>Caller</dt><dd>{t.caller}</dd></div>
        <div><dt>Category</dt><dd>{t.category}</dd></div>
        <div><dt>Priority</dt><dd>{priorityLabel[t.priority]}</dd></div>
        <div><dt>State</dt><dd><span className={`hd-state is-${t.state.toLowerCase()}`}>{t.state}</span></dd></div>
        <div><dt>Opened</dt><dd>{t.opened}</dd></div>
        <div><dt>Assigned to</dt><dd>Mark Plowright</dd></div>
      </dl>

      <h3>Reported</h3>
      <blockquote className="hd-quote">{t.reported}</blockquote>

      <h3>Work notes</h3>
      <ol className="hd-steps">
        {t.steps.map((s, i) => (
          <li key={i}>
            {withCode(s.text)}
            {s.sub && (
              <ul>
                {s.sub.map((x) => <li key={x}>{withCode(x)}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {t.evidence && (
        <>
          <h3>Evidence</h3>
          {t.evidence.map((e) => (
            <figure key={e.title} className="hd-evidence">
              <figcaption>{e.title}</figcaption>
              <pre>{e.lines.join('\n')}</pre>
            </figure>
          ))}
        </>
      )}

      <h3>{t.state === 'Escalated' ? 'Why it was escalated' : 'Resolution'}</h3>
      <p>{t.resolution}</p>

      {t.escalation && (
        <figure className="hd-evidence is-escalation">
          <figcaption>Escalation note</figcaption>
          <pre>{t.escalation.join('\n')}</pre>
        </figure>
      )}

      {t.tryIt && (
        <>
          <h3>Try it here</h3>
          <div className="hd-try">
            {t.tryIt.map((x) => (
              <button key={x.label} type="button" className="hd-try-btn" onClick={() => onTry(x)}>
                {x.label} ›
              </button>
            ))}
          </div>
        </>
      )}
    </article>
  );
}

export function HelpDeskView({ onTry, phone }: { onTry: (x: TryIt) => void; phone?: boolean }) {
  const [filter, setFilter] = useState<Filter>('All');
  const [sel, setSel] = useState<string>(METHOD);
  // Narrow screens show the list or one ticket, not both.
  const [showList, setShowList] = useState(!!phone);
  const detail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    detail.current?.scrollTo?.(0, 0);
  }, [sel]);

  const list = tickets.filter((t) => filter === 'All' || t.state === filter);
  const ticket = tickets.find((t) => t.number === sel);
  const pick = (id: string) => {
    setSel(id);
    setShowList(false);
  };

  return (
    <div className={`hd${phone ? ' is-phone' : ''}${showList ? ' show-list' : ' show-detail'}`}>
      {!phone && (
        <header className="hd-top">
          <strong>Help Desk</strong>
          <span className="hd-muted">Practice queue · Assigned to Mark Plowright</span>
        </header>
      )}
      <div className="hd-main">
        <nav className="hd-list" aria-label="Tickets">
          <button type="button" className={`hd-item is-method${sel === METHOD ? ' is-on' : ''}`} aria-current={sel === METHOD || undefined} onClick={() => pick(METHOD)}>
            <span className="hd-item-num">Start here</span>
            <span className="hd-item-title">How Mark works a ticket</span>
          </button>
          <div className="hd-filters" role="group" aria-label="Filter by state">
            {(['All', 'Resolved', 'Escalated'] as Filter[]).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          {list.map((t) => (
            <button key={t.number} type="button" className={`hd-item${sel === t.number ? ' is-on' : ''}`} aria-current={sel === t.number || undefined} onClick={() => pick(t.number)}>
              <span className="hd-item-num">
                {t.number} · <span className={`hd-p p${t.priority}`}>P{t.priority}</span>
              </span>
              <span className="hd-item-title">{t.title}</span>
              <span className={`hd-state is-${t.state.toLowerCase()}`}>{t.state}</span>
            </button>
          ))}
        </nav>
        <div className="hd-detail" ref={detail}>
          <button type="button" className="hd-back" onClick={() => setShowList(true)}>
            ‹ All tickets
          </button>
          {ticket ? <TicketView t={ticket} onTry={onTry} /> : <MethodView />}
        </div>
      </div>
    </div>
  );
}
