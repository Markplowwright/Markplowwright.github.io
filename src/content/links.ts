// Link cards for the Browser app (and the mobile Browser).
import { profile } from './profile';

export type LinkCard = { name: string; note: string; url: string };

export const links: LinkCard[] = [
  { name: 'GitHub profile', note: 'github.com/Markplowwright', url: profile.links.github },
  { name: 'LinkedIn', note: 'Mark Plowright', url: profile.links.linkedin },
  { name: 'Admin Practice Lab', note: 'Live Microsoft 365 admin simulator', url: 'https://markplowwright.github.io/admin-practice-lab/' },
  { name: 'GradAisle', note: 'gradaisle.com', url: profile.links.gradaisle },
  { name: 'Windows Server Home Lab', note: 'Runbooks and screenshots', url: 'https://github.com/Markplowwright/windows-server-home-lab' },
  { name: 'endpoint-health-audit', note: 'macOS health audit script', url: 'https://github.com/Markplowwright/endpoint-health-audit' },
  { name: 'disk-usage-monitor', note: 'Disk alerts to Slack', url: 'https://github.com/Markplowwright/disk-usage-monitor' },
  { name: 'Network Traffic Analysis', note: 'Wireshark, tshark and Python', url: 'https://github.com/Markplowwright/network-traffic-analysis-wireshark' },
  { name: 'Resume (PDF)', note: 'Download or print', url: '/resume.pdf' },
];

export const browserText = {
  address: 'markplowwright.github.io/links',
  heading: 'Mark Plowright, links',
  intro: 'Each link opens in a new tab.',
  offlineTitle: 'You are offline',
  offlineBody: 'Turn Wi-Fi back on from quick settings (the tray, menu bar or top bar icons).',
};
