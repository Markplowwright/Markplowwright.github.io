// The Terminal's pretend computer on a pretend network, written to match what
// the real commands print on each OS. Names are looked up for real (DNS over
// HTTPS) so nslookup and ping show today's answers, with a small built-in list
// for when the visitor is offline. The lab names (PLOWVM, plowlab.local) come
// from Mark's Windows Server home lab, whose domain controller is the DNS server.
import type { SkinId } from '../../os/types';
import { reportNet } from './netActivity';

export const NET = {
  ip: '10.0.0.25',
  mask: '255.255.255.0',
  broadcast: '10.0.0.255',
  gateway: '10.0.0.1',
  dns: '10.0.0.4',
  dnsName: 'PLOWVM.plowlab.local',
  domain: 'plowlab.local',
  host: { windows: 'MARK-PORTFOLIO', mac: 'Marks-MacBook-Pro', linux: 'mark-portfolio' } as Record<SkinId, string>,
  macAddr: { windows: '3C-58-C2-4A-91-7E', mac: 'a4:83:e7:2b:1c:4d', linux: '3c:58:c2:4a:91:7e' } as Record<SkinId, string>,
  ipv6: { windows: 'fe80::8d4c:2b1e:7a3f:91c2', mac: 'fe80::1c8a:4f2e:9b3d:7a21', linux: 'fe80::3e58:c2ff:fe4a:917e' } as Record<SkinId, string>,
};

export type DnsAnswer = { name: string; a: string[]; aaaa: string[]; aliases: string[]; internal: boolean };
export type Lookup = (name: string) => Promise<DnsAnswer | null>;

/** The home lab's own names, answered by its domain controller. */
const LAB: Record<string, string> = {
  plowvm: '10.0.0.4',
  'plowvm.plowlab.local': '10.0.0.4',
  'plowlab.local': '10.0.0.4',
  plowclient: '10.0.0.5',
  'plowclient.plowlab.local': '10.0.0.5',
};

