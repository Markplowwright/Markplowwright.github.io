// Browser app: a links page. It does not embed other sites; links open in a new tab.
import { useSkinStore } from '../../os/skinStore';
import { browserText, links } from '../../content/links';

export default function BrowserApp() {
  const wifi = useSkinStore((s) => s.wifi);
  return (
    <div className="browser">
      <div className="toolbar">
        <span className="tool-btn" aria-hidden="true">Home</span>
        <div className="address" aria-label="Address">{browserText.address}</div>
      </div>
      <div className="browser-page">
        {wifi ? (
          <>
            <h2>{browserText.heading}</h2>
            <p className="muted">{browserText.intro}</p>
            <div className="link-grid">
              {links.map((l) => (
                <a key={l.name} className="link-card" href={l.url} target="_blank" rel="noopener noreferrer">
                  <strong>{l.name}</strong>
                  <span className="muted">{l.note}</span>
                </a>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>{browserText.offlineTitle}</h2>
            <p className="muted">{browserText.offlineBody}</p>
          </>
        )}
      </div>
    </div>
  );
}
