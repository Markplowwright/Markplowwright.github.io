// The packets Packet Capture shows. Everything is simulated: traffic from the
// portfolio's pretend PC (10.0.0.25) on its pretend network, laid out the way
// Wireshark shows it. Each packet has the list columns, a details tree, and
// bytes for the hex pane (real Ethernet/IP/UDP/TCP headers, DNS names encoded
// properly, other payload bytes made up).
import { NET } from '../terminal/network';
import type { SkinId } from '../../os/types';

export type Proto = 'ARP' | 'DHCP' | 'DNS' | 'mDNS' | 'SSDP' | 'TCP' | 'TLSv1.3' | 'QUIC' | 'ICMP' | 'SSHv2' | 'HTTP';
export type Layer = { title: string; fields: string[] };

export type Packet = {
  no: number;
  time: number;
  src: string;
  dst: string;
  proto: Proto;
  length: number;
  info: string;
  layers: Layer[];
  bytes: number[];
  /** For display filters and coloring. */
  meta: { tcpFlags?: string; srcPort?: number; dstPort?: number; transport?: 'tcp' | 'udp' };
};

/** A packet before it gets its number and time. */
export type Draft = Omit<Packet, 'no' | 'time'>;

// ---------------------------------------------------------------- addresses

const ROUTER_MAC = '70:3a:0e:00:00:01';
const DC_MAC = '00:15:5d:4a:2b:1c';
const PRINTER_MAC = 'a4:5d:36:9e:10:60';
const BCAST = 'ff:ff:ff:ff:ff:ff';

export const myMac = (skin: SkinId) => NET.macAddr[skin].toLowerCase().replace(/-/g, ':');
const macFor = (ip: string, skin: SkinId) =>
  ip === NET.ip ? myMac(skin) : ip === NET.dns ? DC_MAC : ip === '10.0.0.60' ? PRINTER_MAC : ROUTER_MAC;
const vendor = (mac: string) =>
  mac === ROUTER_MAC ? `Netgear_00:00:01` : mac === DC_MAC ? 'Microsoft_4a:2b:1c' : mac === PRINTER_MAC ? 'HewlettP_9e:10:60' : mac === BCAST ? 'Broadcast' : mac.startsWith('a4:83:e7') ? `Apple_${mac.slice(9)}` : `Intel_${mac.slice(9)}`;

// ---------------------------------------------------------------- bytes

let seed = 7;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const randInt = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
const ipBytes = (ip: string) => ip.split('.').map(Number);
const macBytes = (mac: string) => mac.split(':').map((h) => parseInt(h, 16));
const u16 = (n: number) => [(n >> 8) & 255, n & 255];
const filler = (n: number) => Array.from({ length: Math.max(0, n) }, () => randInt(0, 255));
/** DNS name in wire format: 6google3com0. */
const dnsName = (name: string) => [...name.split('.').flatMap((l) => [l.length, ...[...l].map((c) => c.charCodeAt(0))]), 0];

function frame(dstMac: string, srcMac: string, type: number, payload: number[]) {
  return [...macBytes(dstMac), ...macBytes(srcMac), ...u16(type), ...payload];
}
function ipv4(src: string, dst: string, proto: number, payload: number[], ttl = 128) {
  const len = 20 + payload.length;
  return [0x45, 0, ...u16(len), ...u16(randInt(0, 65535)), 0x40, 0, ttl, proto, 0, 0, ...ipBytes(src), ...ipBytes(dst), ...payload];
}
const udp = (sp: number, dp: number, payload: number[]) => [...u16(sp), ...u16(dp), ...u16(8 + payload.length), 0, 0, ...payload];
const TCP_FLAGS: Record<string, number> = { SYN: 0x02, 'SYN, ACK': 0x12, ACK: 0x10, 'PSH, ACK': 0x18, 'FIN, ACK': 0x11, 'RST, ACK': 0x14, RST: 0x04 };
const tcp = (sp: number, dp: number, flags: string, payload: number[]) => [
  ...u16(sp), ...u16(dp), ...filler(4), ...filler(4), 0x50, TCP_FLAGS[flags] ?? 0x10, ...u16(64240), 0, 0, 0, 0, ...payload,
];

// ---------------------------------------------------------------- layers

