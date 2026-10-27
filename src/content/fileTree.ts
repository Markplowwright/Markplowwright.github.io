// The folder tree shown in the Files app. It is built from the other content
// files, so adding a project or a presentation adds it here automatically.
import { profile } from './profile';
import { skills } from './skills';
import { projects, type Project } from './projects';
import { presentations, research } from './presentations';

export type FileKind = 'folder' | 'doc' | 'pdf' | 'slides' | 'image' | 'link';

export type FsNode = {
  id: string;
  name: string;
  kind: FileKind;
  /** Child ids, for folders. */
  kids?: string[];
  /** Text shown in the preview pane and the Viewer. */
  body?: string;
  /** File URL (PDF, image) or outside link. */
  src?: string;
  /** Special Viewer layouts. */
  special?: 'contact' | 'slides';
  /** For slides: which presentation. */
  presentationId?: string;
};

export const ROOTS = ['about', 'trash'] as const;

function buildTree(): Record<string, FsNode> {
  const nodes: Record<string, FsNode> = {};
  const add = (n: FsNode) => {
    nodes[n.id] = n;
  };

  add({ id: 'about', name: 'About Mark', kind: 'folder', kids: ['bio', 'resume', 'experience', 'skills', 'contact', 'work', 'pres'] });
  add({ id: 'bio', name: 'Bio.txt', kind: 'doc', body: profile.bio.join('\n\n') });
  add({ id: 'resume', name: 'Resume.pdf', kind: 'pdf', src: '/resume.pdf', body: `${profile.fullName}. ${profile.summary}` });
  add({
    id: 'experience',
    name: 'Experience.txt',
    kind: 'doc',
    body: profile.experience
      .map((j) => `${j.title}, ${j.company}\n${j.period} · ${j.location}\n${j.points.map((p) => `• ${p}`).join('\n')}`)
      .concat([`Education\n${profile.education.degree}\n${profile.education.school}, ${profile.education.location} · ${profile.education.period}`])
      .join('\n\n'),
  });
  add({ id: 'skills', name: 'Skills.txt', kind: 'doc', body: skills.map((s) => `${s.group}: ${s.items.join(', ')}.`).join('\n\n') });
  add({
    id: 'contact',
    name: 'Contact.txt',
    kind: 'doc',
    special: 'contact',
    body: `Email: ${profile.email}\nLinkedIn: ${profile.links.linkedin.replace('https://www.', '')}\nGitHub: ${profile.links.github.replace('https://', '')}`,
  });

  const addProject = (p: Project) => {
    const kids = [`${p.id}-ov`, `${p.id}-built`, `${p.id}-links`];
    add({ id: `${p.id}-ov`, name: 'Overview.txt', kind: 'doc', body: `${p.blurb}\n\nProblem\n${p.problem}\n\nOutcome\n${p.outcome}` });
    add({
      id: `${p.id}-built`,
      name: 'What I built.txt',
      kind: 'doc',
      body: `${p.built.map((b) => `• ${b}`).join('\n')}\n\nTech\n${p.tech.join(', ')}`,
    });
    add({ id: `${p.id}-links`, name: 'Links.txt', kind: 'doc', body: p.links.map((l) => `${l.label}: ${l.url}`).join('\n') });
    if (p.screenshot) {
      kids.push(`${p.id}-shot`);
      add({ id: `${p.id}-shot`, name: 'Screenshot.png', kind: 'image', src: p.screenshot.src, body: p.screenshot.alt });
    }
    (p.extraFiles || []).forEach((f) => {
      kids.push(f.id);
      add({ id: f.id, name: f.name, kind: f.kind, src: f.src, body: f.body });
    });
    add({ id: p.id, name: p.name, kind: 'folder', kids, body: p.blurb });
  };
  projects.forEach(addProject);
  const current = projects.filter((p) => !p.earlier).map((p) => p.id);
  const earlier = projects.filter((p) => p.earlier).map((p) => p.id);
  add({ id: 'earlier', name: 'Earlier projects', kind: 'folder', kids: earlier, body: 'Projects from before 2025.' });
  add({ id: 'work', name: 'Work & Projects', kind: 'folder', kids: [...current, 'earlier'] });

  presentations.forEach((p) => {
    add({ id: p.id, name: p.fileName, kind: 'slides', special: 'slides', presentationId: p.id, src: p.pdf, body: p.summary });
  });
  research.forEach((r) => add({ id: r.id, name: r.name, kind: r.kind, src: r.src, body: r.body }));
  add({ id: 'research', name: 'Research', kind: 'folder', kids: research.map((r) => r.id), body: 'Papers and publications.' });
  add({ id: 'pres', name: 'Presentations', kind: 'folder', kids: [...presentations.map((p) => p.id), 'research'] });

  add({ id: 'trash', name: 'Trash', kind: 'folder', kids: ['t1', 't2', 't3'] });
  add({ id: 't1', name: 'old_resume_v1.docx', kind: 'doc', body: 'A very early draft. Deleted for good reasons.' });
  add({ id: 't2', name: 'notes_final_FINAL_v2.txt', kind: 'doc', body: 'Not actually final.' });
  add({ id: 't3', name: 'screenshot (47).png', kind: 'doc', body: 'Forty-six others are also in here somewhere.' });
  return nodes;
}

export const fileTree: Record<string, FsNode> = buildTree();

/** Path of folder ids from a root to the given node (inclusive). */
export function pathTo(id: string): string[] {
  const walk = (cur: string, trail: string[]): string[] | null => {
    const here = [...trail, cur];
    if (cur === id) return here;
    for (const kid of fileTree[cur].kids || []) {
      const r = walk(kid, here);
      if (r) return r;
    }
    return null;
  };
  return walk('about', []) || walk('trash', []) || ['about'];
}

/** The folder path to open for a node: the node itself for folders, its parent folder for files. */
export function folderPathFor(id: string): string[] {
  const p = pathTo(id);
  return fileTree[id]?.kids ? p : p.slice(0, -1);
}
