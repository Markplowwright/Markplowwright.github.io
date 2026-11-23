// The OPT Employer Checker logo mark: two chips (one with a check) on a navy
// square. Drawn on a 128 x 128 grid. Used for the app icon (AppIcon) and the
// app's own window, so the icon is the same everywhere.

export function OptMarkShapes() {
  return (
    <>
      <rect width="128" height="128" rx="28" fill="#22314a" />
      <rect x="8" y="24" width="98" height="42" rx="21" fill="#f3ead7" />
      <circle cx="29" cy="45" r="12.5" fill="#22314a" />
      <polyline points="23.2,45.5 27.5,49.8 35,40.5" fill="none" stroke="#f3ead7" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="50" y="39" width="42" height="12" rx="6" fill="#22314a" />
      <rect x="24" y="72" width="96" height="42" rx="21" fill="#c8a45c" />
      <rect x="44" y="84" width="56" height="12" rx="6" fill="#22314a" />
    </>
  );
}

export function OptMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true" style={{ display: 'block', flex: 'none' }}>
      <OptMarkShapes />
    </svg>
  );
}