const frameLayer = (len: number, iface: string): Layer => ({
  title: `Frame: ${len} bytes on wire (${len * 8} bits), ${len} bytes captured (${len * 8} bits) on interface ${iface}`,
  fields: [`Interface: ${iface}`, 'Encapsulation type: Ethernet (1)', `Frame Length: ${len} bytes (${len * 8} bits)`],
});
const ethLayer = (src: string, dst: string, type: string): Layer => ({
  title: `Ethernet II, Src: ${vendor(src)} (${src}), Dst: ${vendor(dst)} (${dst})`,
  fields: [`Destination: ${vendor(dst)} (${dst})`, `Source: ${vendor(src)} (${src})`, `Type: ${type}`],
});
const ipLayer = (src: string, dst: string, proto: string, ttl: number, len: number): Layer => ({
  title: `Internet Protocol Version 4, Src: ${src}, Dst: ${dst}`,
  fields: ['0100 .... = Version: 4', '.... 0101 = Header Length: 20 bytes (5)', `Total Length: ${len}`, 'Flags: 0x2, Don\'t fragment', `Time to Live: ${ttl}`, `Protocol: ${proto}`, `Source Address: ${src}`, `Destination Address: ${dst}`],
});
const udpLayer = (sp: number, dp: number, len: number): Layer => ({
  title: `User Datagram Protocol, Src Port: ${sp}, Dst Port: ${dp}`,
  fields: [`Source Port: ${sp}`, `Destination Port: ${dp}`, `Length: ${len}`, 'Checksum: [unverified]'],
});
const tcpLayer = (sp: number, dp: number, flags: string, seq: number, ack: number, len: number): Layer => ({
  title: `Transmission Control Protocol, Src Port: ${sp}, Dst Port: ${dp}, Seq: ${seq}${flags.includes('ACK') ? `, Ack: ${ack}` : ''}, Len: ${len}`,
  fields: [`Source Port: ${sp}`, `Destination Port: ${dp}`, `Sequence Number: ${seq}    (relative sequence number)`, ...(flags.includes('ACK') ? [`Acknowledgment Number: ${ack}`] : []), `Flags: 0x${(TCP_FLAGS[flags] ?? 0x10).toString(16).padStart(3, '0')} (${flags})`, 'Window: 64240', `TCP payload (${len} bytes)`],
});

// ---------------------------------------------------------------- builders

type Ctx = { skin: SkinId; iface: string };

function udpPacket(c: Ctx, o: { src: string; dst: string; sp: number; dp: number; proto: Proto; info: string; app: Layer; payload: number[]; dstMac?: string; ttl?: number }): Draft {
  const srcMac = macFor(o.src, c.skin);
  const dstMac = o.dstMac ?? macFor(o.dst, c.skin);
  const u = udp(o.sp, o.dp, o.payload);
  const ip = ipv4(o.src, o.dst, 17, u, o.ttl ?? (o.src === NET.ip ? 128 : 64));
  const bytes = frame(dstMac, srcMac, 0x0800, ip);
  return {
    src: o.src, dst: o.dst, proto: o.proto, length: bytes.length, info: o.info, bytes,
    layers: [frameLayer(bytes.length, c.iface), ethLayer(srcMac, dstMac, 'IPv4 (0x0800)'), ipLayer(o.src, o.dst, 'UDP (17)', o.ttl ?? 128, ip.length), udpLayer(o.sp, o.dp, u.length), o.app],
    meta: { srcPort: o.sp, dstPort: o.dp, transport: 'udp' },
  };
}

function tcpPacket(c: Ctx, o: { src: string; dst: string; sp: number; dp: number; flags: string; seq: number; ack: number; len?: number; proto?: Proto; info?: string; app?: Layer }): Draft {
  const srcMac = macFor(o.src, c.skin);
  const dstMac = macFor(o.dst, c.skin);
  const len = o.len ?? 0;
  const t = tcp(o.sp, o.dp, o.flags, filler(len));
  const ip = ipv4(o.src, o.dst, 6, t, o.src === NET.ip ? 128 : 54);
  const bytes = frame(dstMac, srcMac, 0x0800, ip);
  const info = o.info ?? `${o.sp} → ${o.dp} [${o.flags}] Seq=${o.seq}${o.flags.includes('ACK') ? ` Ack=${o.ack}` : ''} Win=64240 Len=${len}`;
  return {
    src: o.src, dst: o.dst, proto: o.proto ?? 'TCP', length: bytes.length, info, bytes,
    layers: [frameLayer(bytes.length, c.iface), ethLayer(srcMac, dstMac, 'IPv4 (0x0800)'), ipLayer(o.src, o.dst, 'TCP (6)', 128, ip.length), tcpLayer(o.sp, o.dp, o.flags, o.seq, o.ack, len), ...(o.app ? [o.app] : [])],
    meta: { tcpFlags: o.flags, srcPort: o.sp, dstPort: o.dp, transport: 'tcp' },
  };
}

