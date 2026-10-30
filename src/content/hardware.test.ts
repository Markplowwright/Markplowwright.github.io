import { describe, expect, it } from 'vitest';
import { problems, systeminfoLines, windowsDevices } from './hardware';
import { runCommand } from '../apps/terminal/commands';

const win = { skin: 'windows', shell: 0 } as const;
const mac = { skin: 'mac', shell: 0 } as const;
const linux = { skin: 'linux', shell: 0 } as const;
const out = (c: string, ctx: typeof win | typeof mac | typeof linux) => runCommand(c, ctx).lines.join('\n');

describe('hardware', () => {
  it('has one problem per OS that a later step fixes', () => {
    for (const p of Object.values(problems)) {
      expect(p.actions.some((a) => a.fixes)).toBe(true);
      expect(p.actions[0].fixes).toBe(false);
    }
    expect(windowsDevices.flatMap((g) => g.devices).some((d) => d.name === problems.windows.device)).toBe(true);
  });

  it('matches the network details the Terminal already shows', () => {
    const s = systeminfoLines().join('\n');
    expect(s).toContain('Host Name:                 MARK-PORTFOLIO');
    expect(s).toContain('OS Version:                10.0.22631 N/A Build 22631');
    expect(s).toContain('[01]: 10.0.0.25');
    expect(s).toContain('Domain:                    plowlab.local');
  });

  it("runs each OS's own hardware command and points to it on the others", () => {
    expect(out('systeminfo', win)).toContain('System Model:              Latitude 5440');
    expect(runCommand('devmgmt.msc', win).open).toBe('devices');
    expect(out('system_profiler SPHardwareDataType', mac)).toContain('Chip: Apple M3 Pro');
    expect(out('lshw -short', linux)).toContain('ThinkPad T14 Gen 4');
    expect(out('lsusb', linux)).toContain('AX211 Bluetooth');
    expect(runCommand('systeminfo', mac).lines.at(-1)).toBe('Tip: systeminfo is a Windows command. On macOS, type: system_profiler SPHardwareDataType');
    expect(runCommand('lshw', win).lines.at(-1)).toBe('Tip: lshw is a Linux command. On Windows, type: systeminfo');
    expect(runCommand('devmgmt.msc', linux).lines.at(-1)).toContain('On Linux, type: lshw -short');
  });
});
