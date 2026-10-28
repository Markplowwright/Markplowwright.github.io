// Icons on the desktop. One click opens (visitors may not think to double-click).
import { useLayoutEffect, useState } from 'react';
import { useUiStore } from '../uiStore';
import { useSkinStore } from '../skinStore';
import { AppIcon } from '../AppIcon';
import { useSkin } from '../skins';
import { openApp, openNode } from '../actions';
import { SOCIALS, SocialTile, openSocial } from '../SocialIcon';

export function DesktopIcons() {
  const skin = useSkin();
  const items: { key: string; icon: string; label: string; open: () => void; social?: (typeof SOCIALS)[number]['id'] }[] = [
    { key: 'about', icon: 'folder', label: 'About Mark', open: () => openNode('about') },
    { key: 'resume', icon: 'pdf', label: 'Resume.pdf', open: () => openNode('resume') },
  ];
  // macOS keeps Trash in the dock, the others show it on the desktop.
  if (skin.id !== 'mac') items.push({ key: 'trash', icon: 'trash', label: skin.words.trash, open: () => openNode('trash') });
  items.push({ key: 'browser', icon: 'browser', label: 'Browser', open: () => openApp('browser') });
  items.push({ key: 'network', icon: 'network', label: 'Network Map', open: () => openApp('network') });
  // Mark's profiles and email, the same as on the phone.
  for (const x of SOCIALS) items.push({ key: x.id, icon: '', label: x.label, open: () => openSocial(x.id), social: x.id });
  const size = skin.id === 'mac' ? 58 : skin.id === 'linux' ? 52 : 46;

  // macOS: icons run down the right edge. Any that don't fit go in a second
  // column below the clock widget instead of underneath it.
  const height = useUiStore((s) => s.viewport.height);
  const widgetOn = useSkinStore((s) => s.widgets);
  const [below, setBelow] = useState(0);
  const mac = skin.id === 'mac';
  const fit = mac ? Math.max(1, Math.floor((height - 28 - 14 - 88) / 112)) : items.length;
  useLayoutEffect(() => {
    if (!mac) return;
    const w = document.querySelector('.widget');
    if (!w) {
      setBelow(0);
      return;
    }
    // Follow the widget as it changes size (fonts loading, the clock text).
    const measure = () => setBelow(Math.round(w.getBoundingClientRect().bottom) + 14);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(w);
    return () => ro.disconnect();
  }, [mac, height, widgetOn]);

  const render = (list: typeof items) =>
    list.map((i) => (
        <button
          key={i.key}
          type="button"
          className="desk-icon"
          onClick={i.open}
        >
          {i.social ? <SocialTile id={i.social} size={Math.round(size * 0.86)} className="desk-social" /> : <AppIcon app={i.icon} skin={skin.id} size={size} />}
          <span className="desk-label">{i.label}</span>
        </button>
    ));

  return (
    <>
      <div className="desk-icons" role="group" aria-label="Desktop">
        {render(items.slice(0, fit))}
      </div>
      {fit < items.length && (
        <div className="desk-icons desk-icons-more" role="group" aria-label="More desktop icons" style={below ? { top: below } : undefined}>
          {render(items.slice(fit))}
        </div>
      )}
    </>
  );
}