const ephemeral = () => randInt(49152, 65000);

/** A DNS query and its answer, between this PC and PLOWVM. */
export function dnsExchange(c: Ctx, name: string, a: string[], aaaa: string[], found: boolean): Draft[] {
  const id = randInt(0, 65535);
  const idHex = `0x${id.toString(16).padStart(4, '0')}`;
  const sp = ephemeral();
  const out: Draft[] = [];
  for (const [type, addrs] of [['A', a], ['AAAA', aaaa]] as const) {
    if (type === 'AAAA' && !found) continue;
    const q = [...u16(id), 0x01, 0x00, 0, 1, 0, 0, 0, 0, 0, 0, ...dnsName(name), 0, type === 'A' ? 1 : 28, 0, 1];
    out.push(
      udpPacket(c, {
        src: NET.ip, dst: NET.dns, sp, dp: 53, proto: 'DNS', payload: q,
        info: `Standard query ${idHex} ${type} ${name}`,
        app: { title: 'Domain Name System (query)', fields: [`Transaction ID: ${idHex}`, 'Flags: 0x0100 Standard query', 'Questions: 1', `Queries: ${name}: type ${type}, class IN`] },
      }),
    );
    const answers = found ? addrs.map((x) => `${name}: type ${type}, class IN, ${type === 'A' ? 'addr' : 'aaaa'} ${x}`) : [];
    const r = [...u16(id), found ? 0x81 : 0x81, found ? 0x80 : 0x83, 0, 1, 0, addrs.length, 0, 0, 0, 0, ...dnsName(name), 0, type === 'A' ? 1 : 28, 0, 1, ...filler(addrs.length * 16)];
    out.push(
      udpPacket(c, {
        src: NET.dns, dst: NET.ip, sp: 53, dp: sp, proto: 'DNS', payload: r, ttl: 128,
        info: found ? `Standard query response ${idHex} ${type} ${name} ${addrs.map((x) => `${type} ${x}`).join(' ')}` : `Standard query response ${idHex} No such name ${type} ${name}`,
        app: {
          title: 'Domain Name System (response)',
          fields: [`Transaction ID: ${idHex}`, found ? 'Flags: 0x8180 Standard query response, No error' : 'Flags: 0x8183 Standard query response, No such name', 'Questions: 1', `Answer RRs: ${addrs.length}`, `Queries: ${name}: type ${type}, class IN`, ...(answers.length ? [`Answers: ${answers.join('; ')}`] : [])],
        },
      }),
    );
  }
  return out;
}

/** ICMP echo requests and replies. */
export function pingExchange(c: Ctx, ip: string, count: number, internal: boolean): Draft[] {
  const id = randInt(1, 65535);
  const out: Draft[] = [];
  for (let i = 1; i <= count; i++) {
    for (const dir of ['request', 'reply'] as const) {
      const src = dir === 'request' ? NET.ip : ip;
      const dst = dir === 'request' ? ip : NET.ip;
      const ttl = dir === 'request' ? 128 : internal ? 128 : 117;
      const payload = [dir === 'request' ? 8 : 0, 0, 0, 0, ...u16(id), ...u16(i), ...[...'abcdefghijklmnopqrstuvwabcdefghi'].map((x) => x.charCodeAt(0))];
      const srcMac = macFor(src, c.skin);
      const dstMac = macFor(dst, c.skin);
      const ipb = ipv4(src, dst, 1, payload, ttl);
      const bytes = frame(dstMac, srcMac, 0x0800, ipb);
      out.push({
        src, dst, proto: 'ICMP', length: bytes.length, bytes, meta: {},
        info: `Echo (ping) ${dir}  id=0x${id.toString(16).padStart(4, '0')}, seq=${i}/${i * 256}, ttl=${ttl}`,
        layers: [frameLayer(bytes.length, c.iface), ethLayer(srcMac, dstMac, 'IPv4 (0x0800)'), ipLayer(src, dst, 'ICMP (1)', ttl, ipb.length), { title: 'Internet Control Message Protocol', fields: [`Type: ${dir === 'request' ? 8 : 0} (Echo (ping) ${dir})`, 'Code: 0', `Identifier: ${id}`, `Sequence Number: ${i}`, 'Data (32 bytes)'] }],
      });
    }
  }
  return out;
}

