// The Terminal's command parser: a small pure function, so it is easy to test.
// It takes the typed text and returns the lines to print, plus an optional
// side effect for the app to perform (clear the screen or open something).
// All the words it prints come from src/content/terminal.ts.
import { terminalText as T } from '../../content/terminal';
import type { SkinId } from '../../os/types';
import { engineName, popularSearches, search } from '../../content/search';

export type TermContext = { skin: SkinId; shell: 0 | 1 };
export type CommandResult = { lines: string[]; clear?: boolean; open?: string; search?: string };

/** Names you can type after "open", mapped to app or file ids. */
const OPEN_TARGETS: Record<string, string> = {
  files: 'files', explorer: 'files', finder: 'files', terminal: 'terminal', browser: 'browser',
  taskmgr: 'taskmgr', monitor: 'taskmgr', events: 'eventlog', logs: 'eventlog', network: 'network',
  settings: 'settings', resume: 'resume', projects: 'work', contact: 'contact', presentations: 'pres',
  education: 'education', interests: 'interests', hobbies: 'interests',
};

export function runCommand(raw: string, ctx: TermContext): CommandResult {
  const text = raw.trim();
  if (!text) return { lines: [] };
  const parts = text.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');
  const win = ctx.skin === 'windows';

  switch (cmd) {
    case 'clear':
    case 'cls':
      return { lines: [], clear: true };
    case 'help':
      return {
        lines: [
          `Commands: help, whoami, hostname, projects, skills, education, interests, contact, search <words>, ${win ? 'dir' : 'ls'}, pwd, ping <host>, ${win ? 'ipconfig' : 'ifconfig'}, open <app>, clear`,
          'Try: search group policy, open resume, ping plowvm',
        ],
      };
    case 'whoami':
      return { lines: [T.whoami] };
    case 'hostname':
      return { lines: [T.hostname] };
    case 'projects':
      return { lines: T.projects };
    case 'skills':
      return { lines: [T.skills] };
    case 'education':
      return { lines: T.education };
    case 'interests':
    case 'hobbies':
      return { lines: T.interests };
    case 'contact':
      return { lines: T.contact };
    case 'ls':
    case 'dir':
      return { lines: T.ls };
    case 'pwd':
      return { lines: [win ? 'Path: C:\\Users\\mark' : '/home/mark'] };
    case 'uname':
      return { lines: [ctx.skin === 'mac' ? 'Darwin' : ctx.skin === 'linux' ? 'Linux' : 'uname is not a Windows command. Try: help'] };
    case 'ipconfig':
    case 'ifconfig':
    case 'ip': {
      const wantsWin = cmd === 'ipconfig';
      if (wantsWin !== win) return notFound(cmd, ctx);
      return {
        lines: win
          ? ['Ethernet adapter Ethernet0:', '   IPv4 Address. . . . : 10.0.0.25', '   Subnet Mask . . . . : 255.255.255.0', '   Default Gateway . . : 10.0.0.1', T.sample]
          : ['en0: flags=UP,RUNNING', '        inet 10.0.0.25 netmask 255.255.255.0', '        gateway 10.0.0.1', T.sample],
      };
    }
    case 'ping': {
      const host = parts[1] || 'plowvm';
      return {
        lines: win
          ? [`Pinging ${host} with 32 bytes of data:`, `Reply from ${host}: bytes=32 time=21ms TTL=127`, `Reply from ${host}: bytes=32 time=20ms TTL=127`, `Reply from ${host}: bytes=32 time=22ms TTL=127`, 'Packets: Sent = 3, Received = 3, Lost = 0 (0% loss)', T.sample]
          : [`PING ${host}: 56 data bytes`, `64 bytes from ${host}: icmp_seq=0 ttl=127 time=21 ms`, `64 bytes from ${host}: icmp_seq=1 ttl=127 time=20 ms`, '3 packets transmitted, 3 received, 0% packet loss', T.sample],
      };
    }
    case 'sudo':
      if (arg.toLowerCase() === 'hire mark') return { lines: T.hire, open: 'contact' };
      return { lines: ['Nice try. Only one sudo command works here, and it involves hiring Mark.'] };
    case 'open': {
      const target = OPEN_TARGETS[arg.toLowerCase()];
      if (!target) return { lines: [`Unknown app. Try: ${Object.keys(OPEN_TARGETS).join(', ')}`] };
      return { lines: [`Opening ${arg}...`], open: target };
    }
    case 'search':
    case 'find': {
      if (!arg) return { lines: [`Usage: search <words>. Try: search ${popularSearches[1].toLowerCase()}`] };
      const r = search(arg);
      if (!r.results.length) return { lines: [`No results for "${arg}" in Mark's portfolio.`, `Try: ${popularSearches.slice(0, 5).join(', ')}`] };
      const top = r.results.filter((d) => d.type !== 'image').slice(0, 5);
      return {
        lines: [
          ...(r.answer ? [`${r.answer.title}: ${r.answer.answer}`, ''] : []),
          `${r.results.length} result${r.results.length === 1 ? '' : 's'} for "${arg}":`,
          ...top.map((d) => `  ${d.title}  (${d.where})`),
          `Opening all results in ${engineName}...`,
        ],
        search: arg,
      };
    }
    case 'exit':
      return { lines: [T.exit] };
    default:
      return notFound(cmd, ctx);
  }
}

function notFound(cmd: string, ctx: TermContext): CommandResult {
  if (ctx.skin === 'windows') {
    return {
      lines: [
        ctx.shell === 0
          ? `The term '${cmd}' is not recognized as a cmdlet, function or operable program.`
          : `'${cmd}' is not recognized as an internal or external command.`,
      ],
    };
  }
  if (ctx.skin === 'mac' && ctx.shell === 0) return { lines: [`zsh: command not found: ${cmd}`] };
  return { lines: [`bash: ${cmd}: command not found`] };
}