/** Used only when a real lookup can't be made (offline, blocked). */
const KNOWN: Record<string, { a: string[]; aaaa?: string[] }> = {
  'google.com': { a: ['142.250.80.46'], aaaa: ['2607:f8b0:4006:80f::200e'] },
  'www.google.com': { a: ['142.250.80.36'], aaaa: ['2607:f8b0:4006:80f::2004'] },
  'github.com': { a: ['140.82.112.3'] },
  'microsoft.com': { a: ['20.76.201.171', '20.70.246.20', '20.236.44.162', '20.231.239.246', '20.112.250.133'] },
  'linkedin.com': { a: ['13.107.42.14'], aaaa: ['2620:1ec:21::14'] },
  'markplowwright.github.io': { a: ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'] },
  'cloudflare.com': { a: ['104.16.132.229', '104.16.133.229'] },
  'amazon.com': { a: ['205.251.242.103', '52.94.236.248', '54.239.28.85'] },
};

export const isHostName = (s: string) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.?$/i.test(s) && s.length <= 253;

async function doh(name: string, type: 'A' | 'AAAA', signal: AbortSignal) {
  const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`, { signal, headers: { accept: 'application/dns-json' } });
  if (!r.ok) throw new Error(`DNS ${r.status}`);
  return (await r.json()) as { Status: number; Answer?: { name: string; type: number; data: string }[] };
}

/** Looks a name up: the lab first, then real DNS, then the built-in list. null = no such name. */
/** Names for well-known addresses, for nslookup <ip> and traceroute. */
const REVERSE: Record<string, string> = {
  '8.8.8.8': 'dns.google',
  '8.8.4.4': 'dns.google',
  '1.1.1.1': 'one.one.one.one',
  '10.0.0.1': 'router.plowlab.local',
  '10.0.0.4': 'PLOWVM.plowlab.local',
  '10.0.0.5': 'PLOWCLIENT.plowlab.local',
};
export const isIpv4 = (s: string) => /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(s);
const isPrivate = (ip: string) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/.test(ip);

export const dnsLookup: Lookup = async (raw) => {
  const name = raw.toLowerCase().replace(/\.$/, '');
  // An address needs no lookup: ping 8.8.8.8, ping 10.0.0.1.
  if (isIpv4(name)) return { name: REVERSE[name] ?? name, a: [name], aaaa: [], aliases: [], internal: isPrivate(name) };
  if (LAB[name]) {
    const fqdn = name.includes('.') ? name : `${name}.${NET.domain}`;
    return { name: fqdn, a: [LAB[name]], aaaa: [], aliases: [], internal: true };
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 3500);
  try {
    const [a, aaaa] = await Promise.all([doh(name, 'A', ctl.signal), doh(name, 'AAAA', ctl.signal).catch(() => ({ Status: 0, Answer: [] }))]);
    if (a.Status === 3) return null;
    const answers = [...(a.Answer ?? []), ...(aaaa.Answer ?? [])];
    const final = [...answers].reverse().find((x) => x.type === 1 || x.type === 28)?.name.replace(/\.$/, '') ?? name;
    const aliases = [...new Set(answers.filter((x) => x.type === 5).map((x) => x.name.replace(/\.$/, '')))];
    const out = {
      name: final,
      a: [...new Set((a.Answer ?? []).filter((x) => x.type === 1).map((x) => x.data))],
      aaaa: [...new Set((aaaa.Answer ?? []).filter((x) => x.type === 28).map((x) => x.data))],
      aliases,
      internal: false,
    };
    return out.a.length || out.aaaa.length ? out : null;
  } catch {
    const k = KNOWN[name];
    return k ? { name, a: k.a, aaaa: k.aaaa ?? [], aliases: [], internal: false } : null;
  } finally {
    clearTimeout(timer);
  }
};

// ---------------------------------------------------------------- output

// Windows ipconfig labels, padded exactly as Windows prints them.
const WIN_LABELS = [
  'Host Name . . . . . . . . . . . . ',
  'Primary Dns Suffix  . . . . . . . ',
  'Node Type . . . . . . . . . . . . ',
  'IP Routing Enabled. . . . . . . . ',
  'WINS Proxy Enabled. . . . . . . . ',
  'DNS Suffix Search List. . . . . . ',
  'Connection-specific DNS Suffix  . ',
  'Description . . . . . . . . . . . ',
  'Physical Address. . . . . . . . . ',
  'DHCP Enabled. . . . . . . . . . . ',
  'Autoconfiguration Enabled . . . . ',
  'Link-local IPv6 Address . . . . . ',
  'IPv4 Address. . . . . . . . . . . ',
  'Subnet Mask . . . . . . . . . . . ',
  'Lease Obtained. . . . . . . . . . ',
  'Lease Expires . . . . . . . . . . ',
  'Default Gateway . . . . . . . . . ',
  'DHCP Server . . . . . . . . . . . ',
  'DHCPv6 IAID . . . . . . . . . . . ',
  'DHCPv6 Client DUID. . . . . . . . ',
  'DNS Servers . . . . . . . . . . . ',
  'NetBIOS over Tcpip. . . . . . . . ',
  'Media State . . . . . . . . . . . ',
];
const win = (label: string, value: string) => {
  const padded = WIN_LABELS.find((l) => l.startsWith(label) && /^[ .]/.test(l.slice(label.length))) ?? label.padEnd(34);
  return `   ${padded}: ${value}`.trimEnd();
};

function leaseTimes() {
  const now = new Date();
  const got = new Date(now.getTime() - 3 * 3600_000);
  const until = new Date(got.getTime() + 24 * 3600_000);
  const f = (d: Date) =>
    d.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' }).replace(' at ', ' ');
  return [f(got), f(until)];
}

export function ipconfig(all: boolean): string[] {
  const [got, until] = leaseTimes();
  if (!all)
    return [
      '',
      'Windows IP Configuration',
      '',
      '',
      'Wireless LAN adapter Wi-Fi:',
      '',
      win('Connection-specific DNS Suffix', NET.domain),
      win('Link-local IPv6 Address', `${NET.ipv6.windows}%12`),
      win('IPv4 Address', NET.ip),
      win('Subnet Mask', NET.mask),
      win('Default Gateway', NET.gateway),
      '',
      'Ethernet adapter Bluetooth Network Connection:',
      '',
      win('Media State', 'Media disconnected'),
      win('Connection-specific DNS Suffix', ''),
    ];
  return [
    '',
    'Windows IP Configuration',
    '',
    win('Host Name', NET.host.windows),
    win('Primary Dns Suffix', NET.domain),
    win('Node Type', 'Hybrid'),
    win('IP Routing Enabled', 'No'),
    win('WINS Proxy Enabled', 'No'),
    win('DNS Suffix Search List', NET.domain),
    '',
    'Wireless LAN adapter Wi-Fi:',
    '',
    win('Connection-specific DNS Suffix', NET.domain),
    win('Description', 'Intel(R) Wi-Fi 6E AX211 160MHz'),
    win('Physical Address', NET.macAddr.windows),
    win('DHCP Enabled', 'Yes'),
    win('Autoconfiguration Enabled', 'Yes'),
    win('Link-local IPv6 Address', `${NET.ipv6.windows}%12(Preferred)`),
    win('IPv4 Address', `${NET.ip}(Preferred)`),
    win('Subnet Mask', NET.mask),
    win('Lease Obtained', got),
    win('Lease Expires', until),
    win('Default Gateway', NET.gateway),
    win('DHCP Server', NET.gateway),
    win('DHCPv6 IAID', '121395394'),
    win('DHCPv6 Client DUID', '00-01-00-01-2D-8A-3F-1B-3C-58-C2-4A-91-7E'),
    win('DNS Servers', NET.dns),
    win('NetBIOS over Tcpip', 'Enabled'),
    '',
    'Ethernet adapter Bluetooth Network Connection:',
    '',
    win('Media State', 'Media disconnected'),
    win('Connection-specific DNS Suffix', ''),
    win('Description', 'Bluetooth Device (Personal Area Network)'),
    win('Physical Address', '3C-58-C2-4A-91-7F'),
    win('DHCP Enabled', 'Yes'),
    win('Autoconfiguration Enabled', 'Yes'),
  ];
}

export const macIfconfig = (): string[] => [
  'lo0: flags=8049<UP,LOOPBACK,RUNNING,MULTICAST> mtu 16384',
  '\toptions=1203<RXCSUM,TXCSUM,TXSTATUS,SW_TIMESTAMP>',
  '\tinet 127.0.0.1 netmask 0xff000000',
  '\tinet6 ::1 prefixlen 128',
  '\tinet6 fe80::1%lo0 prefixlen 64 scopeid 0x1',
  '\tnd6 options=201<PERFORMNUD,DAD>',
  'en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500',
  '\toptions=6460<TSO4,TSO6,CHANNEL_IO,PARTIAL_CSUM,ZEROINVERT_CSUM>',
  `\tether ${NET.macAddr.mac}`,
  `\tinet6 ${NET.ipv6.mac}%en0 prefixlen 64 secured scopeid 0xe`,
  `\tinet ${NET.ip} netmask 0xffffff00 broadcast ${NET.broadcast}`,
  '\tnd6 options=201<PERFORMNUD,DAD>',
  '\tmedia: autoselect',
  '\tstatus: active',
];

export const linuxIpAddr = (): string[] => [
  '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000',
  '    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
  '    inet 127.0.0.1/8 scope host lo',
  '       valid_lft forever preferred_lft forever',
  '    inet6 ::1/128 scope host noprefixroute',
  '       valid_lft forever preferred_lft forever',
  '2: wlp2s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000',
  `    link/ether ${NET.macAddr.linux} brd ff:ff:ff:ff:ff:ff`,
  `    inet ${NET.ip}/24 brd ${NET.broadcast} scope global dynamic noprefixroute wlp2s0`,
  '       valid_lft 75412sec preferred_lft 75412sec',
  `    inet6 ${NET.ipv6.linux}/64 scope link noprefixroute`,
  '       valid_lft forever preferred_lft forever',
];

/** Tells Packet Capture about a DNS query (addresses typed directly need none). */
function reportDns(name: string, r: DnsAnswer | null) {
  if (isIpv4(name)) return;
  reportNet({ type: 'dns', name: r?.name ?? name, a: r?.a ?? [], aaaa: r?.aaaa ?? [], found: !!r });
}

/** nslookup, as each OS prints it. */
export async function nslookup(name: string, skin: SkinId, online: boolean, lookup: Lookup): Promise<string[]> {
  if (!online)
    return skin === 'windows'
      ? [`DNS request timed out.`, '    timeout was 2 seconds.', `Server:  UnKnown`, `Address:  ${NET.dns}`, '', `*** Request to UnKnown timed-out`]
      : [';; connection timed out; no servers could be reached'];
  const r = await lookup(name);
  reportDns(name, r);
  if (skin === 'windows') {
    const head = [`Server:  ${NET.dnsName}`, `Address:  ${NET.dns}`, ''];
    if (!r) return [...head, `*** ${NET.dnsName} can't find ${name}: Non-existent domain`];
    const addrs = [...r.aaaa, ...r.a];
    return [
      ...head,
      ...(r.internal ? [] : ['Non-authoritative answer:']),
      `Name:    ${r.name}`,
      ...(addrs.length > 1 ? [`Addresses:  ${addrs[0]}`, ...addrs.slice(1).map((a) => `          ${a}`)] : [`Address:  ${addrs[0]}`]),
      ...(r.aliases.length ? [`Aliases:  ${r.aliases.join('\n          ')}`] : []),
      '',
    ];
  }
  const head = [`Server:\t\t${NET.dns}`, `Address:\t${NET.dns}#53`, ''];
  if (!r) return [...head, `** server can't find ${name}: NXDOMAIN`, ''];
  const chain = r.aliases.map((a, i) => `${a}\tcanonical name = ${r.aliases[i + 1] ?? r.name}.`);
  const addrs = skin === 'mac' ? r.a : [...r.a, ...r.aaaa];
  return [...head, ...(r.internal ? [] : ['Non-authoritative answer:']), ...chain, ...addrs.flatMap((a) => [`Name:\t${r.name}`, `Address: ${a}`]), ''];
}

