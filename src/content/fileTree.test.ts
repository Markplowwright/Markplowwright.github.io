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
    expect(pathTo('poems')).toEqual(['about', 'interests', 'writing', 'poems']);
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
