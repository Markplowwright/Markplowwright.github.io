import { describe, expect, it } from 'vitest';
import { fileTree } from './fileTree';
import { findAnswer, inTab, popularSearches, questionSearches, search, searchIndex, skillAnswers, suggest } from './search';

const ids = (q: string) => search(q).results.map((d) => d.id);

describe('search', () => {
  it('points every result and proof link at something that exists', () => {
    for (const d of searchIndex) if ('node' in d.target) expect(fileTree[d.target.node], d.id).toBeDefined();
    for (const a of skillAnswers) for (const p of a.proof) if ('node' in p.target) expect(fileTree[p.target.node], `${a.id}: ${p.label}`).toBeDefined();
  });

  it('finds projects by name, shorthand and question', () => {
    expect(ids('home lab')[0]).toBe('p-homelab');
    expect(ids('Does Mark know AD?')).toContain('p-homelab');
    expect(ids('GPO')).toContain('p-homelab-shots/2 Group Policy');
    expect(ids('intune')[0]).toBe('p-admin');
    expect(ids('gradaisle')[0]).toBe('p-grad');
  });

  it('answers skill questions with proof', () => {
    expect(findAnswer('Does Mark know Group Policy?')?.id).toBe('gpo');
    expect(findAnswer('AD')?.id).toBe('ad');
    expect(findAnswer('Has Mark used Intune?')?.id).toBe('intune');
    expect(findAnswer('wireshark')?.id).toBe('network');
    expect(findAnswer('chess')).toBeUndefined();
  });

  it('has results for every suggested search', () => {
    for (const q of [...popularSearches, ...questionSearches]) expect(search(q).results.length, q).toBeGreaterThan(0);
  });

  it('splits results into tabs', () => {
    const r = search('intune').results;
    expect(r.filter((d) => inTab(d, 'images')).length).toBeGreaterThan(0);
    expect(search('video').results.filter((d) => inTab(d, 'videos'))).toHaveLength(1);
    expect(r.filter((d) => inTab(d, 'all')).every((d) => d.type !== 'image')).toBe(true);
  });

  it('suggests while typing, and never searches poems', () => {
    expect(suggest('gro').some((s) => s.text === 'Group Policy')).toBe(true);
    expect(suggest('int').length).toBeGreaterThan(2);
    expect(ids('poems').some((id) => id.includes('poem'))).toBe(false);
    expect(search('zzzz').results).toHaveLength(0);
  });
});
