// The phone's startup and lock screens.
//
//   First visit on this phone: the logo startup screen, then the lock screen.
//   Later visits: no startup screen; Face ID unlocks (about 1.3 s) and
//   "Welcome back" shows in the middle.
//   Either way the visitor swipes up on the bottom strip to open, which hops
//   every couple of seconds as a prompt. Swipe only: a tap does not open it
//   (keyboard users can still press Enter, since they cannot swipe).
//   The welcome notification can be swiped left for View and Clear. View
//   asks the visitor to unlock first, like a locked iPhone.
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
const FACE_ID_MS = 1300;
/** After Face ID succeeds, the tick and "Welcome back" fade away after this long. */
const WELCOME_MS = 1500;

function Padlock({ open }: { open: boolean }) {
  return (
    // Wide enough for the open shackle, which lifts and moves right like iOS, so nothing is clipped.
    <svg className={`m-lock-pad${open ? ' is-open' : ''}`} width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">
      <path className="m-lock-shackle" d="M12 15V11.5a5 5 0 0 1 10 0V15" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="8.5" y="15" width="17" height="13" rx="3" fill="#fff" />
    </svg>
  );
}

/** The Face ID glyph: corner brackets around a face, then a tick. */
function FaceId({ done }: { done: boolean }) {
  return (
    <svg className={`m-faceid${done ? ' is-done' : ''}`} width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 20V12a6 6 0 0 1 6-6h8M44 6h8a6 6 0 0 1 6 6v8M58 44v8a6 6 0 0 1-6 6h-8M20 58h-8a6 6 0 0 1-6-6v-8" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      {done ? (
        <path className="m-faceid-tick" d="M20 33l8 8 16-17" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <g className="m-faceid-face" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
          <path d="M24 24v5M40 24v5M32 26v10h-3M24 43c4 4 12 4 16 0" />
        </g>
      )}
    </svg>
  );
}

/** The welcome notification: swipe left for View and Clear. */
function LockNotification({ onView, fade }: { onView: () => void; fade: number }) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [gone, setGone] = useState(false);
  const [shake, setShake] = useState(0);
  const [asked, setAsked] = useState(false);
  const start = useRef<{ x: number; base: number } | null>(null);
  const REVEAL = -150;

  if (gone) return null;
  const x = cleared ? -500 : dragging ? offset : open ? REVEAL : 0;

  return (
    <div className={`m-note-wrap${cleared ? ' is-cleared' : ''}`} style={{ opacity: cleared ? 0 : fade }} onTransitionEnd={() => cleared && setGone(true)}>
      <div className="m-note-row">
        {/* The buttons sit behind the see-through notification, so they only show as it slides. */}
        <div className="m-note-actions" aria-hidden={!open} style={{ opacity: Math.min(1, -x / 90) }}>
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => {
              setOpen(false);
              setShake((n) => n + 1);
              setAsked(true);
              onView();
            }}
          >
            View
          </button>
          <button type="button" tabIndex={open ? 0 : -1} onClick={() => setCleared(true)}>
            Clear
          </button>
        </div>
        <div
          key={shake}
          className={`m-lock-note${shake ? ' is-shake' : ''}`}
          style={{
            transform: `translateX(${x}px)`,
            transition: dragging ? 'none' : undefined,
          }}
          onPointerDown={(e) => {
            start.current = { x: e.clientX, base: open ? REVEAL : 0 };
            e.currentTarget.setPointerCapture(e.pointerId);
            setOffset(open ? REVEAL : 0);
            setDragging(true);
          }}
          onPointerMove={(e) => {
            const s = start.current;
            if (!s) return;
            setOffset(Math.max(REVEAL - 30, Math.min(0, s.base + e.clientX - s.x)));
          }}
          onPointerUp={() => {
            if (!start.current) return;
            start.current = null;
            setDragging(false);
            setOpen(offset < REVEAL / 2);
          }}
          onPointerCancel={() => {
            start.current = null;
            setDragging(false);
          }}
          role="group"
          aria-label={`Notification from ${profile.name}. Swipe left for View and Clear.`}
        >
          <img src="/brand/avatar.webp" alt="" width="38" height="38" draggable={false} />
          <div>
            <div className="m-lock-note-head">
              <strong>{profile.name}</strong>
              <span>now</span>
            </div>
            <div className="m-lock-note-title">Welcome to my portfolio</div>
            <div className="m-lock-note-body">Projects, IT tools and my resume, set up like a phone. Swipe up to look around.</div>
          </div>
        </div>
      </div>
      {asked && (
        <p className="m-note-ask" role="status">
          Swipe up to unlock
        </p>
      )}
    </div>
  );
}

export function MobileLock({ mode, onDone }: { mode: Exclude<LockMode, 'none'>; onDone: () => void }) {
  const now = useNow();
  const quick = reduceMotion();
  const [phase, setPhase] = useState<'boot' | 'locked' | 'opening'>(mode === 'first' ? 'boot' : 'locked');
  const [faceDone, setFaceDone] = useState(false);
  const [welcomeGone, setWelcomeGone] = useState(false);
  const [drag, setDrag] = useState(0);
  const [nudge, setNudge] = useState(0);
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

  // Returning: Face ID recognises the visitor. The phone still needs a swipe.
  useEffect(() => {
    if (mode !== 'returning') return;
    const t = setTimeout(() => setFaceDone(true), quick ? 300 : FACE_ID_MS);
    const u = setTimeout(() => setWelcomeGone(true), (quick ? 300 : FACE_ID_MS) + WELCOME_MS);
    return () => {
      clearTimeout(t);
      clearTimeout(u);
    };
  }, [mode, quick]);

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
  const padOpen = (mode === 'returning' && faceDone) || drag < -40 || phase === 'opening';

  return (
    <div className={`m-lock${phase === 'opening' ? ' is-opening' : ''}${quick ? ' is-quick' : ''}`} style={style} role="dialog" aria-label="Lock screen">
      <div className="m-lock-top">
        <Padlock open={padOpen} />
        <div className="m-lock-date">{fmt.dateLong(now)}</div>
        <div className="m-lock-time">{lockTime(now)}</div>
      </div>

      <LockNotification fade={Math.max(0, 1 + drag / (height * 0.4))} onView={() => setNudge((n) => n + 1)} />

      {mode === 'returning' && (
        <div className={`m-lock-center${welcomeGone ? ' is-gone' : ''}`} aria-live="polite">
          <FaceId done={faceDone} />
          <div className={`m-lock-welcome${faceDone ? ' is-in' : ''}`}>{faceDone ? 'Welcome back' : 'Face ID'}</div>
        </div>
      )}

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
          // Far enough up: open. Otherwise the screen springs back and the strip hops as a hint.
          if (moved < -Math.min(120, height * 0.15)) open();
          else setNudge((n) => n + 1);
          setDrag(0);
        }}
        onPointerCancel={() => {
          start.current = null;
          setDrag(0);
        }}
      >
        <span key={nudge} className={`m-lock-hop${nudge ? ' is-nudge' : ''}`}>
          <span className="m-lock-arrow" aria-hidden="true" />
          <span className="m-lock-hint">Swipe up to open</span>
          <span className="m-lock-bar" aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
