// Text used by the Terminal app. Command logic lives in src/apps/terminal/commands.ts.
import { profile } from './profile';
import { projects } from './projects';
import { skillsOneLine } from './skills';
import { interests, writing } from './interests';

export const terminalText = {
  user: 'mark',
  hostname: 'MARK-PORTFOLIO',
  whoami: `mark: ${profile.role}. ${profile.tagline}.`,
  intro: 'Type help, or use the buttons below.',
  projects: projects.map((p) => `${p.name.padEnd(36)} ${p.category}`),
  skills: skillsOneLine,
  contact: [`Email:    ${profile.email}`, `LinkedIn: ${profile.links.linkedin}`, `GitHub:   ${profile.links.github}`],
  interests: [...interests.map((i) => `${i.title.padEnd(20)} ${i.summary}`), `${writing.title.padEnd(20)} ${writing.summary}`, 'Try: open interests'],
  ls: ['About Mark/', 'Work & Projects/', 'Presentations/', 'Interests/', 'Resume.pdf'],
  hire: ['[sudo] password for recruiter: ********', 'Permission granted.', `Opening ${profile.name}'s resume and contact details...`],
  exit: 'Session closed. (demo, nothing really ended)',
  sample: '(sample output)',
};
