# Licenses and sources

Every library, font, image, icon set and outside reference used by the site. Nothing ships without an entry.
Wallpapers are also checked automatically: `src/content/wallpapers.test.ts` fails `npm test` (and the deploy) if any wallpaper has no `license`.

## Libraries

Each one was tried on its own with React 19 before use. The licenses and release dates were checked on npm on 2026-10-27.

| Item | Version | License | Link | Decision |
|---|---|---|---|---|
| React, React DOM | 19.3.1 | MIT | https://react.dev | Used. UI library (required by the stack). |
| Zustand | 5.0.16 | MIT | https://github.com/pmndrs/zustand | Used. Small stores for the window manager, skin and apps. Actively maintained. |
| Vite | 8.3.5 | MIT | https://vite.dev | Used (dev and build only). |
| @vitejs/plugin-react | 6.1.2 | MIT | https://github.com/vitejs/vite-plugin-react | Used (build only). |
| TypeScript | 5.9.3 | Apache-2.0 | https://www.typescriptlang.org | Used (build only, strict mode). |
| Vitest | 5.0.5 | MIT | https://vitest.dev | Used (tests only: terminal parser, file tree, wallpapers). |
| @types/react, @types/react-dom, @types/node | 19.x / 22.x | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped | Used (types only). |
| react-rnd | n/a | MIT | https://github.com/bokuweb/react-rnd | Not used. Dragging and resizing are hand-written with Pointer Events (`src/os/useWindowDrag.ts`). |
| Fluent UI | n/a | MIT | https://react.fluentui.dev | Not used. The Windows look is plain CSS, which keeps the bundle small. |
| framer-motion, lucide-react (old portfolio) | n/a | MIT | | Not carried over. |

## Fonts

| Item | License | Decision |
|---|---|---|
| System font stacks (`system-ui`, `Segoe UI`, `-apple-system`, `Cantarell`, `Inter`, `Consolas`, `Menlo`) | Installed on the visitor's device | Used by name only. No font files are bundled or downloaded. |

## Images and icons

| Item | Source | License | Decision |
|---|---|---|---|
| App and file icons (`src/os/AppIcon.tsx`) | Original SVG drawn for this site (following Mark's design mock-up) | MIT, same as the code | Used. No Microsoft, Apple or distro logos. |
| Start button, tray and window control glyphs | Original inline SVG | MIT | Used. The start button is four rounded squares, not a trademarked logo. |
| Wallpapers (9: Bloom, Midnight Bloom, Glow, Dusk, Dawn, Night, Sunset, Aubergine, Teal) | Original SVG artwork in `src/os/shared/Wallpaper.tsx` | MIT | Used. No copied or default OS wallpapers. |
| `public/favicon.ico`, `public/favicon-32.png`, `public/apple-touch-icon.png`, `public/icon-*.png`, `public/og-image.png`, `public/brand/` | Mark's own logo (cropped for the icons; the link preview shows the full logo) | Mark's own work | Used. |
| `public/screenshots/admin-lab/` | Mark's own screenshots and screen recording of the Admin Practice Lab | Mark's own work | Used. All names, emails and passwords shown are the lab's fake data. |
| `public/screenshots/home-lab/` (50 images) | Mark's own captures of the lab, plus 14 from his `windows-server-home-lab` repo (`docs/images`) to fill gaps | Mark's own work | Used. Converted to JPG. Two full-desktop captures were cropped to just the lab window to remove a private chat, browser tabs and desktop files; two others were dropped. |
| `public/screenshots/gradaisle.jpg`, `sanare.jpg` | Mark's old portfolio (`Resume` repo, gh-pages branch) | Mark's own work | Used. `sanare.jpg` was converted from PNG to make it smaller. |
| Pexels photos used on the old portfolio | pexels.com | Pexels license | Not carried over. |

## Documents

| Item | Source | Decision |
|---|---|---|
| `public/resume.pdf` | Mark's 2026–2027 resume (supplied by Mark) | Used. |
| `public/presentations/*.pdf` (3 decks) | Mark's old portfolio, gh-pages branch | Used, renamed without spaces. |
| `public/papers/csc-4111-network-traffic-ml.pdf` | Mark's old portfolio | Used. |
| Methodist University CRC Symposium 2024 booklet | methodist.edu | Linked only, not copied. |

## Outside references

| Item | License | Decision |
|---|---|---|
| Mark's design mock-up (claude.ai design canvas) | Mark's own | Used as the visual target. Rebuilt as React components rather than copying its code. |
| daedalOS and other browser desktops | Various | Not used, not read for code. The idea is only an inspiration, as `ARCHITECTURE.md` says. |
