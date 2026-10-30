// The phone's startup and lock screens, kept deliberately light: nothing
// animates while the lock screen sits there.
//
//   First visit on this phone: the logo startup screen, then the lock screen.
//   Later visits: the same lock screen, without the startup screen.
//   The visitor swipes up on the bottom strip to open (swipe only; keyboard
//   users can press Enter, since they cannot swipe).
//   Same visit (reload, back to the tab) and shared links: no lock screen.
import { useEffect, useRef, useState } from 'react';
import { profile } from '../content/profile';
import { fmt, useNow } from '../os/shared/hooks';

const SEEN = 'mp-phone-unlocked'; // localStorage: opened once on this phone
const VISIT = 'mp-phone-visit'; // sessionStorage: already inside this visit

const read = (store: () => Storage, key: string) => {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
};
const write = (store: () => Storage, key: string) => {
  try {
    store().setItem(key, '1');
  } catch {
    /* private browsing: the visitor just gets the first-visit screens again */
  }
};

export type LockMode = 'first' | 'returning' | 'none';

/** Which lock screen this page load gets. */
export function lockModeForThisVisit(deepLink: boolean): LockMode {
  const sameVisit = read(() => sessionStorage, VISIT);
  write(() => sessionStorage, VISIT);
  if (deepLink || sameVisit) return 'none';
  return read(() => localStorage, SEEN) ? 'returning' : 'first';
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
// iPhone lock screens show 9:41, without AM/PM.
const lockTime = (d: Date) => fmt.time(d).replace(/\s?[AP]\.?M\.?$/i, '');

function Padlock({ open }: { open: boolean }) {
  return (
    // Wide enough for the open shackle (shown while swiping), so nothing is clipped.
    <svg className={`m-lock-pad${open ? ' is-open' : ''}`} width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">
      <path className="m-lock-shackle" d="M12 15V11.5a5 5 0 0 1 10 0V15" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="8.5" y="15" width="17" height="13" rx="3" fill="#fff" />
    </svg>
  );
}

export function MobileLock({ mode, onDone }: { mode: Exclude<LockMode, 'none'>; onDone: () => void }) {
  const now = useNow();
  const quick = reduceMotion();
  const [phase, setPhase] = useState<'boot' | 'locked' | 'opening'>(mode === 'first' ? 'boot' : 'locked');
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const opened = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;

  const open = () => {
    if (opened.current) return;
    opened.current = true;
    setPhase('opening');
    write(() => localStorage, SEEN);
    setTimeout(() => done.current(), quick ? 120 : 380);
  };

  // First visit: the startup screen, then the lock screen.
  useEffect(() => {
    if (phase !== 'boot') return;
    const t = setTimeout(() => setPhase('locked'), quick ? 500 : 1500);
    return () => clearTimeout(t);
  }, [phase, quick]);

  if (phase === 'boot')
    return (
      <div className="m-boot" role="status" aria-label="Starting up">
        <img src="/brand/logo-mark.webp" alt="" width="240" height="143" />
        <div className="m-boot-bar">
          <div />
        </div>
      </div>
    );

  const height = typeof window === 'undefined' ? 800 : window.innerHeight;
  const style = phase === 'opening' ? { transform: 'translateY(-100%)' } : drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined;

  return (
    <div className={`m-lock${phase === 'opening' ? ' is-opening' : ''}${quick ? ' is-quick' : ''}`} style={style} role="dialog" aria-label="Lock screen">
      <div className="m-lock-top">
        <Padlock open={drag < -40 || phase === 'opening'} />
        <div className="m-lock-date">{fmt.dateLong(now)}</div>
        <div className="m-lock-time">{lockTime(now)}</div>
      </div>

      {/* A still notification: no swiping, no blur. */}
      <div className="m-lock-note">
        <img src="/brand/avatar.webp" alt="" width="38" height="38" />
        <div>
          <div className="m-lock-note-head">
            <strong>{profile.name}</strong>
            <span>now</span>
          </div>
          <div className="m-lock-note-title">Welcome to my portfolio</div>
          <div className="m-lock-note-body">Projects, IT tools and my resume, set up like a phone. Swipe up to look around.</div>
        </div>
      </div>

      {/* Only this strip takes the swipe, so the page never scrolls or refreshes. */}
      <button
        type="button"
        className="m-lock-swipe"
        aria-label="Swipe up to open (or press Enter)"
        onClick={(e) => {
          // Swipe only: taps do nothing. e.detail is 0 for Enter or Space, so keyboard users can open it.
          if (e.detail === 0) open();
        }}
        onPointerDown={(e) => {
          start.current = e.clientY;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (start.current === null) return;
          setDrag(Math.min(0, e.clientY - start.current));
        }}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const moved = e.clientY - start.current;
          start.current = null;
          // Far enough up: open. Otherwise the screen springs back down.
          if (moved < -Math.min(120, height * 0.15)) open();
          setDrag(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDrag(0);
        }}
      >
        <span className="m-lock-arrow" aria-hidden="true" />
        <span className="m-lock-hint">Swipe up to open</span>
        <span className="m-lock-bar" aria-hidden="true" />
      </button>
    </div>
  );
}
