// The Browser's search engine. It only searches this portfolio: projects,
// screenshots, presentations, experience, education, skills, interests and
// Mark's public profiles. Everything is built from the other content files,
// so new content becomes searchable without extra work. Pure functions, so
// the desktop, the phone and the Terminal all share it.
import { fileTree, pathTo } from './fileTree';
import { projects } from './projects';
import { presentations, research } from './presentations';
import { profile } from './profile';
import { skills } from './skills';
import { creativeSite, interests, writing } from './interests';
import { firstThumb, countText, label } from './gallery';

export const engineName = 'Plowright Search';

export type Target = { node: string } | { href: string };
export type DocType = 'project' | 'folder' | 'page' | 'link' | 'image' | 'video';
export type Tab = 'all' | 'projects' | 'images' | 'videos';

export type SearchDoc = {
  id: string;
  title: string;
  /** The grey line under the title: a folder path or a web address. */
  where: string;
  snippet: string;
  type: DocType;
  target: Target;
  thumb?: string;
  /** Lowercased text the query is matched against. */
  hay: string;
  titleLower: string;
  boost: number;
};

/** A short answer shown above the results, with links to the proof. */
export type SkillAnswer = {
  id: string;
  title: string;
  answer: string;
  aliases: string[];
  proof: { label: string; target: Target }[];
};

// ---------------------------------------------------------------- the index

const lower = (s: string) => s.toLowerCase();
const crumbs = (id: string) => pathTo(id).map((p) => label(fileTree[p])).join(' › ');
const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

function doc(d: Omit<SearchDoc, 'hay' | 'titleLower' | 'boost'> & { terms?: string[]; boost?: number }): SearchDoc {
  return {
    ...d,
    hay: ` ${lower([d.title, d.snippet, ...(d.terms ?? [])].join(' '))} `.replace(/\s+/g, ' '),
    titleLower: ` ${lower(d.title)} `,
    boost: d.boost ?? 0,
  };
}

function buildIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  // About Mark
  docs.push(
    doc({ id: 'bio', title: 'About Mark', where: crumbs('bio'), snippet: profile.bio[0], type: 'page', target: { node: 'bio' }, terms: [...profile.bio, profile.summary, 'about bio profile who'], boost: 2 }),
    doc({ id: 'resume', title: 'Resume (PDF)', where: crumbs('resume'), snippet: profile.summary, type: 'page', target: { node: 'resume' }, terms: ['resume cv pdf download'], boost: 3 }),
    doc({ id: 'contact', title: 'Contact Mark', where: crumbs('contact'), snippet: `Email Mark at ${profile.email}, or connect on LinkedIn.`, type: 'page', target: { node: 'contact' }, terms: ['contact email hire reach message'], boost: 2 }),
    doc({
      id: 'experience',
      title: 'Work experience',
      where: crumbs('experience'),
      snippet: profile.experience.map((j) => `${j.title}, ${j.company}`).join(' · '),
      type: 'page',
      target: { node: 'experience' },
      terms: ['experience work jobs career employment', ...profile.experience.flatMap((j) => [j.title, j.company, j.location, ...j.points])],
      boost: 2,
    }),
    doc({
      id: 'education',
      title: 'Education',
      where: crumbs('education'),
      snippet: profile.education.map((e) => `${e.degree}, ${e.school}`).join(' · '),
      type: 'page',
      target: { node: 'education' },
      terms: ['education school university college degree', ...profile.education.flatMap((e) => [e.school, e.degree, e.location])],
      boost: 2,
    }),
    doc({
      id: 'skills',
      title: 'Technical skills',
      where: crumbs('skills'),
      snippet: skills.map((s) => s.group).join(' · '),
      type: 'page',
      target: { node: 'skills' },
      terms: ['skills', ...skills.flatMap((s) => [s.group, ...s.items])],
      boost: 1,
    }),
  );

  // Public profiles and live sites
  docs.push(
    doc({ id: 'linkedin', title: 'Mark Plowright on LinkedIn', where: host(profile.links.linkedin), snippet: `${profile.role}. Work history, education and skills.`, type: 'link', target: { href: profile.links.linkedin }, terms: ['linkedin social profile'], boost: 3 }),
    doc({ id: 'github', title: 'Markplowwright on GitHub', where: host(profile.links.github), snippet: 'Code for the labs, scripts and this portfolio.', type: 'link', target: { href: profile.links.github }, terms: ['github code repositories repos social'], boost: 3 }),
  );

  // Projects, their files, their links and their screenshots
  for (const p of projects) {
    const live = p.links.find((l) => !l.url.includes('github.com'));
    docs.push(
      doc({
        id: p.id,
        title: p.name,
        where: crumbs(p.id),
        snippet: p.blurb,
        type: 'project',
        target: { node: p.id },
        thumb: p.gallery ? firstThumb(`${p.id}-shots`) : p.screenshot?.src,
        terms: ['project projects built', p.category, p.problem, p.outcome, ...p.built, ...p.tech],
        boost: p.earlier ? 8 : 11,
      }),
    );
    if (live) docs.push(doc({ id: `${p.id}-live`, title: `${p.name}: ${live.label}`, where: host(live.url), snippet: p.blurb, type: 'link', target: { href: live.url }, terms: [p.name, 'live site demo website'], boost: 1 }));
    for (const f of p.extraFiles ?? []) docs.push(doc({ id: f.id, title: f.name.replace(/\.pdf$/, ''), where: crumbs(f.id), snippet: f.body, type: 'page', target: { node: f.id }, terms: [p.name, 'paper research pdf'], boost: 2 }));
    if (!p.gallery) continue;
    const rootId = `${p.id}-shots`;
    for (const n of Object.values(fileTree)) {
      if (n.id !== rootId && !n.id.startsWith(`${rootId}/`) && !n.id.startsWith(`${rootId}#`)) continue;
      const path = pathTo(n.id).map((id) => label(fileTree[id]));
      const terms = [p.name, ...path, 'screenshot screenshots'];
      if (n.kind === 'folder') {
        const top = n.id === rootId;
        docs.push(doc({ id: n.id, title: top ? `${p.name} screenshots` : `${label(n)} screenshots`, where: crumbs(n.id), snippet: `${countText(n.id)}. ${(n.kids ?? []).map((k) => label(fileTree[k])).join(', ')}.`, type: 'folder', target: { node: n.id }, thumb: firstThumb(n.id), terms, boost: top ? 2 : 1 }));
      } else if (n.kind === 'image' || n.kind === 'video') {
        docs.push(doc({ id: n.id, title: label(n), where: crumbs(n.id), snippet: n.body ?? '', type: n.kind, target: { node: n.id }, thumb: n.kind === 'video' ? n.poster : n.src, terms: n.kind === 'video' ? [...terms, 'video walkthrough tour demo'] : terms }));
      }
    }
  }

  // Presentations and research
  for (const p of presentations) docs.push(doc({ id: p.id, title: p.title, where: crumbs(p.id), snippet: p.summary, type: 'page', target: { node: p.id }, terms: ['presentation presentations slides seminar talk', p.context, ...p.tags], boost: 3 }));
  for (const r of research) docs.push(doc({ id: r.id, title: r.name.replace(/\.\w+$/, ''), where: crumbs(r.id), snippet: r.body ?? '', type: 'page', target: { node: r.id }, terms: ['research paper publication'], boost: 2 }));

  // Interests
  docs.push(doc({ id: 'interests', title: 'Interests', where: crumbs('interests'), snippet: 'Mark outside of work: music, chess, writing, reading, sports, games and audio.', type: 'page', target: { node: 'interests' }, terms: ['interests hobbies outside of work fun', ...interests.map((i) => i.title)], boost: 2 }));
  for (const i of interests) docs.push(doc({ id: i.id, title: i.title, where: crumbs(i.id), snippet: i.body.join(' '), type: 'page', target: { node: i.id }, terms: ['interests hobbies', i.summary] }));
  docs.push(doc({ id: 'int-writing', title: writing.title, where: crumbs('int-writing'), snippet: writing.body.join(' '), type: 'page', target: { node: 'int-writing' }, terms: ['interests hobbies writing writer', writing.summary] }));
  if (creativeSite.url) docs.push(doc({ id: 'creative', title: creativeSite.name, where: host(creativeSite.url), snippet: "Mark's poems and music, on their own site.", type: 'link', target: { href: creativeSite.url }, terms: ['poems poetry music songs creative'], boost: 2 }));

  return docs;
}

