// Fake but believable CPU and memory numbers that update every 2 seconds.
// Used by the Task Manager and by the phone's Activity app.
import { useEffect, useState } from 'react';
import { projects } from '../../content/projects';

const HISTORY = 40;

function seed(): { cpu: number[]; mem: number[] } {
  const cpu: number[] = [];
  for (let i = 0; i < HISTORY; i++) cpu.push(30 + Math.round(18 * Math.sin(i / 4) + 6 * Math.sin(i * 1.7)));
  return { cpu, mem: cpu.map((v) => 52 + Math.round((v - 30) / 5)) };
}

export function useStats() {
  const [s, setS] = useState(seed);
  useEffect(() => {
    const t = setInterval(() => {
      const sec = Date.now() / 1000;
      const cpu = Math.max(4, Math.min(96, Math.round(32 + 20 * Math.sin(sec / 6) + 10 * Math.sin(sec * 1.3) + Math.random() * 8)));
      const mem = Math.max(30, Math.min(90, Math.round(55 + 6 * Math.sin(sec / 20) + Math.random() * 2)));
      setS((p) => ({ cpu: [...p.cpu.slice(1), cpu], mem: [...p.mem.slice(1), mem] }));
    }, 2000);
    return () => clearInterval(t);
  }, []);
  const sec = Date.now() / 1000;
  // Processes are named after Mark's projects.
  const names = [...projects.filter((p) => !p.earlier).map((p) => p.name), 'Browser', 'Terminal', 'System'];
  const procs = names.map((name, i) => {
    const cpu = Math.max(0, Math.round((3 + ((i * 7) % 10)) * (0.5 + 0.5 * Math.abs(Math.sin(sec / (4 + i))))));
    return { name, cpu, mem: 80 + i * 47 + Math.round(10 * Math.abs(Math.sin(sec / 9 + i))), status: cpu < 2 ? 'Idle' : 'Running' };
  });
  return { cpuHistory: s.cpu, memHistory: s.mem, cpu: s.cpu[HISTORY - 1], mem: s.mem[HISTORY - 1], procs };
}

/** SVG polyline points for a 240 x 70 graph. */
export const points = (arr: number[]) => arr.map((v, i) => `${Math.round((i * 240) / (arr.length - 1))},${Math.round(70 - v * 0.68)}`).join(' ');
