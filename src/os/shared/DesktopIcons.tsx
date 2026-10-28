// Icons on the desktop. One click opens (visitors may not think to double-click).
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

  return (
    <div className="desk-icons" role="group" aria-label="Desktop">
      {items.map((i) => (
        <button
          key={i.key}
          type="button"
          className="desk-icon"
          onClick={i.open}
        >
          {i.social ? <SocialTile id={i.social} size={Math.round(size * 0.86)} className="desk-social" /> : <AppIcon app={i.icon} skin={skin.id} size={size} />}
          <span className="desk-label">{i.label}</span>
        </button>
      ))}
    </div>
  );
}
