// The phone's startup and lock screens.
//
//   First visit on this phone: the logo startup screen, then a lock screen the
//   visitor swipes up to open (only the bottom strip takes the swipe, with a
//   bouncing arrow as a guide, and the screen follows the finger).
//   Any later visit: a "Welcome back" lock screen that unlocks itself after
//   about a second, like Face ID. A tap or swipe skips the wait.
//   Same visit (reload, back to the tab) and shared links: no lock screen.
import { useEffect, useRef, useState } from 'react';
import { profile } from '../content/profile';
import { fmt, useNow } from '../os/shared/hooks';

const SEEN = 'mp-phone-unlocked'; // localStorage: swiped open once on this phone
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
    /* private browsing: the lock simply shows again next time */
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
    <svg className={`m-lock-pad${open ? ' is-open' : ''}`} width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
      <path className="m-lock-shackle" d="M6 11V7.5a5 5 0 0 1 10 0V11" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="2.5" y="11" width="17" height="13" rx="3" fill="#fff" />
    </svg>
  );
}

export function MobileLock({ mode, onDone }: { mode: Exclude<LockMode, 'none'>; onDone: () => void }) {
  const now = useNow();
  const quick = reduceMotion();
  const [phase, setPhase] = useState<'boot' | 'locked' | 'opening'>(mode === 'first' ? 'boot' : 'locked');
  const [drag, setDrag] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const start = useRef<number | null>(null);
  const dragged = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;

  const opened = useRef(false);
  const open = () => {
    if (opened.current) return;
    opened.current = true;
    setUnlocked(true);
    setPhase('opening');
    write(() => localStorage, SEEN);
    setTimeout(() => done.current(), quick ? 120 : 380);
  };
  const openRef = useRef(open);
  openRef.current = open;

  // First visit: the startup screen, then the lock screen.
  useEffect(() => {
    if (phase !== 'boot') return;
    const t = setTimeout(() => setPhase('locked'), quick ? 500 : 1500);
    return () => clearTimeout(t);
  }, [phase, quick]);

  // Returning: the padlock opens, then the screen slides away by itself.
  useEffect(() => {
    if (mode !== 'returning' || phase !== 'locked') return;
    const a = setTimeout(() => setUnlocked(true), quick ? 150 : 450);
    const b = setTimeout(() => openRef.current(), quick ? 400 : 1100);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [mode, phase, quick]);

  if (phase === 'boot')
    return (
      <div className="m-boot" role="status" aria-label="Starting up">
        <img src="/brand/logo-mark.webp" alt="" width="240" height="143" />
        <div className="m-boot-bar"><div /></div>
      </div>
    );

  const height = typeof window === 'undefined' ? 800 : window.innerHeight;
  const style = phase === 'opening' ? { transform: 'translateY(-100%)' } : drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined;

  return (
    <div
      className={`m-lock${phase === 'opening' ? ' is-opening' : ''}${quick ? ' is-quick' : ''}`}
      style={style}
      role="dialog"
      aria-label="Lock screen"
      onClick={mode === 'returning' ? open : undefined}
    >
      <div className="m-lock-top">
        <Padlock open={unlocked || drag < -40} />
        <div className="m-lock-date">{fmt.dateLong(now)}</div>
        <div className="m-lock-time">{lockTime(now)}</div>
      </div>

      <div className="m-lock-note" style={{ opacity: Math.max(0, 1 + drag / (height * 0.4)) }}>
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

      {/* Only this strip takes the swipe, so the page itself never scrolls or refreshes. */}
      <button
        type="button"
        className="m-lock-swipe"
        aria-label={mode === 'first' ? 'Swipe up or tap to open' : 'Welcome back. Opening.'}
        onClick={(e) => {
          e.stopPropagation();
          // A drag that was let go too early is not a tap.
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          open();
        }}
        onPointerDown={(e) => {
          start.current = e.clientY;
          dragged.current = false;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (start.current === null) return;
          const moved = e.clientY - start.current;
          if (Math.abs(moved) > 8) dragged.current = true;
          setDrag(Math.min(0, moved));
        }}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const moved = e.clientY - start.current;
          start.current = null;
          // Far enough up: open. Otherwise the screen springs back down.
          if (moved < -Math.min(120, height * 0.15)) {
            dragged.current = false;
            open();
          }
          setDrag(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDrag(0);
        }}
      >
        <span className="m-lock-arrow" aria-hidden="true" />
        <span className="m-lock-hint">{mode === 'first' ? 'Swipe up to open' : 'Welcome back'}</span>
        <span className="m-lock-bar" aria-hidden="true" />
      </button>
    </div>
  );
}
