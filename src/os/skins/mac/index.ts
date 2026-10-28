import type { Skin } from '../types';
import { WindowFrame } from './WindowFrame';
import { Shell } from './Shell';
import './tokens.css';

export const macSkin: Skin = {
  id: 'mac',
  label: 'macOS',
  WindowFrame,
  Shell,
  terminalPrompt: (user) => `${user}@portfolio ~ %`,
  shells: [
    { name: 'zsh', prompt: (user) => `${user}@portfolio ~ %` },
    { name: 'bash', prompt: () => 'bash-3.2$' },
  ],
  defaultWallpaper: 'dusk',
  insets: { top: 28, bottom: 0, left: 0 },
  filesView: 'grid',
  words: {
    trash: 'Trash',
    sidebar: 'Favorites',
    properties: 'Get Info',
    personalize: 'Change Desktop Background',
    unlock: 'Enter',
    aboutPc: 'About This Mac',
    focus: 'Focus',
    types: { folder: 'Folder', doc: 'Plain Text', pdf: 'PDF Document', slides: 'Presentation', image: 'Image', video: 'MPEG-4 Movie', link: 'Web Location' },
  },
};
