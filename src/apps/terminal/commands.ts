// The Terminal's command parser: a small pure function, so it is easy to test.
// It takes the typed text and returns the lines to print, plus an optional
// side effect for the app to perform (clear the screen or open something).
// All the words it prints come from src/content/terminal.ts.
import { terminalText as T } from '../../content/terminal';
import type { SkinId } from '../../os/types';
import { engineName, popularSearches, search } from '../../content/search';
import { NET, dnsLookup, ipconfig, isHostName, linuxIpAddr, macIfconfig, nslookup, ping, trace, type Lookup } from './network';

/** online: the desktop's Wi-Fi toggle. lookup: swapped out in tests. */
export type TermContext = { skin: SkinId; shell: 0 | 1; online?: boolean; lookup?: Lookup };
/** later: more lines that arrive after a network lookup (nslookup, ping). */
export type CommandResult = { lines: string[]; clear?: boolean; open?: string; search?: string; later?: Promise<string[]> };

const OS_NAME: Record<SkinId, string> = { windows: 'Windows', mac: 'macOS', linux: 'Linux' };
/** The right command on each OS, for the "wrong OS" tips. */
const EQUIV = {
  netconfig: { windows: 'ipconfig /all', mac: 'ifconfig', linux: 'ip a' },
  trace: { windows: 'tracert google.com', mac: 'traceroute google.com', linux: 'traceroute google.com' },
  clear: { windows: 'cls', mac: 'clear', linux: 'clear' },
  flushdns: { windows: 'ipconfig /flushdns', mac: 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder', linux: 'resolvectl flush-caches' },
  list: { windows: 'dir', mac: 'ls', linux: 'ls' },
} as const;

/** The OS's own "not found" error, then a tip with the right command for this OS. */
function wrongOs(cmd: string, owner: string, use: string, ctx: TermContext, error?: string[]): CommandResult {
  return { lines: [...(error ?? notFound(cmd, ctx).lines), `Tip: ${cmd} is a ${owner} command. On ${OS_NAME[ctx.skin]}, type: ${use}`] };
}

/** The last word that isn't a flag: "ping -c 4 google.com" -> "google.com". */
const target = (parts: string[]) => parts.slice(1).filter((p) => !p.startsWith('-') && !/^\d+$/.test(p)).pop();

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
  const online = ctx.online ?? true;
  const lookup = ctx.lookup ?? dnsLookup;
  const cmdExe = win && ctx.shell === 1;

  switch (cmd) {
    case 'clear':
      if (cmdExe) return wrongOs(cmd, 'PowerShell, macOS and Linux', 'cls', ctx);
      return { lines: [], clear: true };
    case 'cls':
      if (!win) return wrongOs(cmd, 'Windows', EQUIV.clear[ctx.skin], ctx);
      return { lines: [], clear: true };
    case 'help':
      return {
        lines: [
          `Commands: help, whoami, hostname, projects, skills, education, interests, contact, search <words>, ${win ? 'dir' : 'ls'}, pwd, ${EQUIV.netconfig[ctx.skin]}, nslookup <name>, ping <host>, ${win ? 'tracert' : 'traceroute'} <host>, ${win ? 'ipconfig /flushdns, ' : ctx.skin === 'linux' ? 'ip route, ' : ''}open <app>, ${win ? 'cls' : 'clear'}`,
          'Try: nslookup google.com, search group policy, open resume, ping plowvm',
        ],
      };
    case 'whoami':
      return { lines: [T.whoami] };
    case 'hostname':
      return { lines: [NET.host[ctx.skin]] };
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
      if (cmdExe) return wrongOs(cmd, 'PowerShell, macOS and Linux', 'dir', ctx);
      return { lines: T.ls };
    case 'dir':
      if (ctx.skin === 'mac') return wrongOs(cmd, 'Windows', 'ls', ctx);
      return { lines: T.ls };
    case 'pwd':
      return { lines: [win ? 'Path: C:\\Users\\mark' : '/home/mark'] };
    case 'uname':
      return { lines: [ctx.skin === 'mac' ? 'Darwin' : ctx.skin === 'linux' ? 'Linux' : 'uname is not a Windows command. Try: help'] };
    case 'ipconfig': {
      const opt = (parts[1] ?? '').toLowerCase().replace(/^-/, '/');
      if (ctx.skin === 'mac') {
        // macOS has its own small ipconfig, mostly for scripts.
        if (opt === 'getifaddr') return { lines: [parts[2] === 'en0' || !parts[2] ? NET.ip : ''] };
        return wrongOs(cmd, 'Windows', `${EQUIV.netconfig.mac} (or: ipconfig getifaddr en0)`, ctx, ['usage: ipconfig <command> <args>']);
      }
      if (!win) return wrongOs(cmd, 'Windows', EQUIV.netconfig.linux, ctx);
      if (!opt) return { lines: ipconfig(false) };
      if (opt === '/all') return { lines: ipconfig(true) };
      if (opt === '/flushdns') return { lines: ['', 'Windows IP Configuration', '', 'Successfully flushed the DNS Resolver Cache.'] };
      return {
        lines: [
          '',
          'Error: unrecognized or incomplete command line.',
          '',
          'USAGE:',
          '    ipconfig [/? | /all | /renew [adapter] | /release [adapter] | /flushdns | /displaydns | /registerdns]',
          'Try: ipconfig /all',
        ],
      };
    }
    case 'ifconfig':
      if (win) return wrongOs(cmd, 'macOS and older Linux', EQUIV.netconfig.windows, ctx);
      if (ctx.skin === 'linux')
        return {
          lines: ["Command 'ifconfig' not found, but can be installed with:", '', 'sudo apt install net-tools', '', `Tip: modern Linux uses the ip command. Type: ${EQUIV.netconfig.linux}`],
        };
      return { lines: parts[1] === 'en0' ? macIfconfig().slice(6) : macIfconfig() };
    case 'ip': {
      if (ctx.skin !== 'linux') return wrongOs(cmd, 'Linux', EQUIV.netconfig[ctx.skin], ctx);
      const sub = (parts[1] ?? '').toLowerCase();
      if (['a', 'addr', 'address'].includes(sub)) return { lines: linuxIpAddr() };
      if (['r', 'route'].includes(sub))
        return {
          lines: [
            `default via ${NET.gateway} dev wlp2s0 proto dhcp src ${NET.ip} metric 600`,
            `10.0.0.0/24 dev wlp2s0 proto kernel scope link src ${NET.ip} metric 600`,
          ],
        };
      return { lines: ['Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }', 'Try: ip a, ip route'] };
    }
    case 'nslookup': {
      const name = target(parts);
      if (!name) return { lines: ['Usage: nslookup <name>, for example: nslookup google.com'] };
      if (!isHostName(name)) return { lines: [`*** Invalid name: ${name}`] };
      return { lines: [], later: nslookup(name, ctx.skin, online, lookup) };
    }
    case 'ping': {
      const host = target(parts);
      if (!host) return { lines: [win ? 'Usage: ping [-n count] target_name, for example: ping google.com' : 'usage: ping host, for example: ping google.com'] };
      if (!isHostName(host)) return { lines: [win ? `Ping request could not find host ${host}. Please check the name and try again.` : `ping: ${host}: Name or service not known`] };
      return { lines: [], later: ping(host, ctx.skin, online, lookup) };
    }
    case 'tracert':
    case 'traceroute': {
      if (cmd === 'tracert' && !win) return wrongOs(cmd, 'Windows', EQUIV.trace[ctx.skin], ctx);
      if (cmd === 'traceroute' && win) return wrongOs(cmd, 'macOS and Linux', EQUIV.trace.windows, ctx);
      const host = target(parts);
      if (!host) return { lines: [`Usage: ${cmd} <host>, for example: ${cmd} google.com`] };
      return { lines: [], later: trace(host, ctx.skin, online, lookup) };
    }
    case 'dscacheutil':
    case 'resolvectl':
      if (win) return wrongOs(cmd, cmd === 'resolvectl' ? 'Linux' : 'macOS', EQUIV.flushdns.windows, ctx);
      return { lines: [] };
    case 'sudo': {
      if (arg.toLowerCase() === 'hire mark') return { lines: T.hire, open: 'contact' };
      const next = (parts[1] ?? '').toLowerCase();
      if (win && next) return wrongOs('sudo', 'macOS and Linux', 'run the command without sudo (open the terminal as administrator if needed)', ctx);
      // The usual way to flush the DNS cache needs sudo.
      if (['dscacheutil', 'killall', 'resolvectl'].includes(next)) {
        if (next === 'resolvectl' && ctx.skin === 'mac') return wrongOs('resolvectl', 'Linux', EQUIV.flushdns.mac, ctx);
        if (next !== 'resolvectl' && ctx.skin === 'linux') return wrongOs(next, 'macOS', EQUIV.flushdns.linux, ctx);
        return { lines: [`[sudo] password for ${T.user}: ********`] };
      }
      return { lines: ['Nice try. Only one sudo command works here, and it involves hiring Mark.'] };
    }
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
