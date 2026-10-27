import type { WindowFrameProps } from '../types';

// macOS style: three colored dots on the left, centered title, rounded corners.
export function WindowFrame({ title, onMinimize, onToggleMaximize, onClose, titleBarProps, children, win }: WindowFrameProps) {
  return (
    <>
      <header className="titlebar" {...titleBarProps}>
        <div className="tb-controls">
          <button type="button" className="dot dot-close" aria-label={`Close ${title}`} onClick={onClose} />
          <button type="button" className="dot dot-min" aria-label={`Minimize ${title}`} onClick={onMinimize} />
          <button type="button" className="dot dot-max" aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${title}`} onClick={onToggleMaximize} />
        </div>
        <span className="tb-title">{title}</span>
      </header>
      <div className="window-body">{children}</div>
    </>
  );
}
