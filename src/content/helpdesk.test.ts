import { describe, expect, it } from 'vitest';
import { method, tickets } from './helpdesk';
import { fileTree } from './fileTree';
import { runCommand } from '../apps/terminal/commands';
import { forOs } from '../apps/terminal/queue';

describe('help desk', () => {
  it("has Mark's 7-step method and 8 tickets", () => {
    expect(method).toHaveLength(7);
    expect(tickets).toHaveLength(8);
    expect(new Set(tickets.map((t) => t.number)).size).toBe(8);
  });

  it('every "Try it" works: commands run on their OS, links point to real folders', () => {
    for (const t of tickets)
      for (const x of t.tryIt ?? []) {
        if ('terminal' in x) {
          for (const os of ['windows', 'mac', 'linux'] as const) {
            const out = runCommand(forOs(x.terminal, x.os, os), { skin: os, shell: 0, lookup: async () => null }).lines.join('\n');
            expect(out, `${t.number}: ${x.terminal} on ${os}`).not.toMatch(/not recognized|command not found|Tip:/);
          }
        } else if ('node' in x) expect(fileTree[x.node], `${t.number}: ${x.node}`).toBeDefined();
      }
  });

  it('escalated tickets carry an escalation note', () => {
    for (const t of tickets) if (t.state === 'Escalated') expect(t.escalation?.length).toBeGreaterThan(2);
  });
});
