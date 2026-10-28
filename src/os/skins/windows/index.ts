import type { Skin } from '../types';
import { WindowFrame } from './WindowFrame';
import { Shell } from './Shell';
import './tokens.css';

export const windowsSkin: Skin = {
  id: 'windows',
  label: 'Windows',
  WindowFrame,
  Shell,
  terminalPrompt: (user) => `PS C:\\Users\\${user}>`,
  shells: [
    { name: 'PowerShell', prompt: (user) => `PS C:\\Users\\${user}>` },
    { name: 'Command Prompt', prompt: (user) => `C:\\Users\\${user}>` },
  ],
  defaultWallpaper: 'bloom',
  insets: { top: 0, bottom: 48, left: 0 },
  filesView: 'list',
  words: {
    trash: 'Recycle Bin',
    sidebar: 'QUICK ACCESS',
    properties: 'Properties',
    personalize: 'Personalize',
    unlock: 'Sign in',
    aboutPc: 'About your PC',
    focus: 'Do not disturb',
    types: { folder: 'File folder', doc: 'Text Document', pdf: 'PDF Document', slides: 'Presentation', image: 'Image file', video: 'MP4 Video', link: 'Internet Shortcut' },
  },
};
