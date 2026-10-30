// IPv4 subnet maths for the Subnet Calculator app and the Terminal's
// subnet / ipcalc commands. Pure functions, so they are easy to test.

export type SubnetResult = {
  address: string;
  prefix: number;
  mask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  /** Usable host addresses. */
  hosts: number;
  /** Every address in the block, including network and broadcast. */
  total: number;
  ipClass: string;
  kind: string;
  /** A short note on what this kind of address means in practice. */
  note?: string;
  binary: { address: string; mask: string; network: string };
};

export type SubnetError = { error: string };

const toInt = (ip: string) => ip.split('.').reduce((n, o) => n * 256 + Number(o), 0);
export const toIp = (n: number) => [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join('.');
const isOctets = (s: string) => /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(s);
const maskFromPrefix = (p: number) => (p === 0 ? 0 : (2 ** 32 - 2 ** (32 - p)) >>> 0);
const bin = (n: number) => [24, 16, 8, 0].map((s) => (Math.floor(n / 2 ** s) % 256).toString(2).padStart(8, '0')).join('.');

/** 255.255.255.0 -> 24; null when the mask's 1s are not all on the left. */
function prefixFromMask(mask: string): number | null {
  const n = toInt(mask);
  for (let p = 0; p <= 32; p++) if (maskFromPrefix(p) === n) return p;
  return null;
}

function classify(n: number): { kind: string; note?: string } {
  const [a, b] = [Math.floor(n / 2 ** 24), Math.floor(n / 2 ** 16) % 256];
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return { kind: 'Private (RFC 1918)', note: 'Used inside homes and offices. Not reachable from the internet without NAT.' };
  if (a === 127) return { kind: 'Loopback', note: 'The computer talking to itself. 127.0.0.1 always means "this machine".' };
  if (a === 169 && b === 254) return { kind: 'Link-local (APIPA)', note: 'Windows picks this when DHCP fails. On a help desk call it usually means the PC never got an address.' };
  if (a === 100 && b >= 64 && b <= 127) return { kind: 'Carrier-grade NAT (RFC 6598)', note: "Used by internet providers between your router and the internet." };
  if (a >= 224 && a <= 239) return { kind: 'Multicast', note: 'One sender, many listeners, like mDNS (224.0.0.251).' };
  if (a >= 240) return { kind: 'Reserved' };
  const c = Math.floor(n / 256) % 256;
  if ((a === 192 && b === 0 && c === 2) || (a === 198 && b === 51 && c === 100) || (a === 203 && b === 0 && c === 113)) return { kind: 'Documentation (RFC 5737)', note: 'Reserved for examples, never a real host.' };
  if (a === 0) return { kind: '"This network"' };
  return { kind: 'Public', note: 'Routable on the internet.' };
}

const ipClass = (n: number) => {
  const a = Math.floor(n / 2 ** 24);
  return a < 128 ? 'A' : a < 192 ? 'B' : a < 224 ? 'C' : a < 240 ? 'D (multicast)' : 'E (reserved)';
};

/**
 * Accepts "10.0.0.25/24", "10.0.0.25 255.255.255.0", "10.0.0.25/255.255.255.0"
 * or just "10.0.0.25" (treated as /24, like most home networks).
 */
export function calcSubnet(input: string): SubnetResult | SubnetError {
  const text = input.trim();
  if (!text) return { error: 'Type an address, for example 10.0.0.25/24.' };
  const m = text.match(/^(\S+?)\s*(?:\/\s*(\S+)|\s+(\S+))?$/);
  if (!m) return { error: 'Use an address and a prefix, for example 10.0.0.25/24.' };
  const [, ip, after, spaced] = m;
  if (!isOctets(ip)) return { error: `${ip} is not a valid IPv4 address. Each of the four numbers must be 0 to 255.` };
  const second = after ?? spaced;
  let prefix = 24;
  if (second !== undefined) {
    if (/^\d{1,2}$/.test(second)) {
      prefix = Number(second);
      if (prefix > 32) return { error: 'The prefix must be between /0 and /32.' };
    } else if (isOctets(second)) {
      const p = prefixFromMask(second);
      if (p === null) return { error: `${second} is not a valid subnet mask: its 1 bits must all be on the left.` };
      prefix = p;
    } else return { error: `${second} is not a prefix (like /24) or a mask (like 255.255.255.0).` };
  }

  const addr = toInt(ip);
  const mask = maskFromPrefix(prefix);
  const size = 2 ** (32 - prefix);
  const network = Math.floor(addr / size) * size;
  const broadcast = network + size - 1;
  // /31 links use both addresses (RFC 3021); /32 is a single host.
  const hosts = prefix === 32 ? 1 : prefix === 31 ? 2 : size - 2;
  const first = prefix >= 31 ? network : network + 1;
  const last = prefix >= 31 ? broadcast : broadcast - 1;
  const { kind, note } = classify(addr);
  return {
    address: ip,
    prefix,
    mask: toIp(mask),
    wildcard: toIp((2 ** 32 - 1 - mask) >>> 0),
    network: toIp(network),
    broadcast: toIp(broadcast),
    firstHost: toIp(first),
    lastHost: toIp(last),
    hosts,
    total: size,
    ipClass: ipClass(addr),
    kind,
    note,
    binary: { address: bin(addr), mask: bin(mask), network: bin(network) },
  };
}

/** Splits a network into smaller ones of the given prefix (at most `limit` shown). */
export function splitSubnet(r: SubnetResult, newPrefix: number, limit = 16): { network: string; range: string; broadcast: string }[] {
  if (newPrefix <= r.prefix || newPrefix > 32) return [];
  const size = 2 ** (32 - newPrefix);
  const count = 2 ** (newPrefix - r.prefix);
  const start = toInt(r.network);
  return Array.from({ length: Math.min(count, limit) }, (_, i) => {
    const net = start + i * size;
    const bc = net + size - 1;
    const first = newPrefix >= 31 ? net : net + 1;
    const last = newPrefix >= 31 ? bc : bc - 1;
    return { network: `${toIp(net)}/${newPrefix}`, range: `${toIp(first)} - ${toIp(last)}`, broadcast: toIp(bc) };
  });
}

export const isSubnetError = (r: SubnetResult | SubnetError): r is SubnetError => 'error' in r;

/** The calculator as Terminal text. */
export function subnetLines(input: string): string[] {
  const r = calcSubnet(input);
  if (isSubnetError(r)) return [r.error, 'Usage: subnet 10.0.0.25/24  (or an address and a mask: subnet 10.0.0.25 255.255.255.0)'];
  const row = (k: string, v: string) => `${k.padEnd(11)}${v}`;
  return [
    row('Address:', `${r.address}`.padEnd(18) + r.binary.address),
    row('Netmask:', `${r.mask} = ${r.prefix}`.padEnd(18) + r.binary.mask),
    row('Wildcard:', r.wildcard),
    '=>',
    row('Network:', `${r.network}/${r.prefix}`.padEnd(18) + r.binary.network),
    row('HostMin:', r.firstHost),
    row('HostMax:', r.lastHost),
    row('Broadcast:', r.broadcast),
    row('Hosts/Net:', `${r.hosts.toLocaleString('en-US')}`.padEnd(18) + `Class ${r.ipClass}, ${r.kind}`),
    ...(r.note ? [`Note:      ${r.note}`] : []),
  ];
}
