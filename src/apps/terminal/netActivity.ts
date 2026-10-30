// What the pretend computer just did on the network. The Terminal reports its
// lookups, pings and traceroutes here, and Packet Capture listens, so running
// nslookup google.com shows the DNS packets in the capture.
export type NetActivity =
  | { type: 'dns'; name: string; a: string[]; aaaa: string[]; found: boolean }
  | { type: 'ping'; ip: string; count: number; internal: boolean }
  | { type: 'trace'; ip: string; hops: string[] };

type Listener = (a: NetActivity) => void;
const listeners = new Set<Listener>();

export function reportNet(a: NetActivity) {
  listeners.forEach((l) => l(a));
}

export function onNet(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
