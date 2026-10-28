// The boot animation and the lock screen.
import { useEffect, useRef } from 'react';
import { useUiStore } from '../uiStore';
import { useSkin } from '../skins';
import { profile } from '../../content/profile';
import { fmt, useNow } from './hooks';

export function BootScreen() {
  const booted = useUiStore((s) => s.booted);
  useEffect(() => {
    if (booted) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => useUiStore.getState().set({ booted: true }), reduce ? 600 : 2400);
    return () => clearTimeout(t);
  }, [booted]);
  return (
    <div className={`boot${booted ? ' is-done' : ''}`} aria-hidden={booted}>
      <img className="boot-logo" src="/brand/logo-mark.webp" alt="" width="320" height="191" />
      <div className="boot-name">{profile.osName}</div>
      <div className="boot-bar">
        <div />
      </div>
    </div>
  );
}

export function LockScreen() {
  const stage = useUiStore((s) => s.lockStage);
  const booted = useUiStore((s) => s.booted);
  const skin = useSkin();
  const now = useNow();
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (booted && stage === 0) btnRef.current?.focus();
  }, [booted, stage]);
  if (stage === 2) return null;
  const unlock = () => {
    useUiStore.getState().set({ lockStage: 1 });
    setTimeout(() => useUiStore.getState().set({ lockStage: 2 }), 450);
  };
  return (
    <div className={`lock${stage === 1 ? ' is-leaving' : ''}`} role="dialog" aria-label="Lock screen">
      <div className="lock-time">{fmt.time(now)}</div>
      <div className="lock-date">{fmt.dateLong(now)}</div>
      <img className="lock-avatar" src="/brand/avatar.webp" alt="" width="84" height="84" />
      <div className="lock-name">{profile.fullName}</div>
      <button ref={btnRef} type="button" className="lock-btn" onClick={unlock}>
        {skin.words.unlock}
      </button>
      <div className="lock-tag">{profile.role}</div>
    </div>
  );
}
