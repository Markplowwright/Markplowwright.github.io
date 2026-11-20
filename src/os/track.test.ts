import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { linkEventName, track } from './track';

describe('track', () => {
  const sent: string[] = [];
  beforeEach(() => {
    sent.length = 0;
    vi.stubGlobal('window', { vtrack: (n: string) => sent.push(n) });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('sends a name once per visit by default', () => {
    track('app/files-once');
    track('app/files-once');
    expect(sent).toEqual(['app/files-once']);
  });

  it('can send the same name every time', () => {
    track('link/github.com', false);
    track('link/github.com', false);
    expect(sent).toEqual(['link/github.com', 'link/github.com']);
  });

  it('does nothing and does not throw when the tracker is missing or fails', () => {
    vi.stubGlobal('window', {});
    expect(() => track('app/a-missing')).not.toThrow();
    vi.stubGlobal('window', { vtrack: () => { throw new Error('x'); } });
    expect(() => track('app/b-throws')).not.toThrow();
  });
});

describe('linkEventName', () => {
  const base = 'https://markplowwright.github.io/';
  it('names the resume and outside links by site only', () => {
    expect(linkEventName('/resume.pdf', base)).toBe('resume/open');
    expect(linkEventName('https://www.github.com/Markplowwright/x?secret=1', base)).toBe('link/github.com');
    expect(linkEventName('https://markplowwright.github.io/admin-practice-lab/', base)).toBeNull();
    expect(linkEventName('mailto:a@b.c', base)).toBeNull();
  });
});
