import { describe, expect, it } from 'vitest';
import { runCommand } from './commands';

const win = { skin: 'windows', shell: 0 } as const;
const mac = { skin: 'mac', shell: 0 } as const;
const linux = { skin: 'linux', shell: 0 } as const;

describe('runCommand', () => {
  it('ignores empty input', () => {
    expect(runCommand('   ', win)).toEqual({ lines: [] });
  });

  it('lists the commands for help, with the right network command per skin', () => {
    expect(runCommand('help', win).lines[0]).toContain('ipconfig');
    expect(runCommand('help', mac).lines[0]).toContain('ifconfig');
  });

  it('is not case sensitive', () => {
    expect(runCommand('WHOAMI', linux).lines[0]).toMatch(/^mark:/);
  });

  it('clears with clear and cls', () => {
    expect(runCommand('clear', mac).clear).toBe(true);
    expect(runCommand('cls', win).clear).toBe(true);
  });

  it('lists the projects', () => {
    const out = runCommand('projects', win).lines.join('\n');
    expect(out).toContain('Admin Practice Lab');
    expect(out).toContain('GradAisle');
  });

  it('prints ipconfig /all with every field Windows shows', () => {
    const out = runCommand('ipconfig /all', win).lines.join('\n');
    for (const f of ['Host Name . . . . . . . . . . . . : MARK-PORTFOLIO', 'Physical Address', 'DHCP Enabled', 'IPv4 Address. . . . . . . . . . . : 10.0.0.25(Preferred)', 'Subnet Mask', 'Lease Obtained', 'Lease Expires', 'Default Gateway', 'DHCP Server', 'DHCPv6 Client DUID', 'DNS Servers . . . . . . . . . . . : 10.0.0.4', 'NetBIOS over Tcpip'])
      expect(out).toContain(f);
    expect(runCommand('IPCONFIG /ALL', win).lines.join('\n')).toContain('Host Name');
    expect(runCommand('ipconfig /flushdns', win).lines.at(-1)).toBe('Successfully flushed the DNS Resolver Cache.');
  });

  it('shows each OS its own network command', () => {
    expect(runCommand('ifconfig', mac).lines.join('\n')).toContain('inet 10.0.0.25 netmask 0xffffff00');
    expect(runCommand('ip a', linux).lines.join('\n')).toContain('inet 10.0.0.25/24');
    expect(runCommand('ipconfig getifaddr en0', mac).lines).toEqual(['10.0.0.25']);
  });

  it('points to the right command when it belongs to another OS', () => {
    const tip = (c: string, ctx: typeof win | typeof mac | typeof linux) => runCommand(c, ctx).lines.at(-1);
    expect(runCommand('ifconfig', win).lines[0]).toContain('not recognized');
    expect(tip('ifconfig', win)).toBe('Tip: ifconfig is a macOS and older Linux command. On Windows, type: ipconfig /all');
    expect(runCommand('ipconfig', linux).lines[0]).toBe('bash: ipconfig: command not found');
    expect(tip('ipconfig', linux)).toBe('Tip: ipconfig is a Windows command. On Linux, type: ip a');
    expect(tip('ipconfig /all', mac)).toContain('On macOS, type: ifconfig');
    expect(tip('ip a', mac)).toBe('Tip: ip is a Linux command. On macOS, type: ifconfig');
    expect(tip('tracert google.com', mac)).toBe('Tip: tracert is a Windows command. On macOS, type: traceroute google.com');
    expect(tip('traceroute google.com', win)).toContain('On Windows, type: tracert google.com');
    expect(tip('ifconfig', linux)).toBe('Tip: modern Linux uses the ip command. Type: ip a');
    expect(tip('cls', mac)).toBe('Tip: cls is a Windows command. On macOS, type: clear');
  });

  it('answers nslookup and ping like the real commands', async () => {
    const lookup = async (n: string) => (n === 'google.com' ? { name: 'google.com', a: ['142.250.80.46'], aaaa: ['2607:f8b0:4006:80f::200e'], aliases: [], internal: false } : null);
    const w = await runCommand('nslookup google.com', { ...win, lookup }).later!;
    expect(w).toEqual(['Server:  PLOWVM.plowlab.local', 'Address:  10.0.0.4', '', 'Non-authoritative answer:', 'Name:    google.com', 'Addresses:  2607:f8b0:4006:80f::200e', '          142.250.80.46', '']);
    const m = await runCommand('nslookup google.com', { ...mac, lookup }).later!;
    expect(m).toContain('Address: 142.250.80.46');
    expect(m).toContain('Address:\t10.0.0.4#53');
    expect((await runCommand('nslookup nope.invalid', { ...linux, lookup }).later!).join('\n')).toContain("** server can't find nope.invalid: NXDOMAIN");
    expect((await runCommand('nslookup plowvm', win).later!).join('\n')).toContain('Name:    plowvm.plowlab.local');
    expect((await runCommand('ping google.com', { ...win, lookup }).later!)[1]).toBe('Pinging google.com [142.250.80.46] with 32 bytes of data:');
    expect((await runCommand('ping -c 4 google.com', { ...linux, lookup }).later!)[0]).toBe('PING google.com (142.250.80.46) 56(84) bytes of data.');
    expect((await runCommand('nslookup google.com', { ...win, online: false, lookup }).later!)[0]).toBe('DNS request timed out.');
  });

  it('opens apps and files', () => {
    expect(runCommand('open browser', mac).open).toBe('browser');
    expect(runCommand('open resume', mac).open).toBe('resume');
    expect(runCommand('open nothing', mac).open).toBeUndefined();
  });

  it('lists interests and opens the folder', () => {
    expect(runCommand('hobbies', mac).lines.join('\n')).toContain('Never Split the Difference');
    expect(runCommand('open interests', mac).open).toBe('interests');
  });

  it('lists education', () => {
    expect(runCommand('education', win).lines.join('\n')).toContain('United World College of the Adriatic');
  });

  it('has the easter egg', () => {
    const r = runCommand('sudo hire mark', linux);
    expect(r.lines[1]).toBe('Permission granted.');
    expect(r.open).toBe('contact');
  });

  it('uses the right "not found" message per skin and shell', () => {
    expect(runCommand('foo', win).lines[0]).toContain('cmdlet');
    expect(runCommand('foo', { skin: 'windows', shell: 1 }).lines[0]).toContain('internal or external command');
    expect(runCommand('foo', mac).lines[0]).toBe('zsh: command not found: foo');
    expect(runCommand('foo', { skin: 'mac', shell: 1 }).lines[0]).toBe('bash: foo: command not found');
    expect(runCommand('foo', linux).lines[0]).toBe('bash: foo: command not found');
  });
});

