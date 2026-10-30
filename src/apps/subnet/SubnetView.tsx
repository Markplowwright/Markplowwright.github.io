// Subnet Calculator: type an address with a prefix or mask and see the
// network, broadcast, usable range, host count, masks, the address type, a
// binary view and how the network splits into smaller ones. Desktop and phone.
import { useMemo, useState } from 'react';
import { calcSubnet, isSubnetError, splitSubnet } from '../../content/subnet';
import './subnet.css';

const EXAMPLES: { label: string; value: string }[] = [
  { label: 'This PC', value: '10.0.0.25/24' },
  { label: 'Home router', value: '192.168.1.1/24' },
  { label: 'Small office', value: '172.16.10.40/22' },
  { label: 'Point-to-point link', value: '10.1.1.6/30' },
  { label: 'DHCP failed (APIPA)', value: '169.254.83.17/16' },
];

/** Binary octets with the network bits marked. */
function Bits({ value, prefix }: { value: string; prefix: number }) {
  let i = 0;
  return (
    <code className="sn-bits">
      {[...value].map((ch, k) => {
        if (ch === '.') return <span key={k} className="sn-dot">.</span>;
        const net = i++ < prefix;
        return (
          <span key={k} className={net ? 'is-net' : 'is-host'}>
            {ch}
          </span>
        );
      })}
    </code>
  );
}

export function SubnetView({ onRunInTerminal, phone }: { onRunInTerminal: (cmd: string) => void; phone?: boolean }) {
  const [text, setText] = useState('10.0.0.25/24');
  const r = useMemo(() => calcSubnet(text), [text]);
  const [split, setSplit] = useState<number | null>(null);
  const ok = !isSubnetError(r);
  const splitTo = ok ? (split && split > r.prefix && split <= 32 ? split : Math.min(32, r.prefix + 2)) : 0;
  const parts = ok ? splitSubnet(r, splitTo) : [];
  const partCount = ok ? 2 ** (splitTo - r.prefix) : 0;

  return (
    <div className={`sn${phone ? ' is-phone' : ''}`}>
      <form className="sn-form" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="sn-in">IP address with a prefix or mask</label>
        <div className="sn-row">
          <input
            id="sn-in"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="10.0.0.25/24"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            inputMode="text"
            aria-invalid={!ok}
            aria-describedby="sn-help"
          />
          <button type="button" className="sn-btn" onClick={() => onRunInTerminal(`subnet ${text.trim() || '10.0.0.25/24'}`)}>
            Run in Terminal
          </button>
        </div>
        <p id="sn-help" className={`sn-help${ok ? '' : ' is-bad'}`} aria-live="polite">
          {ok ? 'For example 10.0.0.25/24, or 10.0.0.25 255.255.255.0. Results update as you type.' : r.error}
        </p>
        <div className="sn-examples" role="group" aria-label="Examples">
          {EXAMPLES.map((x) => (
            <button key={x.value} type="button" aria-pressed={text === x.value} onClick={() => setText(x.value)}>
              {x.label} <span>{x.value}</span>
            </button>
          ))}
        </div>
      </form>

      {ok && (
        <>
          <dl className="sn-grid">
            <div><dt>Network</dt><dd>{r.network}/{r.prefix}</dd></div>
            <div><dt>Broadcast</dt><dd>{r.broadcast}</dd></div>
            <div><dt>First usable</dt><dd>{r.firstHost}</dd></div>
            <div><dt>Last usable</dt><dd>{r.lastHost}</dd></div>
            <div><dt>Usable hosts</dt><dd>{r.hosts.toLocaleString('en-US')}</dd></div>
            <div><dt>Total addresses</dt><dd>{r.total.toLocaleString('en-US')}</dd></div>
            <div><dt>Subnet mask</dt><dd>{r.mask}</dd></div>
            <div><dt>Wildcard mask</dt><dd>{r.wildcard}</dd></div>
            <div><dt>Class</dt><dd>{r.ipClass}</dd></div>
            <div><dt>Type</dt><dd>{r.kind}</dd></div>
          </dl>
          {r.note && <p className="sn-note">{r.note}</p>}

          <h3>In binary</h3>
          <p className="sn-legend">
            <span className="is-net">Network bits</span> (the first {r.prefix}) and <span className="is-host">host bits</span> (the last {32 - r.prefix}).
          </p>
          <div className="sn-binary">
            <span>Address</span><Bits value={r.binary.address} prefix={r.prefix} />
            <span>Mask</span><Bits value={r.binary.mask} prefix={r.prefix} />
            <span>Network</span><Bits value={r.binary.network} prefix={r.prefix} />
          </div>
          <p className="sn-formula">
            Usable hosts = 2<sup>{32 - r.prefix}</sup> − 2 = {r.prefix >= 31 ? `${r.hosts} (a /${r.prefix} is a special case)` : r.hosts.toLocaleString('en-US')}
          </p>

          {r.prefix < 32 && (
            <>
              <h3>Split into smaller networks</h3>
              <label className="sn-split">
                Split /{r.prefix} into{' '}
                <select value={splitTo} onChange={(e) => setSplit(Number(e.target.value))}>
                  {Array.from({ length: Math.min(8, 32 - r.prefix) }, (_, i) => r.prefix + i + 1).map((p) => (
                    <option key={p} value={p}>
                      /{p} ({(2 ** (p - r.prefix)).toLocaleString('en-US')} networks)
                    </option>
                  ))}
                </select>
              </label>
              <div className="sn-table-wrap">
                <table className="sn-table">
                  <thead>
                    <tr>
                      <th>Network</th>
                      <th>Usable range</th>
                      <th>Broadcast</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((p) => (
                      <tr key={p.network}>
                        <td>{p.network}</td>
                        <td>{p.range}</td>
                        <td>{p.broadcast}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {partCount > parts.length && <p className="sn-more">…and {(partCount - parts.length).toLocaleString('en-US')} more.</p>}
            </>
          )}
        </>
      )}
    </div>
  );
}
