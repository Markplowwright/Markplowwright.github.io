// Packet Capture: a Wireshark-style window showing simulated traffic from the
// portfolio's pretend PC. It captures while open, picks up what the Terminal
// does (nslookup, ping, traceroute), filters like Wireshark, and can open a
// saved SSH brute-force capture. Desktop only.
import { useEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import { useSkin } from '../../os/skins';
import { openApp } from '../../os/actions';
import { onNet } from '../terminal/netActivity';
import { useTermQueue } from '../terminal/queue';
import { arpPair, background, dhcpExchange, dnsExchange, httpsSession, pingExchange, sshBruteForce, sshSampleNote, traceExchange, type Draft, type Packet } from './packets';
import { colorOf, compileFilter, quickFilters } from './filter';
import type { SkinId } from '../../os/types';
import './capture.css';

const MAX = 2000;
const IFACE: Record<SkinId, string> = { windows: 'Wi-Fi', mac: 'en0', linux: 'wlp2s0' };

type CaptureState = {
  packets: Packet[];
  running: boolean;
  sample: boolean;
  start: number;
  set: (p: Partial<Omit<CaptureState, 'set'>>) => void;
};

// Kept outside the window so a capture survives a skin switch.
const useCapture = create<CaptureState>((set) => ({ packets: [], running: false, sample: false, start: 0, set: (p) => set(p) }));

/** Adds packets with small gaps (or the given gaps, in ms) so times look real. */
function feed(drafts: Draft[], gaps?: number[]) {
  let at = 0;
  drafts.forEach((d, i) => {
    at += gaps?.[i] ?? (i === 0 ? 0 : 2 + Math.random() * 30);
    setTimeout(() => {
      const s = useCapture.getState();
      if (!s.running || s.packets.length >= MAX) return;
      const no = s.packets.length + 1;
      const time = (performance.now() - s.start) / 1000;
      s.set({ packets: [...s.packets, { ...d, no, time }] });
      if (no >= MAX) s.set({ running: false });
    }, at);
  });
}

function hexRows(bytes: number[]) {
  const rows: { off: string; hex: string; ascii: string }[] = [];
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    rows.push({
      off: i.toString(16).padStart(4, '0'),
      hex: chunk.map((b) => b.toString(16).padStart(2, '0')).join(' '),
      ascii: chunk.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join(''),
    });
  }
  return rows;
}