export const searchIndex: SearchDoc[] = buildIndex();

// ---------------------------------------------------------- skill answers

const shots = (folder: string) => ({ node: folder });

export const skillAnswers: SkillAnswer[] = [
  {
    id: 'ad',
    title: 'Active Directory',
    answer: 'Yes. Mark built a Windows Server 2025 domain controller for plowlab.local in Azure, created users, OUs and security groups, and joined a Windows 11 client to the domain. He also practices hybrid identity (AD users synced to Entra) in his Admin Practice Lab.',
    aliases: ['active directory', 'aduc', 'domain controller', 'ad ds', 'domain join', 'ou', 'ous'],
    proof: [
      { label: 'Active Directory screenshots', target: shots('p-homelab-shots/1 Active Directory') },
      { label: 'Windows Server Home Lab', target: { node: 'p-homelab' } },
      { label: 'Walkthrough video (AD in the Admin Practice Lab)', target: { node: 'p-admin-shots#0' } },
    ],
  },
  {
    id: 'gpo',
    title: 'Group Policy',
    answer: 'Yes. Mark built six GPOs in his home lab (password policy, account lockout, mapped drives, desktop wallpaper, Control Panel restriction and a USB block) and proved them on a domain-joined client with gpupdate and gpresult.',
    aliases: ['group policy', 'gpmc', 'gpupdate', 'gpresult'],
    proof: [
      { label: 'Group Policy screenshots (7 folders)', target: shots('p-homelab-shots/2 Group Policy') },
      { label: 'Client testing with gpresult', target: shots('p-homelab-shots/3 Client Testing') },
      { label: 'Windows Server Home Lab', target: { node: 'p-homelab' } },
    ],
  },
  {
    id: 'intune',
    title: 'Microsoft Intune',
    answer: 'Yes, in practice. Mark built the Admin Practice Lab, which simulates Intune end to end: Autopilot deployment profiles, compliance policies, enrolling a Windows laptop, wiping a device when someone leaves, and troubleshooting why a user cannot enroll.',
    aliases: ['intune', 'endpoint manager', 'autopilot', 'compliance policy', 'device enrollment', 'enrollment'],
    proof: [
      { label: 'Intune admin center screenshots', target: shots('p-admin-shots/3 Intune admin center') },
      { label: 'Windows laptop setup screenshots', target: shots('p-admin-shots/5 Windows laptop') },
      { label: 'Admin Practice Lab', target: { node: 'p-admin' } },
    ],
  },
  {
    id: 'entra',
    title: 'Microsoft Entra ID',
    answer: 'Yes, in practice. The Admin Practice Lab covers Entra ID users and groups, the MDM user scope that decides whether laptops enroll in Intune, Entra join and hybrid identity with Entra Connect.',
    aliases: ['entra', 'azure ad', 'azure active directory', 'aad', 'mfa', 'conditional access', 'entra connect'],
    proof: [
      { label: 'Entra admin center screenshot', target: shots('p-admin-shots/2 Entra admin center') },
      { label: 'Walkthrough video', target: { node: 'p-admin-shots#0' } },
      { label: 'Admin Practice Lab', target: { node: 'p-admin' } },
    ],
  },
  {
    id: 'm365',
    title: 'Microsoft 365 and Exchange',
    answer: 'Yes. Mark supports Office 365 users at work, and his Admin Practice Lab covers the Microsoft 365 admin center (users, licenses, offboarding) and Exchange mailboxes.',
    aliases: ['microsoft 365', 'exchange', 'mailbox', 'mailboxes', 'licenses', 'licensing', 'offboarding', 'onboarding'],
    proof: [
      { label: 'Microsoft 365 admin center screenshot', target: shots('p-admin-shots/1 Microsoft 365 admin center') },
      { label: 'Exchange admin center screenshot', target: shots('p-admin-shots/4 Exchange admin center') },
      { label: 'Offboarding mission screenshots', target: shots('p-admin-shots/7 Lab guide') },
    ],
  },
  {
    id: 'azure',
    title: 'Microsoft Azure',
    answer: 'Yes. Mark runs his Windows Server lab on an Azure VM with cost controls (auto-shutdown and a budget alert), and fixed client DNS by pointing the VNet DNS at the domain controller.',
    aliases: ['azure', 'cloud', 'vnet', 'virtual machine'],
    proof: [
      { label: 'Windows Server Home Lab', target: { node: 'p-homelab' } },
      { label: 'Home lab screenshots', target: shots('p-homelab-shots') },
    ],
  },
  {
    id: 'files',
    title: 'File servers and permissions',
    answer: 'Yes. Mark shared a folder with share and NTFS permissions, mapped it by hand and by GPO, and used FSRM for a 100 MB hard quota and active file screening.',
    aliases: ['fsrm', 'file share', 'file server', 'ntfs', 'permissions', 'quota', 'quotas', 'mapped drive', 'smb'],
    proof: [
      { label: 'File share and mapped drive screenshots', target: shots('p-homelab-shots/5 File Share and Mapped Drive') },
      { label: 'FSRM screenshots', target: shots('p-homelab-shots/6 FSRM') },
    ],
  },
  {
    id: 'passwords',
    title: 'Password and lockout policies',
    answer: 'Yes. Mark set a domain password policy (12 characters, complexity, 90-day maximum age), an account lockout policy, and fine-grained password policies for admins and users.',
    aliases: ['password policy', 'password', 'passwords', 'lockout', 'fine grained', 'fine-grained'],
    proof: [
      { label: 'Password Policy screenshots', target: shots('p-homelab-shots/2 Group Policy/2 Password Policy') },
      { label: 'Fine-grained password policy screenshots', target: shots('p-homelab-shots/4 Fine-Grained Password Policies') },
      { label: 'Account lockout screenshot', target: shots('p-homelab-shots/2 Group Policy/3 Account Lockout') },
    ],
  },
  {
    id: 'scripting',
    title: 'Scripting and automation',
    answer: 'Yes. Mark wrote bash tools for endpoint checks: a read-only health audit for macOS and a disk usage monitor that posts to Slack, scheduled with launchd or cron. He also uses PowerShell and Python.',
    aliases: ['bash', 'powershell', 'scripting', 'script', 'scripts', 'automation', 'shell', 'cron', 'launchd'],
    proof: [
      { label: 'endpoint-health-audit', target: { node: 'p-endpoint' } },
      { label: 'disk-usage-monitor', target: { node: 'p-disk' } },
    ],
  },
  {
    id: 'cli',
    title: 'Windows command line troubleshooting',
    answer: 'Yes. Mark uses ipconfig, ping, nslookup, gpupdate, gpresult and dsregcmd to troubleshoot, and built a Command Prompt and PowerShell command guide into his Admin Practice Lab.',
    aliases: ['command prompt', 'cmd', 'ipconfig', 'nslookup', 'dsregcmd', 'command line', 'cli', 'terminal'],
    proof: [
      { label: 'Command guide screenshots', target: shots('p-admin-shots/6 Command guide') },
      { label: 'Windows Terminal screenshot', target: shots('p-admin-shots/5 Windows laptop') },
      { label: 'Client testing with gpresult', target: shots('p-homelab-shots/3 Client Testing') },
    ],
  },
  {
    id: 'network',
    title: 'Networking and packet analysis',
    answer: 'Yes. Mark supports Wi-Fi, switches and firewalls at work, and analyses TCP, DNS, SSH, FTP and HTTP traffic with Wireshark, tshark and Python, including spotting SSH brute-force attempts.',
    aliases: ['wireshark', 'tshark', 'networking', 'network', 'tcp', 'dns', 'packet', 'pcap', 'firewall', 'firewalls', 'wifi', 'wi-fi'],
    proof: [
      { label: 'Network Traffic Analysis project', target: { node: 'p-traffic' } },
      { label: 'Network security seminar', target: { node: 'pres-netsec' } },
    ],
  },
  {
    id: 'mac',
    title: 'Mac support and Jamf',
    answer: 'Yes. Mark supports MacBooks and uses Jamf at work, and wrote a macOS health audit that checks FileVault, disk space, uptime and pending updates.',
    aliases: ['jamf', 'mac', 'macs', 'macos', 'macbook', 'apple', 'filevault'],
    proof: [
      { label: 'Work experience', target: { node: 'experience' } },
      { label: 'endpoint-health-audit', target: { node: 'p-endpoint' } },
    ],
  },
  {
    id: 'support',
    title: 'IT support and help desk',
    answer: 'Yes. Mark has worked in IT support since 2022 across K-12 schools, a university research lab and summer programs: tickets, Mac and Windows support, AV and video conferencing, and training users.',
    aliases: ['help desk', 'helpdesk', 'support', 'tickets', 'ticketing', 'servicenow', 'troubleshooting', 'service desk', 'av', 'video conferencing'],
    proof: [
      { label: 'Work experience', target: { node: 'experience' } },
      { label: 'Real-world ticket scenarios he built', target: shots('p-admin-shots/7 Lab guide') },
      { label: 'Resume', target: { node: 'resume' } },
    ],
  },
  {
    id: 'dev',
    title: 'Software development',
    answer: 'Yes. Mark co-founded GradAisle and built it end to end (Next.js, TypeScript, Postgres), built the Admin Practice Lab in plain JavaScript, and rewrote a Fortran 77 chemistry program in Python.',
    aliases: ['python', 'javascript', 'typescript', 'react', 'next.js', 'nextjs', 'sql', 'postgres', 'postgresql', 'web development', 'coding', 'programming', 'developer'],
    proof: [
      { label: 'GradAisle', target: { node: 'p-grad' } },
      { label: 'Admin Practice Lab', target: { node: 'p-admin' } },
      { label: 'PIMM Fortran Optimizer Re-engineer', target: { node: 'p-pimm' } },
    ],
  },
];

