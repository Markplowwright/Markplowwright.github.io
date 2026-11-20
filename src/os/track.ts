// Visit counting. The tracker script (see the visit-tracker repo) is loaded in index.html and
// adds window.vtrack. This file is the only place the site talks to it.
//
// Only fixed names are sent (an app id, a file id, a site name). Nothing a visitor types is ever
// sent. If the script is missing (blocked, offline, localhost) every call quietly does nothing.

type Tracker = { vtrack?: (name: string) => void };

const seen = new Set<string>();

/** Sends one event. With once (the default) the same name is sent at most once per visit. */
export function track(name: string, once = true) {
  if (typeof window === 'undefined') return;
  if (once) {
    if (seen.has(name)) return;
    seen.add(name);
  }
  try {
    (window as unknown as Tracker).vtrack?.(name);
  } catch {
    // counting must never break the site
  }
}

/** The event name for a link: resume opens and links that leave the site (site name only). */
export function linkEventName(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    const here = new URL(base);
    if (u.host === here.host) return u.pathname === '/resume.pdf' ? 'resume/open' : null;
    return /^https?:$/.test(u.protocol) ? 'link/' + u.hostname.replace(/^www\./, '') : null;
  } catch {
    return null;
  }
}

/** Counts clicks on links. Called once at start-up. */
export function startLinkTracking() {
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element | null)?.closest?.('a[href]');
      if (!a) return;
      const name = linkEventName((a as HTMLAnchorElement).href, window.location.href);
      if (name) track(name, false);
    },
    true,
  );
}
