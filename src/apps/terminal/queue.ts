// Commands sent to the Terminal from other apps ("Try it" in Help Desk).
// The Terminal runs the waiting command when it opens or is already open.
import { create } from 'zustand';
import type { SkinId } from '../../os/types';

export type QueuedCommand = { cmd: string; os?: SkinId };

export const useTermQueue = create<{ pending: QueuedCommand | null; send: (c: QueuedCommand) => void; take: () => QueuedCommand | null }>((set, get) => ({
  pending: null,
  send: (c) => set({ pending: c }),
  take: () => {
    const p = get().pending;
    if (p) set({ pending: null });
    return p;
  },
}));

/** Windows commands from a ticket, written the way another OS runs them. */
const SAME_JOB: Record<string, Partial<Record<SkinId, string>>> = {
  'ipconfig /all': { mac: 'ifconfig', linux: 'ip a' },
  ipconfig: { mac: 'ifconfig', linux: 'ip a' },
  'ipconfig /flushdns': { mac: 'sudo dscacheutil -flushcache', linux: 'sudo resolvectl flush-caches' },
};

export function forOs(cmd: string, from: SkinId | undefined, to: SkinId): string {
  if (!from || from === to) return cmd;
  return SAME_JOB[cmd]?.[to] ?? cmd;
}
