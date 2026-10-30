import { describe, expect, it } from 'vitest';
import { compileFilter, colorOf } from './filter';
import { arpPair, dnsExchange, httpsSession, pingExchange, sshBruteForce, type Packet } from './packets';

const ctx = { skin: 'windows' as const, iface: 'Wi-Fi' };
const number = (d: Omit<Packet, 'no' | 'time'>[]) => d.map((x, i) => ({ ...x, no: i + 1, time: i / 10 }));
const all = number([...arpPair(ctx), ...dnsExchange(ctx, 'google.com', ['142.250.80.46'], [], true), ...pingExchange(ctx, '8.8.8.8', 2, false), ...httpsSession(ctx, '140.82.112.3', 'github.com'), ...sshBruteForce(ctx).slice(0, 7)]);
const count = (f: string) => all.filter(compileFilter(f)!).length;

describe('packet capture', () => {
  it('builds DNS packets with the name encoded in the bytes', () => {
    const [q, r] = dnsExchange(ctx, 'google.com', ['142.250.80.46'], [], true);
    expect(q.info).toMatch(/^Standard query 0x[0-9a-f]{4} A google\.com$/);
    expect(r.info).toContain('A 142.250.80.46');
    expect(String.fromCharCode(...q.bytes)).toContain('\u0006google\u0003com\u0000');
    // 14 Ethernet + 20 IP + 8 UDP + 28 DNS = 70 bytes, the real size of this query.
    expect(q.length).toBe(70);
    expect(q.layers.map((l) => l.title.split(',')[0])).toEqual(['Frame: 70 bytes on wire (560 bits)', 'Ethernet II', 'Internet Protocol Version 4', 'User Datagram Protocol', 'Domain Name System (query)']);
  });

  it('filters like Wireshark', () => {
    // Like Windows, a lookup asks for both A and AAAA: 2 queries, 2 responses.
    expect(count('dns')).toBe(4);
    expect(count('icmp')).toBe(4);
    expect(count('arp')).toBe(2);
    expect(count('tcp.port == 443')).toBe(8);
    expect(count('ip.addr == 8.8.8.8')).toBe(4);
    expect(count('ip.addr == 8.8.8.8 && ip.src == 8.8.8.8')).toBe(2);
    expect(count('dns || icmp')).toBe(8);
    expect(count('!tcp')).toBe(all.filter((p) => p.meta.transport !== 'tcp').length);
    expect(count('tcp.flags.syn == 1 && ip.addr == 203.0.113.45')).toBe(2);
    expect(count('')).toBe(all.length);
  });

  it('rejects filters that are not valid', () => {
    for (const bad of ['dns &&', 'ip.addr ==', 'foo', 'tcp.port == 443 ))', 'dns $ icmp']) expect(compileFilter(bad), bad).toBeNull();
  });

  it('colors rows like Wireshark', () => {
    const syn = all.find((p) => p.meta.tcpFlags === 'SYN')!;
    const rst = all.find((p) => p.meta.tcpFlags?.includes('RST'))!;
    expect(colorOf(syn)).toBe('synfin');
    expect(colorOf(rst)).toBe('rst');
    expect(colorOf(all.find((p) => p.proto === 'ICMP')!)).toBe('icmp');
    expect(colorOf(all.find((p) => p.proto === 'DNS')!)).toBe('udp');
  });
});