// ------------------------------------------------------------ the engine

/** Words that carry no meaning for this search ("does Mark know ..."). */
const STOP = new Set(
  'a an and any are about as at be can could did do does for from has have he him his how i id if in is it know knows me mark marks of on or show tell the to used use uses using was what where which who with worked'.split(' '),
);
/** Words dropped when other words are present ("Intune experience"). */
const SOFT = new Set(['experience', 'skill', 'skills', 'knowledge', 'familiar', 'good', 'built', 'build']);

/** Shorthand and other words people type, mapped to the words the content uses. */
const SYNONYMS: Record<string, string[]> = {
  ad: ['active directory'],
  gpo: ['group policy'],
  gpos: ['group policy'],
  gp: ['group policy'],
  aad: ['entra'],
  m365: ['microsoft 365'],
  o365: ['microsoft 365', 'office 365'],
  office: ['office 365', 'microsoft 365'],
  outlook: ['exchange'],
  email: ['exchange', 'contact'],
  mdm: ['intune'],
  cv: ['resume'],
  job: ['experience'],
  jobs: ['experience'],
  career: ['experience'],
  hire: ['contact'],
  reach: ['contact'],
  degree: ['education'],
  school: ['education'],
  college: ['education'],
  university: ['education'],
  hobbies: ['interests'],
  hobby: ['interests'],
  slides: ['presentation'],
  talk: ['presentation'],
  talks: ['presentation'],
  seminar: ['presentation'],
  pics: ['screenshot'],
  photos: ['screenshot'],
  images: ['screenshot'],
  demo: ['video', 'live'],
  ps: ['powershell'],
  scripting: ['bash', 'powershell', 'script'],
  helpdesk: ['help desk', 'support'],
  wifi: ['wi-fi'],
  macbook: ['mac'],
  socials: ['linkedin', 'github'],
  social: ['linkedin', 'github'],
};