const ms = (base: number) => Math.round((base + Math.random() * 4) * 1000) / 1000;

/** ping, four replies, as each OS prints it. */
export async function ping(host: string, skin: SkinId, online: boolean, lookup: Lookup): Promise<string[]> {
  const r = online ? await lookup(host) : null;
  if (online) reportDns(host, r);
  if (r) reportNet({ type: 'ping', ip: r.a[0] ?? r.aaaa[0], count: 4, internal: r.internal });
  if (!r) {
    if (skin === 'windows') return online ? [`Ping request could not find host ${host}. Please check the name and try again.`] : ['PING: transmit failed. General failure.'];
    return skin === 'mac' ? [`ping: cannot resolve ${host}: Unknown host`] : [`ping: ${host}: ${online ? 'Name or service not known' : 'Temporary failure in name resolution'}`];
  }
  const ip = r.a[0] ?? r.aaaa[0];
  const base = r.internal ? 1 : 11;
  const t = [ms(base), ms(base), ms(base), ms(base)];
  const ttl = r.internal ? (skin === 'windows' ? 128 : 128) : 117;
  const min = Math.min(...t), max = Math.max(...t), avg = t.reduce((a, b) => a + b, 0) / 4;
  if (skin === 'windows')
    return [
      '',
      isIpv4(host) ? `Pinging ${ip} with 32 bytes of data:` : `Pinging ${r.name} [${ip}] with 32 bytes of data:`,
      ...t.map((x) => `Reply from ${ip}: bytes=32 time=${Math.round(x)}ms TTL=${ttl}`),
      '',
      `Ping statistics for ${ip}:`,
      '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),',
      'Approximate round trip times in milli-seconds:',
      `    Minimum = ${Math.round(min)}ms, Maximum = ${Math.round(max)}ms, Average = ${Math.round(avg)}ms`,
    ];
  if (skin === 'mac')
    return [
      `PING ${host} (${ip}): 56 data bytes`,
      ...t.map((x, i) => `64 bytes from ${ip}: icmp_seq=${i} ttl=${ttl} time=${x.toFixed(3)} ms`),
      '',
      `--- ${host} ping statistics ---`,
      '4 packets transmitted, 4 packets received, 0.0% packet loss',
      `round-trip min/avg/max/stddev = ${min.toFixed(3)}/${avg.toFixed(3)}/${max.toFixed(3)}/${((max - min) / 3).toFixed(3)} ms`,
    ];
  return [
    `PING ${host} (${ip}) 56(84) bytes of data.`,
    ...t.map((x, i) => `64 bytes from ${ip}: icmp_seq=${i + 1} ttl=${ttl} time=${x.toFixed(1)} ms`),
    '',
    `--- ${host} ping statistics ---`,
    '4 packets transmitted, 4 received, 0% packet loss, time 3004ms',
    `rtt min/avg/max/mdev = ${min.toFixed(3)}/${avg.toFixed(3)}/${max.toFixed(3)}/${((max - min) / 3).toFixed(3)} ms`,
  ];
}

