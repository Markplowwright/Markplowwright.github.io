// Fails the build (npm test runs in the deploy workflow) if any wallpaper has
// no license, so nothing ships without a recorded source.
import { describe, expect, it } from 'vitest';
import { defaultWallpaper, wallpapers } from './wallpapers';

describe('wallpapers', () => {
  for (const [skin, list] of Object.entries(wallpapers)) {
    it(`${skin}: has 3 wallpapers, each with a license`, () => {
      expect(list).toHaveLength(3);
      for (const wp of list) expect(wp.license.trim(), `${skin}/${wp.id} needs a license`).not.toBe('');
    });
  }

  it('default light and dark wallpapers exist', () => {
    for (const [skin, d] of Object.entries(defaultWallpaper)) {
      const list = wallpapers[skin as keyof typeof wallpapers];
      expect(list[d.light]).toBeDefined();
      expect(list[d.dark]).toBeDefined();
    }
  });
});
