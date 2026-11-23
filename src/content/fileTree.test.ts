import { describe, expect, it } from 'vitest';
import { fileTree, folderPathFor, pathTo } from './fileTree';

describe('fileTree', () => {
  it('every child id exists', () => {
    for (const n of Object.values(fileTree)) for (const kid of n.kids ?? []) expect(fileTree[kid], `${n.id} -> ${kid}`).toBeDefined();
  });

  it('finds paths to nested nodes', () => {
    expect(pathTo('p-homelab')).toEqual(['about', 'work', 'p-homelab']);
    expect(folderPathFor('p-homelab-ov')).toEqual(['about', 'work', 'p-homelab']);
    expect(folderPathFor('t1')).toEqual(['trash']);
  });

  it('has the files the architecture asks for', () => {
    const about = fileTree.about.kids ?? [];
    for (const id of ['bio', 'resume', 'education', 'skills', 'contact', 'work', 'pres', 'interests']) expect(about).toContain(id);
    expect(pathTo('int-writing')).toEqual(['about', 'interests', 'int-writing']);
    expect(fileTree.poems).toBeUndefined();
    for (const id of fileTree.work.kids ?? []) {
      if (id === 'earlier') continue;
      const names = (fileTree[id].kids ?? []).map((k) => fileTree[k].name);
      expect(names).toEqual(expect.arrayContaining(['Overview.txt', 'What I built.txt', 'Links.txt']));
    }
  });
});

describe('home lab screenshots', () => {
  it('builds a nested Screenshots folder with every image', () => {
    const shots = fileTree['p-homelab-shots'];
    expect(fileTree['p-homelab'].kids).toContain('p-homelab-shots');
    expect(shots.kids?.length).toBe(6);
    const images = Object.values(fileTree).filter((n) => n.id.startsWith('p-homelab-shots#'));
    expect(images.length).toBe(50);
    expect(pathTo('p-homelab-shots#0')).toEqual(['about', 'work', 'p-homelab', 'p-homelab-shots', 'p-homelab-shots/1 Active Directory', 'p-homelab-shots#0']);
  });
});

describe('admin lab screenshots', () => {
  it('replaces the single screenshot with a Screenshots folder and a video', () => {
    const kids = fileTree['p-admin'].kids ?? [];
    expect(kids).toContain('p-admin-shots');
    expect(kids).not.toContain('p-admin-shot');
    const all = Object.values(fileTree).filter((n) => n.id.startsWith('p-admin-shots#'));
    expect(all.filter((n) => n.kind === 'image')).toHaveLength(14);
    const video = all.find((n) => n.kind === 'video');
    expect(video?.src).toMatch(/\.mp4$/);
    expect(video?.poster).toBeTruthy();
    expect(fileTree['p-homelab'].kids).not.toContain('p-homelab-shot');
  });
});

describe('OPT Employer Checker', () => {
  it('links to the Chrome Web Store and the About page, with a Screenshots folder', () => {
    const links = fileTree['p-opt-links'].body ?? '';
    expect(links).toContain('https://chromewebstore.google.com/detail/opt-employer-checker/');
    expect(links).toContain('https://markplowwright.github.io/opt-employer-checker/');
    expect(fileTree['p-opt'].kids).toContain('p-opt-shots');
    expect(pathTo('p-opt')).toEqual(['about', 'work', 'p-opt']);
  });
});
