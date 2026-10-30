import { describe, expect, it } from 'vitest';
import { calcSubnet, isSubnetError, splitSubnet, subnetLines, type SubnetResult } from './subnet';

const ok = (s: string) => {
  const r = calcSubnet(s);
  if (isSubnetError(r)) throw new Error(r.error);
  return r as SubnetResult;
};

describe('subnet calculator', () => {
  it('works out a /24', () => {
    const r = ok('10.0.0.25/24');
    expect([r.network, r.broadcast, r.firstHost, r.lastHost, r.mask, r.wildcard, r.hosts, r.total]).toEqual(['10.0.0.0', '10.0.0.255', '10.0.0.1', '10.0.0.254', '255.255.255.0', '0.0.0.255', 254, 256]);
    expect(r.kind).toBe('Private (RFC 1918)');
    expect(r.binary.mask).toBe('11111111.11111111.11111111.00000000');
  });

  it('accepts a mask instead of a prefix, and defaults to /24', () => {
    expect(ok('192.168.1.130 255.255.255.192').network).toBe('192.168.1.128');
    expect(ok('192.168.1.130/255.255.255.192').prefix).toBe(26);
    expect(ok('172.16.5.9').prefix).toBe(24);
  });

  it('handles odd sizes correctly', () => {
    const p30 = ok('10.1.1.6/30');
    expect([p30.network, p30.firstHost, p30.lastHost, p30.broadcast, p30.hosts]).toEqual(['10.1.1.4', '10.1.1.5', '10.1.1.6', '10.1.1.7', 2]);
    const p31 = ok('10.1.1.6/31');
    expect([p31.firstHost, p31.lastHost, p31.hosts]).toEqual(['10.1.1.6', '10.1.1.7', 2]);
    const p32 = ok('8.8.8.8/32');
    expect([p32.network, p32.hosts, p32.kind]).toEqual(['8.8.8.8', 1, 'Public']);
    const p8 = ok('10.200.3.4/8');
    expect([p8.network, p8.broadcast, p8.hosts]).toEqual(['10.0.0.0', '10.255.255.255', 16777214]);
    expect(ok('0.0.0.0/0').total).toBe(4294967296);
  });

  it('spots special addresses', () => {
    expect(ok('169.254.83.17/16').kind).toBe('Link-local (APIPA)');
    expect(ok('127.0.0.1/8').kind).toBe('Loopback');
    expect(ok('100.64.0.1/10').kind).toContain('Carrier-grade');
    expect(ok('224.0.0.251/32').ipClass).toBe('D (multicast)');
    expect(ok('203.0.113.45/24').kind).toContain('Documentation');
  });

  it('explains bad input', () => {
    expect(calcSubnet('10.0.0.256/24')).toHaveProperty('error');
    expect(calcSubnet('10.0.0.1/33')).toHaveProperty('error');
    expect((calcSubnet('10.0.0.1 255.0.255.0') as { error: string }).error).toContain('not a valid subnet mask');
    expect(calcSubnet('')).toHaveProperty('error');
  });

  it('splits a network into smaller ones', () => {
    const parts = splitSubnet(ok('192.168.1.0/24'), 26);
    expect(parts.map((p) => p.network)).toEqual(['192.168.1.0/26', '192.168.1.64/26', '192.168.1.128/26', '192.168.1.192/26']);
    expect(parts[1].range).toBe('192.168.1.65 - 192.168.1.126');
    expect(splitSubnet(ok('10.0.0.0/8'), 24)).toHaveLength(16);
  });

  it('prints like ipcalc in the Terminal', () => {
    const out = subnetLines('10.0.0.25/24').join('\n');
    expect(out).toContain('Network:   10.0.0.0/24');
    expect(out).toContain('HostMin:   10.0.0.1');
    expect(out).toContain('Broadcast: 10.0.0.255');
    expect(out).toContain('Hosts/Net: 254');
  });
});
