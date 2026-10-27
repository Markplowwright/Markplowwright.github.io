// Task Manager / Activity Monitor / System Monitor: live (fake) graphs and processes.
import { points, useStats } from './useStats';

export default function TaskManagerApp() {
  const s = useStats();
  return (
    <div className="taskmgr">
      <div className="graphs">
        <div className="card">
          <div className="card-row"><strong>CPU</strong><span>{s.cpu}%</span></div>
          <svg className="graph" viewBox="0 0 240 70" preserveAspectRatio="none" role="img" aria-label={`CPU history, now ${s.cpu} percent`}>
            <polyline points={points(s.cpuHistory)} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="card">
          <div className="card-row"><strong>Memory</strong><span>{s.mem}%</span></div>
          <svg className="graph" viewBox="0 0 240 70" preserveAspectRatio="none" role="img" aria-label={`Memory history, now ${s.mem} percent`}>
            <polyline points={points(s.memHistory)} fill="none" stroke="var(--accent-2)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
      <table className="procs">
        <thead>
          <tr><th>Name</th><th>CPU</th><th>Memory</th><th>Status</th></tr>
        </thead>
        <tbody>
          {s.procs.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{p.cpu}%</td>
              <td>{p.mem} MB</td>
              <td className="muted">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small">Sample data for this demo. Processes are named after Mark's projects.</p>
    </div>
  );
}