/** traceroute: probes with rising TTL, each hop answering "time to live exceeded". */
export function traceExchange(c: Ctx, ip: string, hops: string[]): Draft[] {
  const out: Draft[] = [];
  hops.forEach((hop, i) => {
    const ttl = i + 1;
    const probe = pingExchange(c, ip, 1, false)[0];
    probe.info = `Echo (ping) request  ttl=${ttl}`;
    out.push(probe);
    const last = i === hops.length - 1;
    const srcMac = macFor(hop, c.skin);
    const dstMac = myMac(c.skin);
    const payload = [last ? 0 : 11, 0, 0, 0, ...filler(36)];
    const ipb = ipv4(hop, NET.ip, 1, payload, 255 - i);
    const bytes = frame(dstMac, srcMac, 0x0800, ipb);
    out.push({
      src: hop, dst: NET.ip, proto: 'ICMP', length: bytes.length, bytes, meta: {},
      info: last ? 'Echo (ping) reply' : 'Time-to-live exceeded (Time to live exceeded in transit)',
      layers: [frameLayer(bytes.length, c.iface), ethLayer(srcMac, dstMac, 'IPv4 (0x0800)'), ipLayer(hop, NET.ip, 'ICMP (1)', 255 - i, ipb.length), { title: 'Internet Control Message Protocol', fields: last ? ['Type: 0 (Echo (ping) reply)'] : ['Type: 11 (Time-to-live exceeded)', 'Code: 0 (Time to live exceeded in transit)'] }],
    });
  });
  return out;
}

/** An HTTPS connection: handshake, TLS hellos, some encrypted data. */
export function httpsSession(c: Ctx, ip: string, sni: string): Draft[] {
  const sp = ephemeral();
  const t = (flags: string, fromMe: boolean, seq: number, ack: number, len = 0, proto?: Proto, info?: string, app?: Layer) =>
    tcpPacket(c, { src: fromMe ? NET.ip : ip, dst: fromMe ? ip : NET.ip, sp: fromMe ? sp : 443, dp: fromMe ? 443 : sp, flags, seq, ack, len, proto, info, app });
  return [
    t('SYN', true, 0, 0),
    t('SYN, ACK', false, 0, 1),
    t('ACK', true, 1, 1),
    t('PSH, ACK', true, 1, 1, 517, 'TLSv1.3', `Client Hello (SNI=${sni})`, { title: 'Transport Layer Security', fields: ['TLSv1.3 Record Layer: Handshake Protocol: Client Hello', `Server Name Indication extension: ${sni}`, 'Supported Versions: TLS 1.3, TLS 1.2', 'ALPN: h2, http/1.1'] }),
    t('PSH, ACK', false, 1, 518, 1400, 'TLSv1.3', 'Server Hello, Change Cipher Spec, Application Data', { title: 'Transport Layer Security', fields: ['TLSv1.3 Record Layer: Handshake Protocol: Server Hello', 'Cipher Suite: TLS_AES_128_GCM_SHA256 (0x1301)', 'Everything after this is encrypted.'] }),
    t('PSH, ACK', true, 518, 1401, 64, 'TLSv1.3', 'Change Cipher Spec, Application Data', { title: 'Transport Layer Security', fields: ['TLSv1.3 Record Layer: Application Data Protocol: Application Data', 'Encrypted Application Data'] }),
    t('PSH, ACK', false, 1401, 582, 1200, 'TLSv1.3', 'Application Data', { title: 'Transport Layer Security', fields: ['TLSv1.3 Record Layer: Application Data Protocol: Application Data', 'Encrypted Application Data'] }),
    t('ACK', true, 582, 2601),
  ];
}

