// Event Viewer / Console / Logs: sample security events and how to respond.
import { useState } from 'react';
import { events } from '../../content/events';

export default function EventLogApp() {
  const [sel, setSel] = useState(0);
  const e = events[sel];
  return (
    <div className="eventlog">
      <div className="side side-wide" role="listbox" aria-label="Events">
        {events.map((ev, i) => (
          <button key={ev.title} type="button" role="option" aria-selected={sel === i} className={`list-btn${sel === i ? ' is-on' : ''}`} onClick={() => setSel(i)}>
            <span className="ev-title">{ev.title}</span>
            <span className={`ev-meta level-${ev.level.toLowerCase()}`}>{ev.source} · {ev.level} · {ev.time}</span>
          </button>
        ))}
      </div>
      <div className="ev-detail">
        <h2>{e.title}</h2>
        <div className="muted">{e.source} · {e.level} · {e.time} (sample event)</div>
        <h3>What it means</h3>
        <p>{e.means}</p>
        <h3>Right response</h3>
        <p>{e.fix}</p>
      </div>
    </div>
  );
}
