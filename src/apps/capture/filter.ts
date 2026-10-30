// A small Wireshark display filter: protocol names (dns, tcp, icmp...),
// ip.addr / ip.src / ip.dst, tcp.port / udp.port, tcp.flags.syn / .reset,
// frame.len, with ==, !=, >, <, and &&, ||, ! and brackets.
import type { Packet } from './packets';

type Test = (p: Packet) => boolean;

const PROTOS: Record<string, Test> = {
  tcp: (p) => p.meta.transport === 'tcp',
  udp: (p) => p.meta.transport === 'udp',
  ip: (p) => p.proto !== 'ARP',
  dns: (p) => p.proto === 'DNS' || p.proto === 'mDNS',
  mdns: (p) => p.proto === 'mDNS',
  arp: (p) => p.proto === 'ARP',
  icmp: (p) => p.proto === 'ICMP',
  dhcp: (p) => p.proto === 'DHCP',
  bootp: (p) => p.proto === 'DHCP',
  tls: (p) => p.proto === 'TLSv1.3',
  quic: (p) => p.proto === 'QUIC',
  ssdp: (p) => p.proto === 'SSDP',
  ssh: (p) => p.proto === 'SSHv2',
  http: (p) => p.proto === 'HTTP',
};

const FIELDS: Record<string, (p: Packet) => (string | number | undefined)[]> = {
  'ip.addr': (p) => [p.src, p.dst],
  'ip.src': (p) => [p.src],
  'ip.dst': (p) => [p.dst],
  'tcp.port': (p) => (p.meta.transport === 'tcp' ? [p.meta.srcPort, p.meta.dstPort] : []),
  'udp.port': (p) => (p.meta.transport === 'udp' ? [p.meta.srcPort, p.meta.dstPort] : []),
  'tcp.srcport': (p) => (p.meta.transport === 'tcp' ? [p.meta.srcPort] : []),
  'tcp.dstport': (p) => (p.meta.transport === 'tcp' ? [p.meta.dstPort] : []),
  'tcp.flags.syn': (p) => (p.meta.transport === 'tcp' ? [p.meta.tcpFlags?.includes('SYN') ? 1 : 0] : []),
  'tcp.flags.reset': (p) => (p.meta.transport === 'tcp' ? [p.meta.tcpFlags?.includes('RST') ? 1 : 0] : []),
  'tcp.flags.fin': (p) => (p.meta.transport === 'tcp' ? [p.meta.tcpFlags?.includes('FIN') ? 1 : 0] : []),
  'frame.len': (p) => [p.length],
};

/** Turns filter text into a test. null when the filter is not valid. */
export function compileFilter(text: string): Test | null {
  const src = text.trim();
  if (!src) return () => true;
  const tokens = src.match(/\(|\)|&&|\|\||==|!=|>=|<=|>|<|!|[A-Za-z0-9_.:\-]+/g);
  if (!tokens || tokens.join('').replace(/\s/g, '') !== src.replace(/\s/g, '')) return null;
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  function or(): Test | null {
    let left = and();
    while (left && (peek() === '||' || peek()?.toLowerCase() === 'or')) {
      next();
      const right = and();
      if (!right) return null;
      const l = left;
      left = (p) => l(p) || right(p);
    }
    return left;
  }
  function and(): Test | null {
    let left = not();
    while (left && (peek() === '&&' || peek()?.toLowerCase() === 'and')) {
      next();
      const right = not();
      if (!right) return null;
      const l = left;
      left = (p) => l(p) && right(p);
    }
    return left;
  }
  function not(): Test | null {
    if (peek() === '!' || peek()?.toLowerCase() === 'not') {
      next();
      const inner = not();
      return inner ? (p) => !inner(p) : null;
    }
    return atom();
  }
  function atom(): Test | null {
    const t = next();
    if (!t) return null;
    if (t === '(') {
      const inner = or();
      return next() === ')' ? inner : null;
    }
    const name = t.toLowerCase();
    const op = peek();
    if (op && ['==', '!=', '>', '<', '>=', '<='].includes(op)) {
      const field = FIELDS[name];
      if (!field) return null;
      next();
      const raw = next();
      if (raw === undefined) return null;
      const num = Number(raw);
      const val: string | number = Number.isNaN(num) || raw.includes('.') ? raw : num;
      const cmp = (x: string | number | undefined) => {
        if (x === undefined) return false;
        if (op === '==') return String(x) === String(val);
        if (op === '!=') return String(x) !== String(val);
        const a = Number(x), b = Number(val);
        return op === '>' ? a > b : op === '<' ? a < b : op === '>=' ? a >= b : a <= b;
      };
      // Like Wireshark: "!=" means none of the values match.
      return op === '!=' ? (p) => field(p).every(cmp) : (p) => field(p).some(cmp);
    }
    return PROTOS[name] ?? null;
  }

  const test = or();
  return test && i === tokens.length ? test : null;
}

/** Wireshark's default coloring rules, simplified. */
export function colorOf(p: Packet): string {
  const f = p.meta.tcpFlags ?? '';
  if (f.includes('RST')) return 'rst';
  if (f.includes('SYN') || f.includes('FIN')) return 'synfin';
  if (p.proto === 'ICMP') return 'icmp';
  if (p.proto === 'ARP') return 'arp';
  if (p.meta.transport === 'tcp') return 'tcp';
  return 'udp';
}

export const quickFilters = ['dns', 'icmp', 'tcp.port == 443', 'ip.addr == 10.0.0.4', 'arp', 'dhcp', 'tcp.flags.syn == 1'];