const tokenize = (q: string) =>
  lower(q)
    .replace(/[’']s\b/g, '')
    .replace(/[^a-z0-9+#.\- ]+/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^[.\-]+|[.\-?]+$/g, ''))
    .filter(Boolean);

/** Query words with stop words removed, each with the variants it can match. */
export function queryTerms(q: string): string[][] {
  let words = tokenize(q).filter((w) => !STOP.has(w));
  if (words.some((w) => !SOFT.has(w))) words = words.filter((w) => !SOFT.has(w));
  return words.map((w) => [w, ...(SYNONYMS[w] ?? [])]);
}

// A variant matches at the start of a word, so "int" finds "Intune".
const has = (text: string, v: string) => text.includes(` ${v}`) || (v.length > 3 && text.includes(v));

function scoreDoc(d: SearchDoc, terms: string[][]): number {
  let score = 0;
  for (const variants of terms) {
    let best = 0;
    for (const v of variants) {
      if (d.titleLower.includes(` ${v} `)) best = Math.max(best, 14);
      else if (has(d.titleLower, v)) best = Math.max(best, 10);
      else if (has(d.hay, v)) best = Math.max(best, 4);
    }
    if (!best) return 0;
    score += best;
  }
  return score + d.boost;
}

export type SearchResult = { answer?: SkillAnswer; results: SearchDoc[]; partial: boolean };

export function findAnswer(q: string): SkillAnswer | undefined {
  const terms = queryTerms(q);
  if (!terms.length) return undefined;
  const words = ` ${terms.map((t) => t[0]).join(' ')} `;
  const variants = new Set(terms.flat());
  let best: { a: SkillAnswer; n: number } | undefined;
  for (const a of skillAnswers) {
    const n = a.aliases.filter((al) => variants.has(al) || words.includes(` ${al} `)).length;
    if (n && (!best || n > best.n)) best = { a, n };
  }
  return best?.a;
}

export function search(q: string): SearchResult {
  const terms = queryTerms(q);
  if (!terms.length) return { results: [], partial: false };
  const rank = (ts: string[][]) =>
    searchIndex
      .map((d) => ({ d, s: scoreDoc(d, ts) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.d);
  let results = rank(terms);
  let partial = false;
  // Nothing matches every word: show what matches any of them.
  if (!results.length && terms.length > 1) {
    const seen = new Set<string>();
    results = terms.flatMap((t) => rank([t])).filter((d) => !seen.has(d.id) && !!seen.add(d.id));
    partial = results.length > 0;
  }
  return { answer: findAnswer(q), results, partial };
}

export const inTab = (d: SearchDoc, tab: Tab) =>
  tab === 'images' ? d.type === 'image' : tab === 'videos' ? d.type === 'video' : tab === 'projects' ? d.type === 'project' || d.type === 'folder' : d.type !== 'image' && d.type !== 'video';

// ----------------------------------------------------------- suggestions

/** Shown on the search home page and when a search finds nothing. */
export const popularSearches = [
  'Active Directory',
  'Group Policy',
  'Intune',
  'Entra ID',
  'Microsoft 365 admin',
  'Azure home lab',
  'Scripting',
  'Wireshark',
  'IT support experience',
  'Presentations',
  'Education',
  'LinkedIn',
  'Walkthrough video',
  'Interests',
];

export const questionSearches = [
  'Does Mark know Active Directory?',
  'Has Mark used Intune?',
  'Does Mark know Group Policy?',
  'What has Mark built?',
  'How can I contact Mark?',
];

export type Suggestion = { text: string; doc?: SearchDoc };

/** Up to n suggestions for the text typed so far: searches first, then pages. */
export function suggest(q: string, n = 7): Suggestion[] {
  const t = lower(q.trim());
  if (!t) return popularSearches.slice(0, n).map((text) => ({ text }));
  const searches = [...popularSearches, ...questionSearches, ...skillAnswers.map((a) => a.title)]
    .filter((s, i, all) => all.indexOf(s) === i)
    .filter((s) => ` ${lower(s)}`.includes(` ${t}`) || (t.length > 2 && lower(s).includes(t)))
    .slice(0, 4)
    .map((text) => ({ text }));
  const pages = search(q)
    .results.filter((d) => d.type !== 'image')
    .slice(0, n - searches.length)
    .map((doc) => ({ text: doc.title, doc }));
  return [...searches, ...pages].slice(0, n);
}

/** "People also search for": popular searches other than this one. */
export function relatedSearches(q: string, n = 6): string[] {
  const t = lower(q.trim());
  const seed = [...t].reduce((a, c) => a + c.charCodeAt(0), 0);
  const pool = popularSearches.filter((s) => lower(s) !== t);
  return Array.from({ length: Math.min(n, pool.length) }, (_, i) => pool[(seed + i * 5) % pool.length]).filter((s, i, all) => all.indexOf(s) === i);
}

/** The real address that opens this search, for sharing. */
export const shareUrl = (q: string, base = 'https://markplowwright.github.io/') => `${base}?q=${encodeURIComponent(q.trim())}`;
