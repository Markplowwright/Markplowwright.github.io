import type { WindowFrameProps } from '../types';
import { AppIcon } from '../../AppIcon';

// Windows style: small app icon and title on the left, minimize / maximize / close on the right.
export function WindowFrame({ title, icon, onMinimize, onToggleMaximize, onClose, titleBarProps, children, win }: WindowFrameProps) {
  return (
    <>
      <header className="titlebar" {...titleBarProps}>
        <span className="tb-icon">
          <AppIcon app={icon} skin="windows" size={16} />
        </span>
        <span className="tb-title">{title}</span>
        <div className="tb-controls">
          <button type="button" aria-label={`Minimize ${title}`} onClick={onMinimize}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M0 5h10" stroke="currentColor" /></svg>
          </button>
          <button type="button" aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${title}`} onClick={onToggleMaximize}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="0.5" y="0.5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" /></svg>
          </button>
          <button type="button" className="tb-close" aria-label={`Close ${title}`} onClick={onClose}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M0 0L10 10M10 0L0 10" stroke="currentColor" /></svg>
          </button>
        </div>
      </header>
      <div className="window-body">{children}</div>
    </>
  );
}
