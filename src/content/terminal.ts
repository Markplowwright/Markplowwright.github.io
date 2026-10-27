// Text used by the Terminal app. Command logic lives in src/apps/terminal/commands.ts.
import { profile } from './profile';
import { projects } from './projects';
import { skillsOneLine } from './skills';

export const terminalText = {
  user: 'mark',
  hostname: 'MARK-PORTFOLIO',
  whoami: `mark: ${profile.role}. ${profile.tagline}.`,
  intro: 'Type help, or use the buttons below.',
  projects: projects.map((p) => `${p.name.padEnd(36)} ${p.category}`),
  skills: skillsOneLine,
  contact: [`Email:    ${profile.email}`, `LinkedIn: ${profile.links.linkedin}`, `GitHub:   ${profile.links.github}`],
  ls: ['About Mark/', 'Work & Projects/', 'Presentations/', 'Resume.pdf'],
  hire: ['[sudo] password for recruiter: ********', 'Permission granted.', `Opening ${profile.name}'s resume and contact details...`],
  exit: 'Session closed. (demo, nothing really ended)',
  sample: '(sample output)',
};
