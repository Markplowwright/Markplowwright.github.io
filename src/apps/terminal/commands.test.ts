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

  it('labels network output as sample output', () => {
    expect(runCommand('ping 10.0.0.4', win).lines.at(-1)).toBe('(sample output)');
    expect(runCommand('ifconfig', linux).lines.at(-1)).toBe('(sample output)');
    expect(runCommand('ping', mac).lines[0]).toContain('plowvm');
  });

  it('only knows ipconfig on Windows and ifconfig elsewhere', () => {
    expect(runCommand('ifconfig', win).lines[0]).toContain('not recognized');
    expect(runCommand('ipconfig', mac).lines[0]).toBe('zsh: command not found: ipconfig');
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
