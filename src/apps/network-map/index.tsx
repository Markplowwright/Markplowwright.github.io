// Network Map: a diagram of Mark's Azure lab. Click a machine for its role,
// then run Ping, Traceroute or nslookup against it (sample output).
import { useState } from 'react';
import { lab } from '../../content/lab';

type Tool = 'Ping' | 'Traceroute' | 'nslookup';

function sampleOutput(tool: Tool, name: string, ip: string): string[] {
  if (tool === 'Ping') return [`Pinging ${name} [${ip}]`, `Reply from ${ip}: time=21ms`, `Reply from ${ip}: time=20ms`, `Reply from ${ip}: time=22ms`, '0% packet loss (sample output)'];
  if (tool === 'Traceroute') return [`Tracing route to ${name} [${ip}]`, '  1    <1 ms  192.168.1.1', '  2     8 ms  gateway.isp.example', '  3    19 ms  azure-edge.example', `  4    21 ms  ${ip}  (sample output)`];
  return [`Server:  ${lab.nodes[1].name.toLowerCase()}.${lab.domain}`, `Name:    ${name.toLowerCase()}.${lab.domain}`, `Address: ${ip}`, '(sample output)'];
}

// Where each machine sits in the 560 x 250 diagram.
const POS: Record<string, { left: number; top: number; width: number }> = {
  admin: { left: 10, top: 103, width: 120 },
  dc: { left: 230, top: 44, width: 200 },
  client: { left: 230, top: 164, width: 200 },
};

export default function NetworkMapApp() {
  const [selId, setSelId] = useState('dc');
  const [out, setOut] = useState<string[]>([]);
  const sel = lab.nodes.find((n) => n.id === selId)!;
  return (
    <div className="netmap">
      <h2 className="net-title">{lab.title}</h2>
      <div className="net-diagram">
        <svg width="560" height="250" viewBox="0 0 560 250" aria-hidden="true">
          <rect x="190" y="6" width="364" height="238" rx="12" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="6 5" />
          <line x1="130" y1="125" x2="230" y2="66" stroke="var(--muted)" strokeWidth="2" />
          <line x1="130" y1="125" x2="230" y2="186" stroke="var(--muted)" strokeWidth="2" />
          <line x1="330" y1="88" x2="330" y2="164" stroke="var(--muted)" strokeWidth="2" />
          <text x="12" y="172" fontSize="10" fill="var(--muted)">{lab.rdpNote}</text>
        </svg>
        <div className="net-vnet">{lab.vnetLabel}</div>
        {lab.nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            className={`net-node${selId === n.id ? ' is-on' : ''}`}
            style={POS[n.id]}
            aria-pressed={selId === n.id}
            onClick={() => {
              setSelId(n.id);
              setOut([]);
            }}
          >
            <strong>{n.name}</strong>
            <span>{n.role}</span>
          </button>
        ))}
      </div>
      <div className="card net-card">
        <strong>{sel.name} ({sel.ip})</strong>
        <p className="muted">{sel.text}</p>
        <div className="net-tools">
          {(['Ping', 'Traceroute', 'nslookup'] as Tool[]).map((t) => (
            <button key={t} type="button" className="btn" onClick={() => setOut(sampleOutput(t, sel.name, sel.ip))}>
              {t}
            </button>
          ))}
        </div>
        <pre className="net-out" aria-live="polite">{(out.length ? out : [lab.idleText]).join('\n')}</pre>
      </div>
    </div>
  );
}
