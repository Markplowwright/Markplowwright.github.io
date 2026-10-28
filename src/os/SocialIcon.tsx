// Icons for Mark's profiles and email, used on the phone home screen, the
// Contact app and the desktops. Simple drawings of the LinkedIn and GitHub
// marks, used only to link to Mark's own profiles.
import { profile } from '../content/profile';

export type SocialId = 'linkedin' | 'github' | 'email';

export const SOCIALS: { id: SocialId; label: string; href: string; external: boolean }[] = [
  { id: 'linkedin', label: 'LinkedIn', href: profile.links.linkedin, external: true },
  { id: 'github', label: 'GitHub', href: profile.links.github, external: true },
  { id: 'email', label: 'Email', href: `mailto:${profile.email}?subject=${encodeURIComponent('Hello Mark')}`, external: false },
];

const GITHUB_MARK =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z';

/** Opens a profile in a new tab, or the visitor's email app. */
export function openSocial(id: SocialId) {
  const x = SOCIALS.find((s) => s.id === id)!;
  if (x.external) window.open(x.href, '_blank', 'noopener');
  else window.location.href = x.href;
}

/** className defaults to the phone's tile style; the desktop passes its own. */
export function SocialTile({ id, size = 60, className = 'm-tile' }: { id: SocialId; size?: number; className?: string }) {
  const g = Math.round(size * 0.58);
  if (id === 'linkedin')
    return (
      <span className={className} style={{ borderRadius: Math.round(size * 0.24), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', background: '#0a66c2', width: size, height: size }}>
        <svg width={g} height={g} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="9" width="4" height="12" fill="#fff" />
          <circle cx="5" cy="4.8" r="2.3" fill="#fff" />
          <path d="M10 9h3.8v1.7c.6-1 1.9-2 3.9-2 4 0 4.3 2.6 4.3 6V21h-4v-5.5c0-1.5 0-3.3-2-3.3s-2.1 1.5-2.1 3.2V21H10z" fill="#fff" />
        </svg>
      </span>
    );
  if (id === 'github')
    return (
      <span className={className} style={{ borderRadius: Math.round(size * 0.24), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', background: 'linear-gradient(160deg,#3a4048,#161b22)', width: size, height: size }}>
        <svg width={g} height={g} viewBox="0 0 16 16" aria-hidden="true">
          <path d={GITHUB_MARK} fill="#fff" />
        </svg>
      </span>
    );
  return (
    <span className={className} style={{ borderRadius: Math.round(size * 0.24), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', background: 'linear-gradient(160deg,#5ac8fa,#1a7cf5)', width: size, height: size }}>
      <svg width={g} height={g} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="5" width="19" height="14" rx="2.2" fill="#fff" />
        <path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="#1a7cf5" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