/** A few encrypted QUIC (HTTP/3) packets. */
export function quicBurst(c: Ctx, ip: string): Draft[] {
  const sp = ephemeral();
  return [0, 1, 2].map((i) =>
    udpPacket(c, {
      src: i === 1 ? ip : NET.ip, dst: i === 1 ? NET.ip : ip, sp: i === 1 ? 443 : sp, dp: i === 1 ? sp : 443, proto: 'QUIC',
      payload: [0x40, ...filler(i === 1 ? 1200 : 80)], info: 'Protected Payload (KP0), DCID=' + filler(4).map((b) => b.toString(16).padStart(2, '0')).join(''),
      app: { title: 'QUIC IETF', fields: ['Header Form: Short Header (0)', 'Protected Payload (encrypted)'] },
    }),
  );
}

export function arpPair(c: Ctx, target = NET.gateway): Draft[] {
  const me = myMac(c.skin);
  const theirs = macFor(target, c.skin);
  const req = frame(BCAST, me, 0x0806, [0, 1, 8, 0, 6, 4, 0, 1, ...macBytes(me), ...ipBytes(NET.ip), 0, 0, 0, 0, 0, 0, ...ipBytes(target), ...filler(18)]);
  const rep = frame(me, theirs, 0x0806, [0, 1, 8, 0, 6, 4, 0, 2, ...macBytes(theirs), ...ipBytes(target), ...macBytes(me), ...ipBytes(NET.ip), ...filler(18)]);
  const arp = (op: string, sm: string, sip: string, tm: string, tip: string): Layer => ({ title: `Address Resolution Protocol (${op})`, fields: ['Hardware type: Ethernet (1)', 'Protocol type: IPv4 (0x0800)', `Opcode: ${op} (${op === 'request' ? 1 : 2})`, `Sender MAC address: ${sm}`, `Sender IP address: ${sip}`, `Target MAC address: ${tm}`, `Target IP address: ${tip}`] });
  return [
    { src: vendor(me), dst: 'Broadcast', proto: 'ARP', length: req.length, bytes: req, meta: {}, info: `Who has ${target}? Tell ${NET.ip}`, layers: [frameLayer(req.length, c.iface), ethLayer(me, BCAST, 'ARP (0x0806)'), arp('request', me, NET.ip, '00:00:00:00:00:00', target)] },
    { src: vendor(theirs), dst: vendor(me), proto: 'ARP', length: rep.length, bytes: rep, meta: {}, info: `${target} is at ${theirs}`, layers: [frameLayer(rep.length, c.iface), ethLayer(theirs, me, 'ARP (0x0806)'), arp('reply', theirs, target, me, NET.ip)] },
  ];
}

/** DHCP renew: Request and ACK (the full Discover/Offer/Request/ACK is in the sample). */
export function dhcpExchange(c: Ctx, full: boolean): Draft[] {
  const xid = `0x${randInt(0, 0xffffffff).toString(16).padStart(8, '0')}`;
  const steps: [string, boolean][] = full ? [['Discover', true], ['Offer', false], ['Request', true], ['ACK', false]] : [['Request', true], ['ACK', false]];
  return steps.map(([kind, fromMe]) =>
    udpPacket(c, {
      // A new lease is broadcast from 0.0.0.0; a renewal goes straight to the server.
      src: fromMe ? (full ? '0.0.0.0' : NET.ip) : NET.gateway,
      dst: fromMe ? (full ? '255.255.255.255' : NET.gateway) : NET.ip,
      dstMac: fromMe && full ? BCAST : fromMe ? ROUTER_MAC : myMac(c.skin),
      sp: fromMe ? 68 : 67, dp: fromMe ? 67 : 68, proto: 'DHCP',
      payload: [fromMe ? 1 : 2, 1, 6, 0, ...filler(236)],
      info: `DHCP ${kind}  - Transaction ID ${xid}`,
      app: { title: 'Dynamic Host Configuration Protocol (' + kind + ')', fields: [`Message type: Boot ${fromMe ? 'Request' : 'Reply'} (${fromMe ? 1 : 2})`, `Transaction ID: ${xid}`, ...(fromMe ? [] : [`Your (client) IP address: ${NET.ip}`, `Option: (3) Router: ${NET.gateway}`, `Option: (6) Domain Name Server: ${NET.dns}`, 'Option: (51) IP Address Lease Time: 1 day']), `Option: (53) DHCP Message Type (${kind})`] },
    }),
  );
}

