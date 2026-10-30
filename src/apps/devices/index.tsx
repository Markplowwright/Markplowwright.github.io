// Device Manager (Windows), System Information (macOS) and Hardware (Linux).
// Each shows the pretend computer's hardware, and one Bluetooth device has a
// problem to troubleshoot: the visitor tries the fixes a technician would, in
// order, and sees why each one did or did not work. Desktop only.
import { useState } from 'react';
import { create } from 'zustand';
import { useSkin } from '../../os/skins';
import type { SkinId } from '../../os/types';
import { bluetoothSpecs, linuxSections, macSections, problems, windowsDevices, windowsSummary, type Spec } from '../../content/hardware';
import './devices.css';

type Attempt = { label: string; result: string; fixes: boolean };

// Kept outside the window so a fix survives closing and reopening the app.
const useDeviceState = create<{ fixed: Record<SkinId, boolean>; tried: Record<SkinId, Attempt[]>; set: (skin: SkinId, fixed: boolean, tried: Attempt[]) => void }>((set) => ({
  fixed: { windows: false, mac: false, linux: false },
  tried: { windows: [], mac: [], linux: [] },
  set: (skin, fixed, tried) => set((s) => ({ fixed: { ...s.fixed, [skin]: fixed }, tried: { ...s.tried, [skin]: tried } })),
}));

function Warning() {
  return (
    <svg className="dv-warn" width="14" height="14" viewBox="0 0 16 16" aria-label="Problem">
      <path d="M8 1.5l7 12.5H1z" fill="#f2c744" stroke="#9a7300" strokeWidth="1" strokeLinejoin="round" />
      <path d="M8 6v4" stroke="#1b1b1b" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.9" fill="#1b1b1b" />
    </svg>
  );
}

