// The Help Desk app: practice tickets showing how Mark works a problem.
// The method and the numbered steps are Mark's own words. Callers are
// fictional, and the evidence is sample output from the portfolio's pretend
// network (see src/apps/terminal/network.ts), not real incidents.

export type Step = { text: string; sub?: string[] };

/** Something a visitor can try from a ticket. */
export type TryIt =
  | { label: string; terminal: string; os?: 'windows' | 'mac' | 'linux' }
  | { label: string; app: 'taskmgr' | 'network' }
  | { label: string; node: string };

export type Ticket = {
  number: string;
  title: string;
  caller: string;
  category: string;
  priority: 1 | 2 | 3 | 4;
  state: 'Resolved' | 'Escalated';
  opened: string;
  /** What the user reported, in their words. */
  reported: string;
  /** Mark's steps, word for word. */
  steps: Step[];
  /** Sample evidence gathered while working the ticket. */
  evidence?: { title: string; lines: string[] }[];
  /** How it ended. */
  resolution: string;
  /** For escalated tickets: the note handed to the next team. */
  escalation?: string[];
  tryIt?: TryIt[];
};

export const priorityLabel: Record<Ticket['priority'], string> = { 1: '1 - Critical', 2: '2 - High', 3: '3 - Moderate', 4: '4 - Low' };

export const method: { title: string; text: string }[] = [
  { title: 'Scope', text: 'One user or many? When did it start? What changed?' },
  { title: 'Reproduce', text: 'Watch them do it and read the exact error.' },
  { title: 'Simple checks first', text: 'Power, cables, toggle, restart of the app.' },
  { title: 'Narrow by layer', text: 'Physical, then IP, then DNS, then account/permissions, then the application.' },
  { title: 'Fix, then verify', text: 'Have the user confirm it works.' },
  { title: 'Escalate with evidence if stuck', text: 'Symptom, what you tested, results, MAC/IP details.' },
  { title: 'Document', text: 'In the ticket.' },
];

