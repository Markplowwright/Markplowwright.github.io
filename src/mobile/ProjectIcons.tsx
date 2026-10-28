// App-style icons for each project, shown in the phone's Projects group.
// A project without an entry here gets a tile with its first letter, so new
// projects still show up.
import type { ReactNode } from 'react';

type Look = { short: string; bg: string; glyph: ReactNode };

const W = { fill: 'none', stroke: '#fff', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const LOOKS: Record<string, Look> = {
  'p-homelab': {
    short: 'Home Lab',
    bg: 'linear-gradient(160deg,#4aa3ff,#1f5fd6)',
    glyph: (
      <>
        <rect x="4" y="4" width="16" height="6" rx="1.5" {...W} />
        <rect x="4" y="14" width="16" height="6" rx="1.5" {...W} />
        <circle cx="7.5" cy="7" r="0.9" fill="#fff" />
        <circle cx="7.5" cy="17" r="0.9" fill="#fff" />
        <path d="M11 7h6M11 17h6" {...W} />
      </>
    ),
  },
  'p-admin': {
    short: 'Admin Lab',
    bg: 'linear-gradient(160deg,#2fd0c0,#0f8f8a)',
    glyph: (
      <>
        <path d="M12 3l7 3v5c0 4.6-3 8-7 10-4-2-7-5.4-7-10V6z" {...W} />
        <path d="M8.8 12l2.2 2.2 4.4-4.6" {...W} />
      </>
    ),
  },
  'p-endpoint': {
    short: 'Health Audit',
    bg: 'linear-gradient(160deg,#5ee08a,#1e9e4f)',
    glyph: (
      <>
        <rect x="3.5" y="5" width="17" height="12" rx="2" {...W} />
        <path d="M6.5 11.5h2.5l1.5-3 2.5 6 1.5-3h3" {...W} />
        <path d="M9 20.5h6" {...W} />
      </>
    ),
  },
  'p-disk': {
    short: 'Disk Monitor',
    bg: 'linear-gradient(160deg,#ffb347,#e86a10)',
    glyph: (
      <>
        <path d="M4.5 16a7.5 7.5 0 1 1 15 0" {...W} />
        <path d="M12 16l4-5" {...W} />
        <circle cx="12" cy="16" r="1.2" fill="#fff" />
        <path d="M4.5 19.5h15" {...W} />
      </>
    ),
  },
  'p-traffic': {
    short: 'Traffic Analysis',
    bg: 'linear-gradient(160deg,#3f5bd8,#1b2a7a)',
    glyph: (
      <>
        <path d="M3 13c2.2 0 2.2-6 4.4-6s2.2 10 4.4 10 2.2-6 4.4-6 2.2 2 4.8 2" {...W} />
        <path d="M3 20h18" {...W} />
      </>
    ),
  },
  'p-grad': {
    short: 'GradAisle',
    bg: 'linear-gradient(160deg,#a87bff,#6a3ad6)',
    glyph: (
      <>
        <path d="M2.5 9.5L12 5l9.5 4.5L12 14z" {...W} />
        <path d="M6.5 11.5v4c1.6 1.6 3.4 2.3 5.5 2.3s3.9-.7 5.5-2.3v-4" {...W} />
        <path d="M21.5 9.5v5" {...W} />
      </>
    ),
  },
  'p-sanare': {
    short: 'Sanare',
    bg: 'linear-gradient(160deg,#ff7a8a,#d6334f)',
    glyph: (
      <>
        <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" {...W} />
        <path d="M12 10.5v5M9.5 13h5" {...W} />
      </>
    ),
  },
  'p-pimm': {
    short: 'PIMM',
    bg: 'linear-gradient(160deg,#6b7cff,#3a2f9e)',
    glyph: (
      <>
        <circle cx="12" cy="12" r="2.2" {...W} />
        <circle cx="5" cy="6" r="1.8" {...W} />
        <circle cx="19" cy="6.5" r="1.8" {...W} />
        <circle cx="12" cy="20" r="1.8" {...W} />
        <path d="M6.5 7.2l3.8 3.3M17.4 7.6l-3.7 3M12 14.2v4" {...W} />
      </>
    ),
  },
};

export const projectShort = (id: string, name: string) => LOOKS[id]?.short ?? name;

export function ProjectTile({ id, name, size = 60 }: { id: string; name: string; size?: number }) {
  const look = LOOKS[id];
  const g = Math.round(size * 0.6);
  return (
    <span
      className="m-tile"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.24), background: look?.bg ?? 'linear-gradient(160deg,#8e9aaf,#5a6478)' }}
    >
      {look ? (
        <svg width={g} height={g} viewBox="0 0 24 24" aria-hidden="true">
          {look.glyph}
        </svg>
      ) : (
        <span style={{ color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.42) }}>{name[0]}</span>
      )}
    </span>
  );
}
