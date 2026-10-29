// Every Terminal command, with one short line on what it does in the real
// world and why someone would use it. Shown by the "commands" guide and by
// man <command>. A test runs each one on its OS, so this list can't drift
// from what the Terminal really understands.

export type GuideOs = 'windows' | 'mac' | 'linux';
export type GuideSection = 'About Mark' | 'Basics' | 'Network' | 'DNS and troubleshooting';

export type GuideEntry = {
  /** Exactly what to type. Clicking it in the guide runs it. */
  cmd: string;
  /** What it does and why, in one or two short sentences. */
  does: string;
  os: GuideOs[];
  section: GuideSection;
};

const ALL: GuideOs[] = ['windows', 'mac', 'linux'];
const UNIX: GuideOs[] = ['mac', 'linux'];

export const guideSections: GuideSection[] = ['About Mark', 'Basics', 'Network', 'DNS and troubleshooting'];
export const osLabel: Record<GuideOs, string> = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };

export const commandGuide: GuideEntry[] = [
  // About Mark (this portfolio's own commands)
  { cmd: 'whoami', does: 'Shows the signed-in user. Here: who Mark is and what he does.', os: ALL, section: 'About Mark' },
  { cmd: 'projects', does: "Lists Mark's projects.", os: ALL, section: 'About Mark' },
  { cmd: 'skills', does: "Mark's technical skills in one line.", os: ALL, section: 'About Mark' },
  { cmd: 'education', does: 'Where Mark studied.', os: ALL, section: 'About Mark' },
  { cmd: 'interests', does: 'What Mark does outside of work.', os: ALL, section: 'About Mark' },
  { cmd: 'contact', does: "Mark's email, LinkedIn and GitHub.", os: ALL, section: 'About Mark' },
  { cmd: 'search intune', does: "Searches Mark's portfolio and opens the results in the Browser.", os: ALL, section: 'About Mark' },
  { cmd: 'open resume', does: 'Opens an app or file, like the resume or projects.', os: ALL, section: 'About Mark' },
  { cmd: 'sudo hire mark', does: 'An easter egg. Try it.', os: ALL, section: 'About Mark' },

  // Basics
  { cmd: 'help', does: 'Lists the commands this terminal understands.', os: ALL, section: 'Basics' },
  { cmd: 'commands', does: 'Opens this guide.', os: ALL, section: 'Basics' },
  { cmd: 'help ipconfig', does: 'Explains one command. On a real PC, Get-Help or ipconfig /? does this.', os: ['windows'], section: 'Basics' },
  { cmd: 'man ifconfig', does: "Opens a command's manual page. The first stop when you don't know a flag.", os: ['mac'], section: 'Basics' },
  { cmd: 'man ip', does: "Opens a command's manual page. The first stop when you don't know a flag.", os: ['linux'], section: 'Basics' },
  { cmd: 'hostname', does: "Prints the computer's name. Useful on remote calls: \"which PC am I on?\"", os: ALL, section: 'Basics' },
  { cmd: 'dir', does: 'Lists the files in the current folder.', os: ['windows'], section: 'Basics' },
  { cmd: 'ls', does: 'Lists the files in the current folder.', os: UNIX, section: 'Basics' },
  { cmd: 'pwd', does: 'Shows which folder you are in.', os: ALL, section: 'Basics' },
  { cmd: 'uname', does: 'Names the operating system. uname -a adds the kernel version.', os: UNIX, section: 'Basics' },
  { cmd: 'cls', does: 'Clears the screen.', os: ['windows'], section: 'Basics' },
  { cmd: 'clear', does: 'Clears the screen.', os: UNIX, section: 'Basics' },

  // Network
  { cmd: 'ipconfig', does: "Shows the PC's IP address, subnet mask and gateway. The quick check when a PC can't get online.", os: ['windows'], section: 'Network' },
  { cmd: 'ipconfig /all', does: 'Every network detail: MAC address, DHCP lease, DNS servers. Used to spot a bad DHCP lease or wrong DNS.', os: ['windows'], section: 'Network' },
  { cmd: 'ifconfig', does: "Shows each network interface's IP and MAC address. The Mac's version of ipconfig.", os: ['mac'], section: 'Network' },
  { cmd: 'ipconfig getifaddr en0', does: "Prints just the Mac's Wi-Fi IP address. Handy in scripts.", os: ['mac'], section: 'Network' },
  { cmd: 'ip a', does: "Shows each network interface's IP and MAC address. Replaced ifconfig on modern Linux.", os: ['linux'], section: 'Network' },
  { cmd: 'ip route', does: 'Shows the routing table, including the default gateway traffic leaves through.', os: ['linux'], section: 'Network' },

  // DNS and troubleshooting
  { cmd: 'nslookup google.com', does: 'Asks the DNS server for a name\'s address. Tells you whether "the internet is down" is really DNS.', os: ALL, section: 'DNS and troubleshooting' },
  { cmd: 'ping google.com', does: 'Checks whether a host answers and how fast. The first test for "is it reachable?"', os: ALL, section: 'DNS and troubleshooting' },
  { cmd: 'tracert google.com', does: 'Lists each hop on the way to a host. Shows where a connection slows down or breaks.', os: ['windows'], section: 'DNS and troubleshooting' },
  { cmd: 'traceroute google.com', does: 'Lists each hop on the way to a host. Shows where a connection slows down or breaks.', os: UNIX, section: 'DNS and troubleshooting' },
  { cmd: 'ipconfig /flushdns', does: 'Clears the saved DNS answers. Fixes sites that moved but still point to the old address.', os: ['windows'], section: 'DNS and troubleshooting' },
  { cmd: 'sudo dscacheutil -flushcache', does: "Clears the Mac's saved DNS answers, for the same reason as on Windows.", os: ['mac'], section: 'DNS and troubleshooting' },
  { cmd: 'sudo resolvectl flush-caches', does: "Clears Linux's saved DNS answers, for the same reason as on Windows.", os: ['linux'], section: 'DNS and troubleshooting' },
];

/** The guide line for a command name ("ipconfig", "man", "ip"), preferring this OS. */
export function explain(name: string, os: GuideOs): GuideEntry | undefined {
  const n = name.toLowerCase();
  const matches = commandGuide.filter((e) => e.cmd.split(' ')[0] === n || (e.cmd.startsWith('sudo ') && e.cmd.split(' ')[1] === n));
  return matches.find((e) => e.os.includes(os)) ?? matches[0];
}