describe('search command', () => {
  const ctx = { skin: 'linux' as const, shell: 0 as const };
  it('lists results and opens the Browser', () => {
    const r = runCommand('search group policy', ctx);
    expect(r.search).toBe('group policy');
    expect(r.lines.join('\n')).toContain('Windows Server Home Lab');
  });
  it('explains itself without words, and handles no results', () => {
    expect(runCommand('search', ctx).lines[0]).toContain('Usage');
    expect(runCommand('search qqqzzz', ctx).search).toBeUndefined();
  });
});

describe('command guide', () => {
  it('lists only commands that really work on their OS', async () => {
    const { commandGuide } = await import('../../content/commandGuide');
    for (const e of commandGuide)
      for (const os of e.os) {
        const r = runCommand(e.cmd, { skin: os, shell: 0, lookup: async () => null });
        const out = r.lines.join('\n');
        expect(out, `${e.cmd} on ${os}`).not.toMatch(/not recognized|command not found|Tip:|No manual entry|No help found|Unknown app|Nice try/);
      }
  });

  it('opens the guide and explains single commands', () => {
    expect(runCommand('commands', mac).guide).toBe(true);
    expect(runCommand('man ifconfig', mac).lines[1]).toContain("network interface's IP");
    expect(runCommand('help ipconfig', win).lines[1]).toContain('IP address');
    expect(runCommand('man ipconfig', linux).lines.join('\n')).toContain('This is a Windows command. On Linux, use: ip a');
    expect(runCommand('help ip', win).lines.join('\n')).toContain('On Windows, use: ipconfig /all');
    expect(runCommand('man nothing', linux).lines[0]).toBe('No manual entry for nothing');
    expect(runCommand('man ipconfig', { skin: 'windows', shell: 1 }).lines.at(-1)).toContain('help ipconfig');
  });
});
