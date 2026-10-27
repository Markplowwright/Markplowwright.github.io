// Saving and loading state in localStorage.
//
// Everything is stored under one versioned key. Each store saves its own
// "slice" (for example "skin" or "windows"). Every access is wrapped in
// try/catch because storage can be blocked (private windows, strict settings).

export const STORAGE_KEY = 'mp-portfolio-v1';

type Saved = Record<string, unknown>;

let cache: Saved | null = null;

function readAll(): Saved {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    cache = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Saved) : {};
  } catch {
    cache = {};
  }
  return cache;
}

/** Returns the saved value for a slice, or undefined. Callers must validate it. */
export function loadSlice(name: string): unknown {
  return readAll()[name];
}

let timer: ReturnType<typeof setTimeout> | null = null;

/** Saves a slice. Writes are batched so dragging a window does not write on every frame. */
export function saveSlice(name: string, value: unknown): void {
  readAll()[name] = value;
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {
      /* storage unavailable: the site still works, it just forgets */
    }
  }, 300);
}

/** Small helpers for validating saved values. */
export const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export const num = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback;
export const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);

/** Reads a URL query parameter safely. */
export function queryParam(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}