/** tracert / traceroute: home router, ISP, then the destination. */
export async function trace(host: string, skin: SkinId, online: boolean, lookup: Lookup): Promise<string[]> {
  const r = online ? await lookup(host) : null;
  if (!r) return skin === 'windows' ? [`Unable to resolve target system name ${host}.`] : [`traceroute: unknown host ${host}`];
  const ip = r.a[0] ?? r.aaaa[0];
  const hops = r.internal ? [ip] : [NET.gateway, '100.64.0.1', '96.120.18.33', '68.86.90.25', '108.170.248.65', ip];
  reportDns(host, r);
  reportNet({ type: 'trace', ip, hops });
  if (skin === 'windows')
    return [
      '',
      `Tracing route to ${r.name} [${ip}]`,
      'over a maximum of 30 hops:',
      '',
      ...hops.map((h, i) => `  ${String(i + 1).padStart(2)}    ${String(i * 3 + 2).padStart(2)} ms    ${String(i * 3 + 2).padStart(2)} ms    ${String(i * 3 + 3).padStart(2)} ms  ${h}`),
      '',
      'Trace complete.',
    ];
  return [
    `traceroute to ${host} (${ip}), 64 hops max, 52 byte packets`,
    ...hops.map((h, i) => ` ${String(i + 1).padStart(2)}  ${h} (${h})  ${(i * 3 + 2.1).toFixed(3)} ms  ${(i * 3 + 2.4).toFixed(3)} ms  ${(i * 3 + 2.8).toFixed(3)} ms`),
  ];
}
