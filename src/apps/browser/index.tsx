// Browser app: MarkSearch, a search engine for this portfolio. Back and
// Forward walk through earlier searches. Results open inside the OS; outside
// links (LinkedIn, GitHub, live sites) open in a new tab.
import { useState } from 'react';
import { useSkinStore } from '../../os/skinStore';
import { openNode } from '../../os/actions';
import { browserText } from '../../content/links';
import { shareUrl, type Target } from '../../content/search';
import { useBrowserEntry, useBrowserStore } from './store';
import { SearchView } from './SearchView';

export function openTargetOnDesktop(t: Target) {
  if ('href' in t) window.open(t.href, '_blank', 'noopener');
  else openNode(t.node);
}

export default function BrowserApp() {
  const wifi = useSkinStore((s) => s.wifi);
  const entry = useBrowserEntry();
  const { i, stack, go, back, forward } = useBrowserStore();
  const [copied, setCopied] = useState(false);
  const link = entry.q ? shareUrl(entry.q) : 'https://markplowwright.github.io/';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="browser sx-host">
      <div className="toolbar">
        <button type="button" className="nav-btn" aria-label="Back" disabled={i === 0} onClick={back}>‹</button>
        <button type="button" className="nav-btn" aria-label="Forward" disabled={i >= stack.length - 1} onClick={forward}>›</button>
        <button type="button" className="nav-btn" aria-label="Search home" onClick={() => go('')}>⌂</button>
        <div className="address" aria-label="Address">
          <span className="address-text">{link.replace(/^https:\/\//, '')}</span>
        </div>
        {entry.q && (
          <button type="button" className="tool-btn" onClick={copy} aria-live="polite">
            {copied ? 'Copied' : 'Copy link'}
          </button>
        )}
      </div>
      {wifi ? (
        <SearchView entry={entry} onSearch={(q, tab) => go(q, tab)} onOpen={openTargetOnDesktop} />
      ) : (
        <div className="browser-page">
          <h2>{browserText.offlineTitle}</h2>
          <p className="muted">{browserText.offlineBody}</p>
        </div>
      )}
    </div>
  );
}
