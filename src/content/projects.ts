// Portfolio projects. Facts come from each GitHub repository's README and from
// Mark's old portfolio site. Missing details use visible [add ...] placeholders.

import { homeLabShots, type LabShot } from './homelabScreenshots';

export type ProjectLink = { label: string; url: string };

export type Project = {
  id: string;
  name: string;
  category: string;
  /** One line used in lists, the terminal and the mobile cards. */
  blurb: string;
  problem: string;
  built: string[];
  tech: string[];
  outcome: string;
  links: ProjectLink[];
  screenshot?: { src: string; alt: string };
  /** Extra files shown in the project's folder (for example a paper). */
  extraFiles?: { id: string; name: string; kind: 'pdf'; src: string; body: string }[];
  /** A Screenshots folder (with subfolders) inside the project folder. */
  gallery?: LabShot[];
  /** Older projects sit in an "Earlier projects" folder. */
  earlier?: boolean;
};

const gh = (repo: string) => `https://github.com/Markplowwright/${repo}`;

export const projects: Project[] = [
  {
    id: 'p-homelab',
    name: 'Windows Server Home Lab',
    category: 'Infrastructure',
    blurb: 'A Windows Server and Active Directory lab running in Microsoft Azure, written up as runbooks with screenshots.',
    problem:
      'A simulator cannot teach the infrastructure side of IT support: standing up a server, creating a domain, and managing it the way a help desk or junior sysadmin would. This lab does it on real servers.',
    built: [
      'Created a Windows Server 2025 VM in Azure with cost controls (auto-shutdown, budget alert).',
      'Installed AD DS and promoted the server (PLOWVM) to a domain controller for plowlab.local.',
      'Created a domain user in the USA > Users OU, plus an IT security group and a DL-ITAdmins distribution group.',
      'Built six GPOs: password policy, drive mapping, wallpaper, Control Panel restriction, USB block and account lockout.',
      'Joined a Windows 11 client (PLOWCLIENT) to the domain and tested the GPOs with gpupdate and gpresult.',
      'Shared a folder, mapped it by hand and then by GPO, and installed FSRM with a hard quota and an active file screen.',
    ],
    tech: ['Microsoft Azure', 'Windows Server 2025', 'Active Directory', 'Group Policy', 'DNS', 'FSRM', 'Windows 11', 'RDP'],
    outcome:
      'A working domain with a joined client and verified policies. Every step is a runbook, and a troubleshooting log records real problems and fixes, for example the client failing to resolve plowlab.local until the VNet DNS pointed at the domain controller. Next: DNS records, WSUS, backups and imaging.',
    links: [{ label: 'GitHub repository', url: gh('windows-server-home-lab') }],
    gallery: homeLabShots,
  },
  {
    id: 'p-admin',
    name: 'Admin Practice Lab',
    category: 'Web application',
    blurb: 'A free browser simulator for practicing Microsoft 365 and hybrid identity admin work with nothing to break.',
    problem:
      'While learning Microsoft 365 admin work, Mark kept turning to YouTube to figure out how to do things. He wanted somewhere to just practice, and realized many other learners had the same problem.',
    built: [
      'A browser simulator of Windows Server Active Directory, the Microsoft 365 admin center, Entra ID, Intune, Exchange and a virtual Windows laptop, all linked together.',
      'A five-level path with 18 guided missions and 64 guided steps, plus 10 real-world ticket-style scenarios.',
      'Realistic failures: enrollment can fail with a blocked account, a user outside MDM scope, a missing license (80180018) or device join disabled (801c0003).',
      'Hybrid identity: AD users and groups, OU sync scope, Entra Connect, Group Policy, hybrid join and dsregcmd /status.',
    ],
    tech: ['HTML', 'CSS', 'JavaScript (no build step)', 'node:test', 'localStorage', 'GitHub Pages'],
    outcome:
      'Live and free for anyone learning IT admin tasks: help desk beginners, career changers, and admins coming from Jamf or Google Admin. No tenant, no sign-up, no install.',
    links: [
      { label: 'Live demo', url: 'https://markplowwright.github.io/admin-practice-lab/' },
      { label: 'GitHub repository', url: gh('admin-practice-lab') },
    ],
    screenshot: { src: '/screenshots/admin-practice-lab.png', alt: 'Admin Practice Lab running in the browser' },
  },
  {
    id: 'p-endpoint',
    name: 'endpoint-health-audit',
    category: 'Scripting',
    blurb: 'A read-only endpoint health audit that writes one comparable report with OK, WARNING and ERROR lines.',
    problem:
      'Endpoint checks are easy to do differently every time: one person looks at disk space, another forgets FileVault, and a machine can sit unpatched for weeks. Notes from those checks are hard to compare later.',
    built: [
      'A macOS bash script with six checks: OS version, free disk space, FileVault, uptime, load average and pending software updates.',
      'Writes reports/audit-YYYY-MM-DD.txt with [OK], [WARNING] and [ERROR] lines and a summary. No settings changes, no sudo.',
      'Thresholds can be overridden per run (DISK_WARN_PCT, UPTIME_WARN_DAYS, LOAD_CPU_LIMIT).',
    ],
    tech: ['bash 3.2', 'macOS (sw_vers, df, fdesetup, sysctl, softwareupdate)', 'ShellCheck', 'PowerShell (planned)'],
    outcome:
      'Tested on macOS 15.3: the audit flagged FileVault off and one pending update as warnings. A Windows PowerShell version with the same six checks is planned.',
    links: [{ label: 'GitHub repository', url: gh('endpoint-health-audit') }],
  },
  {
    id: 'p-disk',
    name: 'disk-usage-monitor',
    category: 'Scripting',
    blurb: 'Checks one filesystem on a schedule and posts to Slack when usage crosses a threshold.',
    problem:
      'A full disk takes a machine down after the fact. Checking the used percentage on a timer, and notifying only when it stays over a threshold, leaves time to free space first.',
    built: [
      'disk_monitor.sh reads usage with df -Pk, prints one timestamped OK or ALERT line, and posts to a Slack webhook at or above the threshold.',
      'A cooldown stops repeat alerts, and one recovery message is sent when usage falls back under the threshold.',
      'Runs from launchd on macOS, cron on Linux, or a Docker image. Has a --dry-run mode.',
    ],
    tech: ['bash 3.2', 'df', 'curl', 'Slack webhooks', 'launchd', 'cron', 'Docker'],
    outcome: '[add results after the first scheduled runs]',
    links: [{ label: 'GitHub repository', url: gh('disk-usage-monitor') }],
  },
  {
    id: 'p-traffic',
    name: 'Network Traffic Analysis',
    category: 'Cybersecurity',
    blurb: 'A repeatable investigation workflow for TCP, DNS, FTP, HTTP and SSH traffic using Wireshark, tshark and Python.',
    problem:
      'Analysts need to tell client misconfiguration, connectivity failure and automated brute-force scanning apart, quickly and with evidence.',
    built: [
      'Captured baseline traffic and compared it against SSH brute-force, TCP retransmission and reset, and DNS failure scenarios.',
      'A Python script that summarizes a PCAP: SYN counts, failed handshakes, resets, SSH authentication failures and a brute-force flag.',
      'A documented workflow: capture strategy, filter selection, baseline comparison, hypothesis, validation and recommendation.',
      'An earlier CSC 4111 paper trained a Random Forest model in scikit-learn on Wireshark captures to study brute-force SSH and FTP (Patator) attacks.',
    ],
    tech: ['Wireshark', 'tshark', 'Python', 'scikit-learn (Random Forest)', 'TCP/IP', 'SSH, DNS, HTTP, FTP'],
    outcome:
      'Remediation recommendations including credential lockout policies, rate limiting, segmentation of exposed services and hardening remote access authentication.',
    links: [{ label: 'GitHub repository', url: gh('network-traffic-analysis-wireshark') }],
    extraFiles: [
      {
        id: 'p-traffic-paper',
        name: 'CSC 4111 Random Forest paper.pdf',
        kind: 'pdf',
        src: '/papers/csc-4111-network-traffic-ml.pdf',
        body: 'Applied Network Traffic Analysis using Machine Learning: a Random Forest model in scikit-learn, trained on Wireshark captures, examining features of brute-force SSH and FTP attacks.',
      },
    ],
  },
  {
    id: 'p-grad',
    name: 'GradAisle',
    category: 'Web application',
    blurb: 'A free graduate school discovery and matching platform for U.S. Master’s and PhD applicants.',
    problem:
      'Program-level data that drives grad school decisions (tuition, deadlines, TA/RA funding, CPT/OPT and STEM OPT eligibility) is scattered across thousands of unstructured university PDFs.',
    built: [
      'Co-founded and led a 3-person distributed team through biweekly planning syncs.',
      'An AI-assisted pipeline that turns unstructured university PDFs into a structured PostgreSQL schema powering a 1,000+ program dataset.',
      'Worked with university admissions offices (Syracuse University and Fordham Gabelli) to verify program data.',
      'Built the core platform end-to-end, including the matching logic and the deployment pipeline on a self-hosted VPS.',
    ],
    tech: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Express', 'Supabase Postgres', 'pgvector', 'Redis', 'Dokploy', 'Traefik'],
    outcome: 'Students search and compare 1,000+ programs in one place and get matched to programs that fit their profile.',
    links: [{ label: 'Live site', url: 'https://gradaisle.com' }],
    screenshot: { src: '/screenshots/gradaisle.jpg', alt: 'GradAisle home page' },
  },
  {
    id: 'p-sanare',
    name: 'Sanare',
    category: 'Healthcare technology',
    earlier: true,
    blurb: 'A healthcare provider finder with price transparency, booking, an AI navigation assistant and personal health records.',
    problem:
      'Finding a doctor, understanding what a procedure costs and keeping your own health records usually means several different sites and a lot of guesswork.',
    built: [
      'Provider search built on scraped and structured CMS physician data (specialty, location, practice type, distance).',
      'Appointment booking, CPT-code price transparency and an AI chatbot that navigates users to providers, pricing or booking.',
      'A React Native app with a Supabase schema for providers, CPT codes, appointments and users, and secure Edge Function API routes.',
    ],
    tech: ['React Native', 'Expo', 'TypeScript', 'Supabase', 'PostgreSQL', 'Python', 'Edge Functions', 'LLM'],
    outcome: 'A full-stack exploration of healthcare data, provider search usability and AI-assisted navigation.',
    links: [{ label: 'Live site', url: 'https://sanarehealth.org/' }],
    screenshot: { src: '/screenshots/sanare.jpg', alt: 'Sanare home page' },
  },
  {
    id: 'p-pimm',
    name: 'PIMM Fortran Optimizer Re-engineer',
    category: 'Computational chemistry',
    earlier: true,
    blurb: 'A legacy Fortran 77 computational chemistry program rewritten in Python.',
    problem:
      'A geometry optimizer for pi-electron systems was locked in Fortran 77, which made it hard to test, extend and reuse for machine learning research.',
    built: [
      'Rewrote the program in Python, abstracting subroutines into object-oriented classes.',
      'Combines classical force field methods with self-consistent field (SCF) calculations to predict molecular structures and conformational energies.',
    ],
    tech: ['Python', 'NumPy', 'Fortran 77', 'Molecular mechanics', 'SCF methods'],
    outcome: 'A modular, testable codebase for future computational chemistry research at the University of Richmond.',
    links: [{ label: 'GitHub repository', url: gh('Fotran-Optimizer-Re-engineer') }],
  },
];

export const currentProjects = projects.filter((p) => !p.earlier);
export const earlierProjects = projects.filter((p) => p.earlier);