function Specs({ specs }: { specs: Spec[] }) {
  return (
    <dl className="dv-specs">
      {specs.map((s) => (
        <div key={s.label}>
          <dt>{s.label}</dt>
          <dd>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The problem device: the ticket, its status, the fixes to try, and what each did. */
function ProblemPanel({ skin }: { skin: SkinId }) {
  const p = problems[skin];
  const { fixed, tried, set } = useDeviceState();
  const isFixed = fixed[skin];
  const log = tried[skin];
  const attempt = (a: (typeof p.actions)[number]) => set(skin, isFixed || a.fixes, [...log, { label: a.label, result: a.result, fixes: a.fixes }]);

  return (
    <section className="dv-problem" aria-label="Troubleshoot this device">
      <div className={`dv-status${isFixed ? ' is-ok' : ' is-bad'}`} role="status">
        {!isFixed && <Warning />} <strong>Device status:</strong> {isFixed ? p.fixedStatus : p.status}
      </div>
      <p className="dv-story">
        <strong>Ticket:</strong> {p.story}
      </p>
      {!isFixed && <p className="dv-hint">Try the fixes in the order a technician would. Each one tells you what it showed.</p>}
      <div className="dv-actions">
        {p.actions.map((a) => (
          <button key={a.id} type="button" className="dv-btn" disabled={isFixed} onClick={() => attempt(a)}>
            {a.label}
          </button>
        ))}
      </div>
      {log.length > 0 && (
        <ol className="dv-log" aria-live="polite">
          {log.map((t, i) => (
            <li key={i} className={t.fixes ? 'is-fix' : ''}>
              <strong>{t.label}:</strong> <span>{t.result}</span>
            </li>
          ))}
        </ol>
      )}
      {isFixed && (
        <p className="dv-done">
          Fixed and verified. In a real ticket, the last step is to note the cause and the fix.{' '}
          <button type="button" className="dv-link" onClick={() => set(skin, false, [])}>
            Bring the problem back to try again
          </button>
        </p>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- Windows

function WindowsView() {
  const p = problems.windows;
  const fixed = useDeviceState((s) => s.fixed.windows);
  const [tab, setTab] = useState<'devices' | 'summary'>('devices');
  const [sel, setSel] = useState<string>(p.device);
  const group = windowsDevices.find((g) => g.devices.some((d) => d.name === sel));
  const device = group?.devices.find((d) => d.name === sel);
  const isProblem = sel === p.device;
  // Rolling back changes the driver Device Manager shows.
  const driver = isProblem && fixed ? { provider: 'Intel Corporation', version: '23.40.0.2', date: '2/20/2026' } : device?.driver;

  return (
    <div className="dv dv-win">
      <div className="dv-tabs" role="tablist" aria-label="View">
        <button type="button" role="tab" aria-selected={tab === 'devices'} onClick={() => setTab('devices')}>Device Manager</button>
        <button type="button" role="tab" aria-selected={tab === 'summary'} onClick={() => setTab('summary')}>System Summary</button>
      </div>
      {tab === 'summary' ? (
        <div className="dv-pane">
          <Specs specs={windowsSummary} />
        </div>
      ) : (
        <div className="dv-split">
          <nav className="dv-tree" aria-label="Devices">
            <div className="dv-root">{windowsSummary[2].value}</div>
            {windowsDevices.map((g) => {
              const hasProblem = !fixed && g.category === p.category;
              return (
                <details key={g.category} open={hasProblem || g.devices.some((d) => d.name === sel)}>
                  <summary>
                    {g.category} {hasProblem && <Warning />}
                  </summary>
                  <ul>
                    {g.devices.map((d, i) => (
                      <li key={d.name + i}>
                        <button type="button" className={`dv-dev${sel === d.name ? ' is-sel' : ''}`} onClick={() => setSel(d.name)}>
                          {!fixed && d.name === p.device && <Warning />} {d.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </nav>
          <section className="dv-pane" aria-label="Device properties">
            <h2>{device?.name ?? 'Select a device'}</h2>
            {device && (
              <>
                <Specs
                  specs={[
                    { label: 'Device type', value: group!.category },
                    ...(driver ? [{ label: 'Driver provider', value: driver.provider }, { label: 'Driver date', value: driver.date }, { label: 'Driver version', value: driver.version }] : []),
                  ]}
                />
                {isProblem ? (
                  <ProblemPanel skin="windows" />
                ) : (
                  <div className="dv-status is-ok">
                    <strong>Device status:</strong> This device is working properly.
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- macOS

function MacView() {
  const fixed = useDeviceState((s) => s.fixed.mac);
  const [sel, setSel] = useState('Hardware Overview');
  const item = macSections.flatMap((g) => g.items).find((i) => i.name === sel);
  return (
    <div className="dv dv-split dv-mac">
      <nav className="dv-side" aria-label="Sections">
        {macSections.map((g) => (
          <div key={g.group}>
            <div className="dv-side-head">{g.group}</div>
            {g.items.map((i) => (
              <button key={i.name} type="button" className={`dv-dev${sel === i.name ? ' is-sel' : ''}`} onClick={() => setSel(i.name)}>
                {i.name} {i.name === 'Bluetooth' && !fixed && <Warning />}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <section className="dv-pane" aria-label={sel}>
        <h2>{sel}</h2>
        {sel === 'Bluetooth' ? (
          <>
            <Specs specs={bluetoothSpecs.mac(fixed)} />
            <ProblemPanel skin="mac" />
          </>
        ) : (
          <Specs specs={item?.specs ?? []} />
        )}
        {sel === 'Hardware Overview' && !fixed && <p className="dv-hint">Something is wrong with Bluetooth. Open it in the sidebar to troubleshoot.</p>}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- Linux

function LinuxView() {
  const fixed = useDeviceState((s) => s.fixed.linux);
  const [sel, setSel] = useState('About');
  const sec = linuxSections.find((s) => s.name === sel);
  return (
    <div className="dv dv-split dv-linux">
      <nav className="dv-side" aria-label="Sections">
        {linuxSections.map((s) => (
          <button key={s.name} type="button" className={`dv-dev${sel === s.name ? ' is-sel' : ''}`} onClick={() => setSel(s.name)}>
            {s.name} {s.name === 'Bluetooth' && !fixed && <Warning />}
          </button>
        ))}
      </nav>
      <section className="dv-pane" aria-label={sel}>
        <h2>{sel}</h2>
        {sel === 'Bluetooth' ? (
          <>
            <Specs specs={bluetoothSpecs.linux(fixed)} />
            <ProblemPanel skin="linux" />
          </>
        ) : (
          <Specs specs={sec?.specs ?? []} />
        )}
        {sel === 'About' && !fixed && <p className="dv-hint">Bluetooth is down. Open it in the list to troubleshoot.</p>}
      </section>
    </div>
  );
}

export default function DevicesApp() {
  const skin = useSkin();
  return skin.id === 'windows' ? <WindowsView /> : skin.id === 'mac' ? <MacView /> : <LinuxView />;
}