export const tickets: Ticket[] = [
  {
    number: 'INC0010421',
    title: 'Connected to Wi-Fi, nothing loads',
    caller: 'Alicia Moreno (Finance)',
    category: 'Network',
    priority: 3,
    state: 'Resolved',
    opened: 'Mon 9:12 AM',
    reported: "I'm connected to the Wi-Fi but no websites load. It was fine on Friday.",
    steps: [
      { text: 'Scope questions, then watch her try. Try another site and another browser.' },
      { text: 'Confirm the SSID is the right one, toggle Wi-Fi, forget and rejoin.' },
      {
        text: '`ipconfig /all`:',
        sub: [
          '169.254: DHCP failed. `ipconfig /release`, then `/renew`. Then rejoin, check for a static IP, try a phone hotspot. If the network is the cause, escalate with her MAC.',
          'Normal IP: compare the range, mask, gateway and DHCP server to a working device.',
          'No gateway: check static IP and VPN adapter, renew, compare, escalate.',
        ],
      },
      {
        text: 'Ping ladder: default gateway, then 8.8.8.8, then google.com.',
        sub: [
          'Gateway fails: local connection (static IP, wrong SSID/VLAN, signal).',
          '8.8.8.8 fails: VPN, proxy, firewall.',
          'Name fails: DNS. Check the DNS server in ipconfig, `ipconfig /flushdns`, try a known-good DNS.',
          'All reply: it’s the application. Check the proxy, date/time, VPN, another browser.',
        ],
      },
      { text: 'Check VPN, then escalate or document.' },
    ],
    evidence: [
      {
        title: 'ipconfig /all (before)',
        lines: [
          'Wireless LAN adapter Wi-Fi:',
          '   Physical Address. . . . . . . . . : 3C-58-C2-1F-04-AA',
          '   DHCP Enabled. . . . . . . . . . . : Yes',
          '   Autoconfiguration IPv4 Address. . : 169.254.83.17(Preferred)',
          '   Subnet Mask . . . . . . . . . . . : 255.255.0.0',
          '   Default Gateway . . . . . . . . . :',
        ],
      },
      {
        title: 'After ipconfig /release and /renew',
        lines: [
          '   IPv4 Address. . . . . . . . . . . : 10.0.0.57(Preferred)',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 10.0.0.1',
          '   DNS Servers . . . . . . . . . . . : 10.0.0.4',
        ],
      },
      { title: 'Ping ladder', lines: ['ping 10.0.0.1     Reply, 2 ms', 'ping 8.8.8.8      Reply, 14 ms', 'ping google.com   Reply, 13 ms'] },
    ],
    resolution: 'The laptop had a 169.254 address, so DHCP had failed. Released and renewed the lease, then rejoined the Wi-Fi. The ping ladder passed and she confirmed sites load. Documented in the ticket.',
    tryIt: [
      { label: 'Run ipconfig /all', terminal: 'ipconfig /all', os: 'windows' },
      { label: 'Ping the gateway', terminal: 'ping 10.0.0.1', os: 'windows' },
      { label: 'Ping 8.8.8.8', terminal: 'ping 8.8.8.8', os: 'windows' },
      { label: 'nslookup google.com', terminal: 'nslookup google.com', os: 'windows' },
    ],
  },
  {
    number: 'INC0010433',
    title: 'Wi-Fi down for everyone in Room 204',
    caller: 'Room 204 (about 15 users)',
    category: 'Network',
    priority: 2,
    state: 'Escalated',
    opened: 'Mon 10:40 AM',
    reported: 'Nobody in Room 204 can get on the Wi-Fi. The hallway works.',
    steps: [
      { text: 'Is it everyone or one area? Does the SSID show up?' },
      { text: 'Check the AP’s light and cables, and test the wall jack with a laptop.' },
      { text: 'Check the switch port’s VLAN and PoE, and the DHCP scope (full?).' },
      { text: 'Check the controller or dashboard, and escalate if you lack access.' },
    ],
    evidence: [
      {
        title: 'Findings',
        lines: [
          'Scope:     Room 204 only. Hallway and Room 205 are fine.',
          'SSID:      Not visible in Room 204.',
          'AP light:  Off.',
          'Wall jack: Laptop on the AP’s jack gets 10.0.0.112, so the cable run and VLAN work.',
          'Switch:    Port Gi1/0/14 is up, but PoE shows 0.0 W.',
        ],
      },
    ],
    resolution: 'The access point gets no power from the switch, even though the port and VLAN are fine. Changing PoE settings needs network team access, so the ticket was escalated with the evidence.',
    escalation: [
      'To: Network team',
      'Symptom: No Wi-Fi in Room 204 since about 10:30 AM. SSID not visible. About 15 users.',
      'Tested: AP light off. Laptop on the AP’s jack gets 10.0.0.112 (cable and VLAN OK). Switch port Gi1/0/14 up, PoE 0.0 W.',
      'Likely cause: PoE disabled or budget exceeded on the switch, or a failed AP.',
      'Details: AP-204, MAC 70:3A:0E:5C:11:D2, switch IDF-2, port Gi1/0/14.',
    ],
  },
  {
    number: 'INC0010447',
    title: 'Printer offline for one user',
    caller: 'Grace Kim (Front office)',
    category: 'Hardware',
    priority: 3,
    state: 'Resolved',
    opened: 'Mon 1:05 PM',
    reported: 'My prints never come out. Everyone else can print.',
    steps: [
      { text: 'Watch her print. Check the queue for stuck jobs.' },
      { text: 'Check the printer (power, paper, errors, offline).' },
      { text: 'Ping the printer’s IP.' },
      { text: 'Windows: restart the spooler, clear the queue, remove and re-add by IP, remove driver/port if needed. Mac: reset the printing system.' },
      { text: 'Escalate with the ping result and error.' },
    ],
    evidence: [
      { title: 'Print queue', lines: ['3 jobs stuck, the first shows "Error - Printing".'] },
      { title: 'ping 10.0.0.60', lines: ['Reply from 10.0.0.60: bytes=32 time=2ms TTL=64', 'Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'] },
      { title: 'Restart the spooler', lines: ['net stop spooler', 'The Print Spooler service was stopped successfully.', 'net start spooler', 'The Print Spooler service was started successfully.'] },
    ],
    resolution: 'The printer answered pings and printed for others, so the problem was her PC. A stuck job had jammed the queue. Restarted the spooler, cleared the queue, and re-added the printer by IP. She printed a test page.',
    tryIt: [{ label: 'Ping the printer', terminal: 'ping 10.0.0.60', os: 'windows' }],
  },
  {
    number: 'INC0010452',
    title: 'Computer is very slow',
    caller: 'Marcus Bell (Sales)',
    category: 'Software',
    priority: 4,
    state: 'Resolved',
    opened: 'Tue 8:30 AM',
    reported: 'Everything takes forever since yesterday.',
    steps: [
      { text: 'What’s slow (everything or one thing), since when, what changed?' },
      { text: 'Get eyes on it (remote or by phone).' },
      { text: 'Task Manager/Activity Monitor: CPU, memory, disk, which process.' },
      { text: 'Check updates or scans, low disk space, startup programs.' },
      { text: 'Restart, then escalate with what you found.' },
    ],
    evidence: [
      { title: 'Task Manager', lines: ['CPU 18%   Memory 71%   Disk 100%', 'Top disk use: Windows Update (installing), then OneDrive'] },
      { title: 'Storage', lines: ['C: 3.8 GB free of 237 GB'] },
      { title: 'Startup apps', lines: ['9 enabled, including two unused updaters'] },
    ],
    resolution: 'Disk was at 100% from an update installing on a nearly full drive. Cleared temporary files and old downloads (freed 41 GB), disabled two unused startup apps, and restarted to finish the update. He confirmed it is back to normal.',
    tryIt: [{ label: 'Open Task Manager', app: 'taskmgr' }],
  },
  {
    number: 'INC0010458',
    title: 'Locked out of account',
    caller: 'Priya Shah (HR)',
    category: 'Account',
    priority: 2,
    state: 'Resolved',
    opened: 'Tue 9:02 AM',
    reported: 'It says my account is locked. I changed my password on Friday.',
    steps: [
      { text: 'Ask about recent changes, Caps Lock, and the exact error.' },
      { text: 'In AD: locked, expired, or wrong password?' },
      { text: 'Locked: unlock. Expired: reset with change-at-next-login. Forgotten: reset.' },
      { text: 'Share temporary passwords securely, and confirm login works.' },
    ],
    evidence: [
      { title: 'Error on screen', lines: ['"The referenced account is currently locked out and may not be logged on to."'] },
      { title: 'Active Directory', lines: ['Account locked: Yes (5 bad attempts, the lockout policy limit)', 'Password expired: No', 'Last bad password: 8:58 AM, from her phone'] },
    ],
    resolution: 'Her phone still had the old password saved and kept retrying, which tripped the 5-attempt lockout. Unlocked the account in AD, updated the password on her phone, and she signed in. No reset needed.',
    tryIt: [{ label: "See the lockout policy in Mark's lab", node: 'p-homelab-shots/2 Group Policy/3 Account Lockout' }],
  },
  {
    number: 'INC0010463',
    title: 'Outlook not syncing (phone works)',
    caller: 'Tom Alvarez (Operations)',
    category: 'Email',
    priority: 3,
    state: 'Resolved',
    opened: 'Tue 11:20 AM',
    reported: 'New emails show up on my phone but not in Outlook on my laptop.',
    steps: [
      { text: 'The phone working means the account and mailbox are fine, so it’s the device.' },
      { text: 'Check status bar and Work Offline, then F9.' },
      { text: 'Look for password prompts (stale sign-in), then safe mode (`outlook.exe /safe`).' },
      { text: 'Check the OST and add-ins, then updates. Escalate if a policy (Conditional Access) might block the device.' },
    ],
    evidence: [{ title: 'Outlook status bar', lines: ['Need Password', 'Work Offline: off'] }],
    resolution: 'Outlook was waiting on a hidden sign-in prompt after a password change. Signed in again and pressed F9; new mail synced. He confirmed it is up to date.',
  },
  {
    number: 'REQ0004120',
    title: 'New hire setup: Jordan Lee, starts Monday',
    caller: 'HR (for Jordan Lee)',
    category: 'Request',
    priority: 3,
    state: 'Resolved',
    opened: 'Wed 2:15 PM',
    reported: 'Jordan Lee starts Monday as an analyst in Finance. Needs a laptop, email, and the Finance shared drive. Manager: Alicia Moreno.',
    steps: [
      { text: 'Read the ticket (name, role, department, start date, manager, access needs).' },
      { text: 'Create the user in the right OU, add security groups.' },
      { text: 'Mailbox and license in Microsoft 365.' },
      { text: 'Prepare the laptop (image, updates, apps), join the domain or Entra.' },
      { text: 'Temporary password, then test login, email and shared drives. Walk the user through it.' },
    ],
    evidence: [
      {
        title: 'Checklist',
        lines: [
          '[x] User created in Staff OU, added to Finance security group',
          '[x] Microsoft 365 license assigned, mailbox created',
          '[x] Laptop imaged, updated, apps installed, joined to Entra',
          '[x] Temporary password shared securely (change at next sign-in)',
          '[x] Tested sign-in, email and the Finance shared drive with Jordan',
        ],
      },
    ],
    resolution: 'Account, mailbox, license and laptop ready before the start date. On day one, Jordan signed in, changed the password, and opened email and the Finance drive.',
    tryIt: [
      { label: 'See new hire practice in the Admin Practice Lab', node: 'p-admin-shots/7 Lab guide' },
      { label: "See user creation in Mark's home lab", node: 'p-homelab-shots/1 Active Directory' },
    ],
  },
  {
    number: 'INC0010471',
    title: 'Computer won’t power on',
    caller: 'Reception desk',
    category: 'Hardware',
    priority: 2,
    state: 'Resolved',
    opened: 'Thu 7:55 AM',
    reported: 'The front desk computer is dead. Nothing happens when I press the button.',
    steps: [
      { text: 'Ask: desktop or laptop, what changed?' },
      { text: 'Desktop: power cable, outlet, power strip, back-of-case switch. Laptop: charger directly, light check, hard reset (hold power 15 to 20 seconds).' },
      { text: 'If it powers on but no display: monitor input and cable.' },
      { text: 'No sign of life after all this: hardware failure, escalate or swap.' },
    ],
    evidence: [{ title: 'Findings', lines: ['Desktop. Cleaners were in overnight.', 'Power strip switch was off. Monitor and PC both on that strip.'] }],
    resolution: 'The power strip had been switched off overnight. Turned it on, the PC booted, and the monitor came up. Reception confirmed everything works.',
  },
];
