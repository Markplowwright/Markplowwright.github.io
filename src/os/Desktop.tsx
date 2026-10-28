// The desktop: wallpaper, icons, widget, the windows layer, the current skin's
// shell (taskbar / menu bar and dock / top panel) and the shared overlays.
import { useEffect, type MouseEvent } from 'react';
import { useSkin } from './skins';
import { useSkinStore } from './skinStore';
import { useUiStore } from './uiStore';
import { activeWindowId, useWindowStore } from './windowStore';
import { Window } from './Window';
import { Wallpaper } from './shared/Wallpaper';
import { DesktopIcons } from './shared/DesktopIcons';
import { ContextMenu, Dimmer, QuickSettings, SnapPreview, Switcher, Toast, Widget } from './shared/Overlays';
import { BootScreen, LockScreen } from './shared/BootAndLock';
import { openSearch, openTarget } from './actions';
import { queryParam } from './storage';
import { tipTimes, tips, welcome } from '../content/tips';

/** Shows the welcome toast after sign-in, then the guided tips one at a time. */
function useTips() {
  const stage = useUiStore((s) => s.lockStage);
  useEffect(() => {
    if (stage !== 2) return;
    const timers = [setTimeout(() => useUiStore.getState().notify(welcome.title, welcome.body), 500)];
    tips.forEach((t, i) => {
      timers.push(
        setTimeout(() => {
          if (useSkinStore.getState().tipsOn && useUiStore.getState().lockStage === 2) useUiStore.getState().notify(t.title, t.body, i);
        }, tipTimes[i] * 1000),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [stage]);
}

/** Keyboard shortcuts that work inside the page. */
function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useUiStore.getState();
      // Alt + ` opens the window switcher (Alt+Tab belongs to the real OS).
      if (e.altKey && (e.key === '`' || e.code === 'Backquote')) {
        e.preventDefault();
        ui.set({ switcherOpen: !ui.switcherOpen, launcherOpen: false, panelOpen: false });
      } else if (e.key === 'Escape') {
        ui.closeOverlays();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export function Desktop() {
  const skin = useSkin();
  const mode = useSkinStore((s) => s.mode);
  const windows = useWindowStore((s) => s.windows);
  const active = activeWindowId(windows);
  useTips();
  useShortcuts();

  // data-skin and data-mode on <html> switch the CSS variables for the whole page.
  useEffect(() => {
    document.documentElement.dataset.skin = skin.id;
    document.documentElement.dataset.mode = mode;
  }, [skin.id, mode]);

  // Track the screen size so windows can be kept on screen.
  useEffect(() => {
    const onResize = () => useUiStore.getState().set({ viewport: { width: window.innerWidth, height: window.innerHeight } });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ?open=<app or file id> is a deep link: skip the boot and lock screens and open it.
  useEffect(() => {
    const target = queryParam('open');
    const q = queryParam('q');
    if (q !== null) {
      openSearch(q);
      useUiStore.getState().set({ booted: true, lockStage: 2 });
    } else if (target && openTarget(target)) useUiStore.getState().set({ booted: true, lockStage: 2 });
  }, []);

  // Clicking anywhere outside a menu or panel closes it. Elements marked
  // data-keep (the menus and the buttons that open them) are ignored.
  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-keep]')) return;
    const ui = useUiStore.getState();
    if (ui.ctx || ui.panelOpen || (skin.id === 'windows' && ui.launcherOpen)) {
      ui.set({ ctx: null, panelOpen: false, launcherOpen: skin.id === 'windows' ? false : ui.launcherOpen });
    }
  };

  // Right-click on the empty desktop opens the desktop menu.
  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest('section, [data-keep], nav, header')) return;
    useUiStore.getState().set({ ctx: { x: e.clientX, y: e.clientY, kind: 'desktop' }, panelOpen: false });
  };

  return (
    <div className="desktop" onClick={onClick} onContextMenu={onContextMenu}>
      <Wallpaper />
      <main className="desktop-main" aria-label={`${skin.label} style desktop`}>
        <h1 className="sr-only">Mark Plowright, portfolio</h1>
        <DesktopIcons />
        <Widget />
        {windows.map((w) => (
          <Window key={w.id} win={w} active={w.id === active} />
        ))}
      </main>
      <SnapPreview />
      <skin.Shell />
      <ContextMenu />
      <QuickSettings />
      <Toast />
      <Switcher />
      <Dimmer />
      <LockScreen />
      <BootScreen />
    </div>
  );
}
