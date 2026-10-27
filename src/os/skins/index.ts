// The skin registry. Adding a skin: make a folder with WindowFrame, Shell,
// tokens.css and an index.ts exporting a Skin, add its id to SkinId in
// types.ts, then list it here. Nothing else changes.
import type { SkinId } from '../types';
import type { Skin } from './types';
import { windowsSkin } from './windows';
import { macSkin } from './mac';
import { linuxSkin } from './linux';
import { useSkinStore } from '../skinStore';

export const skins: Record<SkinId, Skin> = {
  windows: windowsSkin,
  mac: macSkin,
  linux: linuxSkin,
};

export function useSkin(): Skin {
  return skins[useSkinStore((s) => s.skin)];
}
