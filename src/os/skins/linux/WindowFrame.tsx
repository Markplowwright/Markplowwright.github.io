import type { WindowFrameProps } from '../types';

// Linux (GNOME-like) style: header bar with a centered title, round controls on the right.
export function WindowFrame({ title, onMinimize, onToggleMaximize, onClose, titleBarProps, children, win }: WindowFrameProps) {
  return (
    <>
      <header className="titlebar" {...titleBarProps}>
        <span className="tb-title">{title}</span>
        <div className="tb-controls">
          <button type="button" aria-label={`Minimize ${title}`} onClick={onMinimize}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 5h8" stroke="currentColor" strokeWidth="1.4" /></svg>
          </button>
          <button type="button" aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${title}`} onClick={onToggleMaximize}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
          </button>
          <button type="button" aria-label={`Close ${title}`} onClick={onClose}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.4" /></svg>
          </button>
        </div>
      </header>
      <div className="window-body">{children}</div>
    </>
  );
}