export default function CaptureApp() {
  const skin = useSkin();
  const ctx = useMemo(() => ({ skin: skin.id, iface: IFACE[skin.id] }), [skin.id]);
  const { packets, running, sample, set } = useCapture();
  const [filterText, setFilterText] = useState('');
  const [applied, setApplied] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const follow = useRef(true);

  const start = () => {
    set({ packets: [], running: true, sample: false, start: performance.now() });
    setSelected(null);
    // A fresh capture: renew the lease, find the router, open a site.
    feed([...arpPair(ctx), ...dhcpExchange(ctx, false), ...dnsExchange(ctx, 'github.com', ['140.82.112.3'], [], true), ...httpsSession(ctx, '140.82.112.3', 'github.com')]);
  };
  const stop = () => set({ running: false });

  // Start capturing when the window opens, like picking an interface in Wireshark.
  useEffect(() => {
    if (!useCapture.getState().running && !useCapture.getState().packets.length) start();
  }, []);

  // Everyday traffic while capturing.
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => feed(background(ctx)), 900);
    return () => clearInterval(t);
  }, [running, ctx]);

  // What the Terminal does shows up here.
  useEffect(
    () =>
      onNet((a) => {
        if (!useCapture.getState().running) return;
        if (a.type === 'dns') feed(dnsExchange(ctx, a.name, a.a, a.aaaa, a.found));
        else if (a.type === 'ping') feed(pingExchange(ctx, a.ip, a.count, a.internal), [40, 15, 985, 15, 985, 15, 985, 15]);
        else feed(traceExchange(ctx, a.ip, a.hops), a.hops.flatMap(() => [60, 20]));
      }),
    [ctx],
  );

  const openSample = () => {
    set({ running: false, sample: true, start: 0 });
    let t = 0;
    const drafts = [...dhcpExchange(ctx, true), ...sshBruteForce(ctx)];
    set({ packets: drafts.map((d, i) => ({ ...d, no: i + 1, time: (t += i < 4 ? 0.05 : i % 7 === 0 ? 0.92 : 0.012) })) });
    setSelected(null);
    setFilterText('');
    setApplied('');
  };

  const test = useMemo(() => compileFilter(applied), [applied]);
  const draftValid = compileFilter(filterText) !== null;
  const shown = useMemo(() => (test ? packets.filter(test) : packets), [packets, test]);
  const pkt = packets.find((p) => p.no === selected);

  // Keep the newest packet in view unless the visitor scrolled up.
  useEffect(() => {
    const el = listRef.current;
    if (el && follow.current) el.scrollTop = el.scrollHeight;
  }, [shown.length]);

  const apply = (f: string) => {
    setFilterText(f);
    setApplied(f);
  };

  return (
    <div className="pc">
      <div className="pc-tools" role="toolbar" aria-label="Capture">
        <button type="button" className="pc-btn is-start" onClick={start} disabled={running} title="Start capturing packets">
          <span aria-hidden="true">▶</span> Start
        </button>
        <button type="button" className="pc-btn is-stop" onClick={stop} disabled={!running} title="Stop capturing">
          <span aria-hidden="true">■</span> Stop
        </button>
        <button type="button" className="pc-btn" onClick={openSample} title={sshSampleNote}>
          Open sample: SSH brute force
        </button>
        <span className="pc-spacer" />
        <button
          type="button"
          className="pc-btn"
          onClick={() => {
            useTermQueue.getState().send({ cmd: 'nslookup google.com', os: 'windows' });
            openApp('terminal');
          }}
          title="Opens the Terminal and runs nslookup google.com"
        >
          Make traffic in the Terminal
        </button>
      </div>

      <form
        className="pc-filter"
        onSubmit={(e) => {
          e.preventDefault();
          if (draftValid) setApplied(filterText);
        }}
      >
        <label htmlFor="pc-filter-in" className="sr-only">Display filter</label>
        <input
          id="pc-filter-in"
          className={filterText.trim() ? (draftValid ? 'is-ok' : 'is-bad') : ''}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Apply a display filter … (for example: dns, icmp, tcp.port == 443)"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!draftValid}
        />
        <button type="submit" className="pc-btn" disabled={!draftValid}>Apply</button>
        {applied && (
          <button type="button" className="pc-btn" onClick={() => apply('')}>Clear</button>
        )}
      </form>
      <div className="pc-quick" aria-label="Common filters">
        {quickFilters.map((f) => (
          <button key={f} type="button" aria-pressed={applied === f} onClick={() => apply(applied === f ? '' : f)}>
            {f}
          </button>
        ))}
      </div>
      {sample && <p className="pc-note">{sshSampleNote}</p>}

      <div
        className="pc-list"
        ref={listRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          follow.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
        }}
      >
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Time</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Protocol</th>
              <th>Length</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr
                key={p.no}
                className={`c-${colorOf(p)}${selected === p.no ? ' is-sel' : ''}`}
                onClick={() => {
                  setSelected(p.no);
                  follow.current = false;
                }}
                aria-selected={selected === p.no}
              >
                <td>{p.no}</td>
                <td>{p.time.toFixed(6)}</td>
                <td>{p.src}</td>
                <td>{p.dst}</td>
                <td>{p.proto}</td>
                <td>{p.length}</td>
                <td>{p.info}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <p className="pc-empty">{packets.length ? 'No packets match this filter.' : 'Press Start to capture packets.'}</p>}
      </div>

      <div className="pc-lower">
        <div className="pc-details" aria-label="Packet details">
          {pkt ? (
            pkt.layers.map((l, i) => (
              <details key={`${pkt.no}-${i}`} open={i === pkt.layers.length - 1}>
                <summary>{l.title}</summary>
                <ul>
                  {l.fields.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </details>
            ))
          ) : (
            <p className="pc-empty">Click a packet to see what is inside it, layer by layer.</p>
          )}
        </div>
        <div className="pc-bytes" aria-label="Packet bytes">
          {pkt &&
            hexRows(pkt.bytes).map((r) => (
              <div key={r.off}>
                <span className="pc-off">{r.off}</span>
                <span className="pc-hex">{r.hex.padEnd(47)}</span>
                <span className="pc-ascii">{r.ascii}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="pc-status" role="status">
        <span className={`pc-dot${running ? ' is-live' : ''}`} aria-hidden="true" />
        <span>
          {sample ? 'Saved capture: ssh-bruteforce.pcapng' : `${IFACE[skin.id]}: ${running ? 'live capture in progress' : packets.length >= MAX ? `stopped at ${MAX} packets` : 'capture stopped'}`}
        </span>
        <span className="pc-spacer" />
        <span>
          Packets: {packets.length} · Displayed: {shown.length}
          {packets.length ? ` (${((shown.length / packets.length) * 100).toFixed(1)}%)` : ''}
        </span>
        <span className="pc-sim">Simulated capture</span>
      </div>
    </div>
  );
}