/** Background chatter from other devices: printers announcing, smart TVs looking for each other. */
export function lanChatter(c: Ctx): Draft[] {
  if (rnd() < 0.5)
    return [udpPacket(c, { src: '10.0.0.60', dst: '224.0.0.251', dstMac: '01:00:5e:00:00:fb', sp: 5353, dp: 5353, proto: 'mDNS', payload: [0, 0, 0x84, 0, ...filler(60)], info: 'Standard query response 0x0000 PTR HP-LaserJet._ipp._tcp.local', app: { title: 'Multicast Domain Name System (response)', fields: ['Answers: _ipp._tcp.local: type PTR, HP-LaserJet._ipp._tcp.local'] } })];
  return [udpPacket(c, { src: '10.0.0.37', dst: '239.255.255.250', dstMac: '01:00:5e:7f:ff:fa', sp: ephemeral(), dp: 1900, proto: 'SSDP', payload: [...'M-SEARCH * HTTP/1.1\r\n'].map((x) => x.charCodeAt(0)), info: 'M-SEARCH * HTTP/1.1 ', app: { title: 'Simple Service Discovery Protocol', fields: ['M-SEARCH * HTTP/1.1', 'HOST: 239.255.255.250:1900', 'ST: ssdp:all'] } })];
}

const SITES: [string, string][] = [
  ['140.82.112.3', 'github.com'],
  ['13.107.42.14', 'www.linkedin.com'],
  ['142.250.80.46', 'www.google.com'],
  ['185.199.108.153', 'markplowwright.github.io'],
  ['20.190.151.68', 'login.microsoftonline.com'],
];

/** Everyday traffic, so a fresh capture looks alive. */
export function background(c: Ctx): Draft[] {
  const r = rnd();
  const [ip, host] = SITES[randInt(0, SITES.length - 1)];
  if (r < 0.35) return httpsSession(c, ip, host).slice(rnd() < 0.5 ? 0 : 5);
  if (r < 0.55) return quicBurst(c, '142.250.80.46');
  if (r < 0.7) return dnsExchange(c, host, [ip], [], true).slice(0, 2);
  if (r < 0.82) return lanChatter(c);
  if (r < 0.92) return arpPair(c);
  return [tcpPacket(c, { src: ip, dst: NET.ip, sp: 443, dp: ephemeral(), flags: 'ACK', seq: randInt(1, 9000), ack: randInt(1, 9000), info: undefined })];
}

/** The saved SSH brute-force capture, like Mark's Network Traffic Analysis project. */
export function sshBruteForce(c: Ctx): Draft[] {
  const attacker = '203.0.113.45'; // a documentation address, never a real host
  const server = NET.dns;
  const out: Draft[] = [];
  for (let i = 0; i < 18; i++) {
    const sp = 40000 + i * 7;
    const t = (flags: string, fromAttacker: boolean, len = 0, proto?: Proto, info?: string, app?: Layer) =>
      tcpPacket(c, { src: fromAttacker ? attacker : server, dst: fromAttacker ? server : attacker, sp: fromAttacker ? sp : 22, dp: fromAttacker ? 22 : sp, flags, seq: fromAttacker ? 1 : 1, ack: 1, len, proto, info, app });
    out.push(t('SYN', true), t('SYN, ACK', false), t('ACK', true));
    out.push(t('PSH, ACK', true, 21, 'SSHv2', 'Client: Protocol (SSH-2.0-libssh_0.9.6)', { title: 'SSH Protocol', fields: ['Protocol: SSH-2.0-libssh_0.9.6', 'A scripted client, not a person.'] }));
    out.push(t('PSH, ACK', true, 96, 'SSHv2', 'Client: Encrypted packet (len=96)', { title: 'SSH Protocol', fields: ['Encrypted packet (a password attempt)'] }));
    out.push(t('PSH, ACK', false, 64, 'SSHv2', 'Server: Encrypted packet (len=64)', { title: 'SSH Protocol', fields: ['Encrypted packet (authentication failed)'] }));
    out.push(t('RST, ACK', true));
  }
  return out;
}

export const sshSampleNote =
  'Saved capture: one outside address opens a new SSH connection to PLOWVM every second, sends one password, gets rejected, and resets. That pattern is a brute-force attack. Try the filter: ip.addr == 203.0.113.45 && tcp.flags.syn == 1';
