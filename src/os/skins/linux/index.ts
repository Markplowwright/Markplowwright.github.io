import type { Skin } from '../types';
import { WindowFrame } from './WindowFrame';
import { Shell } from './Shell';
import './tokens.css';

export const linuxSkin: Skin = {
  id: 'linux',
  label: 'Linux',
  WindowFrame,
  Shell,
  terminalPrompt: (user) => `${user}@linux:~$`,
  shells: [
    { name: 'bash', prompt: (user) => `${user}@linux:~$` },
    { name: 'zsh', prompt: (user) => `${user}@linux ~ %` },
  ],
  defaultWallpaper: 'sunset',
  insets: { top: 32, bottom: 0, left: 68 },
  filesView: 'grid',
  words: {
    trash: 'Trash',
    sidebar: 'Places',
    properties: 'Properties',
    personalize: 'Change Background',
    unlock: 'Unlock',
    aboutPc: 'About',
    focus: 'Do not disturb',
    types: { folder: 'Folder', doc: 'Text', pdf: 'PDF document', slides: 'Presentation', image: 'PNG image', link: 'Link' },
  },
};
