# Portfolio: Browser Desktop (IT / Networking / Security / Software)

This repo is `Markplowwright.github.io`, a personal portfolio shaped like a desktop OS in the browser.
The idea is inspired by projects like daedalOS, but this is an original, much smaller build. Do NOT copy
code from other desktop-in-browser projects. The desktop is a working IT environment: every portfolio
project is an app the visitor opens in a window.

The owner (Mark) must be able to explain every part of this code in an interview. Prefer simple, readable
code over clever abstractions. No dependency unless it clearly earns its place.

## Stack
- Vite + React + TypeScript (strict mode)
- State: Zustand (one small store for the window manager)
- Styling: plain CSS modules or one global CSS file with CSS variables. Skins are drawn with our own CSS. A UI library (for example Fluent UI) may be used only inside the Windows skin, and only after the per-library check below.
- Dragging/resizing: hand-written with Pointer Events (preferred, so Mark can explain it). `react-rnd` is an allowed fallback if the hand-written version becomes unreliable.
- Persistence: `localStorage` (try/catch every access), versioned key `mp-portfolio-v1`.
- Hosting: GitHub Pages at the root URL (`base: '/'`), deployed by GitHub Actions on push to `main`.

## Folder layout
```
src/
  main.tsx
  App.tsx                  # renders <Desktop />
  os/
    Desktop.tsx            # wallpaper, icon grid, windows layer, taskbar
    Window.tsx             # behavior only: drag, resize, focus, min/max/close. Renders skin's WindowFrame
    useWindowDrag.ts       # pointer-event drag/resize logic, skin-independent
    windowStore.ts         # Zustand store: the window manager state
    skinStore.ts           # Zustand store: current skin id, persisted to localStorage
    skins/
      types.ts             # Skin interface
      index.ts             # skin registry: { windows, mac, linux }
      windows/             # WindowFrame, Taskbar (bottom bar + start menu), tokens.css
      mac/                 # WindowFrame (traffic lights left), MenuBar (top) + Dock (bottom) + Spotlight, tokens.css
      linux/               # WindowFrame, TopPanel (activities + clock) + left dock + overview search, tokens.css
    appRegistry.ts         # list of all apps (single source of truth)
    types.ts
  apps/
    files/                 # File Explorer / Finder / Files: the portfolio file tree
    viewer/                # PDF, slides and text viewer, plus the email compose form
    terminal/
    browser/               # simple links page (GitHub, repos, live demos)
    taskmgr/               # Task Manager / Activity Monitor / System Monitor
    eventlog/              # Event Viewer / Console / Logs (sample security events)
    network-map/           # Azure lab diagram with ping / traceroute / nslookup (sample output)
    settings/              # Personalization (skin, light/dark, wallpaper), Date & time, Network, About
    <each app has index.tsx plus its own CSS and data>
  content/
    fileTree.ts            # the folder tree shown in the Files app (see Portfolio file tree)
    projects.ts            # all portfolio project data lives here, not in components
    presentations.ts
    skills.ts
    profile.ts
    events.ts              # sample security events
    wallpapers.ts          # wallpaper registry (see Wallpapers)
    tips.ts                # guided notification list (see Guided notifications)
  mobile/
    MobileHome.tsx         # iPhone-style home screen of app icons, tap to open full screen
public/
  resume.pdf
  wallpapers/              # original or properly licensed images only
```

## Core model (window manager)
```ts
type AppDefinition = {
  id: string;
  title: string;
  icon: string;                       // emoji or svg path
  component: React.ComponentType<{ windowId: string }>;
  defaultSize: { w: number; h: number };
  singleInstance?: boolean;
};

type WindowState = {
  id: string;            // unique per window instance
  appId: string;
  title: string;
  x: number; y: number; w: number; h: number;
  z: number;             // focus order
  minimized: boolean;
  maximized: boolean;
};
```
Store actions: `openApp(appId)`, `closeWindow(id)`, `focusWindow(id)`, `minimizeWindow(id)`,
`toggleMaximize(id)`, `moveWindow(id, x, y)`, `resizeWindow(id, w, h)`.
Focusing a window sets its `z` to max z + 1. Opening a `singleInstance` app that is already open
focuses it instead of creating a second window.

To add an app: create `src/apps/<name>/index.tsx`, then add one entry to `appRegistry.ts`. Nothing else
should need to change.

## Skins (switch between Windows, macOS and Linux looks)
The visitor can switch the whole desktop between three looks while everything else stays the same:
same window manager, same apps, same content, same state. Only the "chrome" changes.

**Hard rule: a skin may change how things look and where controls sit, never what the system does.**
Window logic, app registry, content, and the store are shared by all skins.

```ts
type SkinId = 'windows' | 'mac' | 'linux';
// Styles: Windows 11-style (Mica-like title bars, centered taskbar, Fluent-style icons),
// macOS 26-style (Liquid Glass: translucent menu bar, floating dock, rounded windows),
// Linux GNOME/Ubuntu-style (dark top bar, left dock, Activities overview).

type Skin = {
  id: SkinId;
  label: string;                                   // "Windows", "macOS", "Linux"
  WindowFrame: React.ComponentType<WindowFrameProps>;   // titlebar + control buttons + border
  Shell: React.ComponentType;                      // taskbar / menu bar + dock / top panel + launcher
  terminalPrompt: (user: string) => string;        // PS C:\Users\mark> | mark@mac ~ % | mark@linux:~$
  defaultWallpaper: string;
};
```
What differs per skin:
| | Windows | macOS | Linux (GNOME-style) |
|---|---|---|---|
| Window controls | right: minimize, maximize, close | left: three colored dots | right |
| Main bar | bottom taskbar + start menu | top menu bar + bottom dock + launchpad grid | top panel + activities app grid |
| Look | flat, square-ish corners | rounded corners, soft shadows, translucency | flat, medium radius, dark panel |

Implementation:
- `skinStore.ts` holds the current `SkinId`, defaults to `windows`, persists to `localStorage`, and also
  reads a `?skin=linux` URL parameter so I can link directly to a skin.
- Set `data-skin="<id>"` on the root element. Each skin defines its look through CSS variables
  (colors, radius, shadow, font, spacing) in its own `tokens.css`. Shared components use the variables,
  not hard-coded values.
- `Desktop.tsx` renders `skins[currentSkin].Shell`. `Window.tsx` renders `skins[currentSkin].WindowFrame`
  around the app content. Window drag/resize behavior lives in `useWindowDrag.ts` and is identical for all.
- Switching skins must NOT close windows or reset app state. Open windows keep their position and content.
- A skin switcher lives in a Settings app and in the system tray/menu bar/top panel of each skin.
- The Terminal app uses `terminalPrompt` so the prompt matches the skin. Commands are identical in all skins.

Legal/design rule: these are original interpretations of each style, not copies. Do NOT use Apple, Microsoft
or Linux-distro logos, trademarked icons, proprietary fonts, or copied wallpaper images. Use system font
stacks, original SVG icons (one icon set per skin, built as a single `AppIcon` component with a `skin` prop),
and original wallpapers. Do not name anything "Windows 11", "macOS Tahoe", "Ubuntu", etc. in the UI;
use "Windows", "macOS", "Linux" only as the skin labels. Before relying on any outside reference (a clone, a
CSS recipe, a library), check its license and note it in `docs/LICENSES.md`. Do not copy code from
unlicensed projects; use them only to read measurements and ideas.

Scope control: build the skin system and the **Windows** skin first. Add macOS and Linux skins after the
content apps work. Skins are chrome only, so each should be small.

## Shared OS features (identical logic in every skin)
- **Boot and lock screen:** short boot animation (monogram, progress bar), then a lock screen with the name and a sign-in button.
- **Light and dark mode** per skin (CSS variables per skin per mode). Switching mode also moves to that mode's default wallpaper.
- **Wallpapers:** each skin offers 3 wallpapers in Settings (see Wallpapers). The choice is remembered per skin.
- **Remembered state:** skin, mode, wallpapers, widget on/off, Files view, quick settings, and open windows with position/size/min/max/snap are saved to `localStorage` (versioned key, validated on load, falls back to defaults). Never save the lock state.
- **URL parameters:** `?skin=windows|mac|linux` and `?open=<appId>` (deep links for recruiters).
- **Window behavior:** drag, resize from edges and corner, double-click title bar to maximize, drag to left/right edge to snap half, drag to top to maximize, minimize/restore, window switcher (task view / Mission Control / Window overview button; add a keyboard shortcut that works inside the page).
- **Context menus:** right-click desktop (New folder demo, Refresh, Change wallpaper, Show/Hide widgets, Open Terminal, Personalize, Lock screen) and right-click files (Open, Properties).
- **Quick settings and calendar:** from the tray / Control Center / top-bar icons and the clock. Wi-Fi, Bluetooth, Do not disturb, Dark mode, Lock, brightness, volume, month calendar, time zone. Wi-Fi off makes the Browser app show an offline page. Brightness is a simple dim overlay.
- **Notifications:** small toast (welcome message after sign-in). Do not disturb silences it.
- **Search:** Start menu search (Windows), Spotlight (macOS), Activities search (Linux), all using one shared `search()` over apps and the file tree.
- **Clock:** uses the visitor's own time zone (`Intl.DateTimeFormat().resolvedOptions().timeZone`); Settings shows it.
- **Widget:** a desktop card with the clock and a "Currently building" list (data from `content/profile.ts`).
- **Trash / Recycle Bin:** a folder with a few joke files.

## Portfolio file tree (Files app, `content/fileTree.ts`)
```
About Mark/
  Bio.txt   Resume.pdf   Skills.txt   Contact.txt (opens the email compose form)
  Work & Projects/
    endpoint-health-audit/  Overview.txt  What I built.txt  Links.txt
    Admin Practice Lab/     ...same three files
    Azure AD Home Lab/      ...same three files
    GradAisle/              ...same three files
  Presentations/
    <one .pptx entry per presentation: title, audience, date, summary, link or exported PDF>
Trash/
```
The Files app shows list or icon view, A-Z sort, folder search, a preview pane, and opens PDFs, slides and text in the Viewer app. App names follow the skin: File Explorer / Finder / Files, Task Manager / Activity Monitor / System Monitor, Event Viewer / Console / Logs, Settings / System Settings, Recycle Bin / Trash.

## Wallpapers
Each skin offers 3 wallpapers in Settings (`content/wallpapers.ts`), remembered per skin, with a light and a dark default. All are original artwork drawn as SVG (no photos), so there are no licensing problems:
- Windows: Bloom, Midnight Bloom (dark default), Glow.
- macOS: Dusk, Dawn, Night (dark default).
- Linux: Sunset, Aubergine (dark default), Teal.
Do NOT use Microsoft or Apple default wallpapers, or any screenshot. If Mark later wants photos, use only his own or images whose license allows it (for example Unsplash or Pexels), and record the source and license in `docs/LICENSES.md`.

## Guided notifications ("tips")
The OS is named "Mark Leslie Plowright OS" (boot screen, lock screen, welcome toast). After sign-in a welcome toast appears ("Welcome to Mark Leslie Plowright OS"), then a series of suggestion toasts written in the third person, as if guiding a visitor who wants to learn about Mark ("Start with Mark's projects", "Check out Mark's Azure AD Home Lab", "Here is where Mark's presentations live", "Try Mark's Terminal", "Meet GradAisle", "See how Mark reads a security alert", "Want to get in touch with Mark?"). Each has an action button that opens that content. Rules: one at a time, first tip after about 15 seconds, then roughly every 30 to 40 seconds, never while Do Not Disturb is on, each toast has Dismiss and "Stop tips" (remembered), and all notifications collect in the notification list in quick settings (Clear button). The tip list lives in `content/tips.ts` (title, body, button label, target app or file id). On mobile the same tips appear as banners at the top of the home screen.

## Mobile (below 768px wide)
Render `MobileHome` instead of the desktop: an iPhone-style home screen (status bar with live time, a grid of app icons, a dock, a home indicator). Tapping an icon opens that app full screen with a "Home" back button. Apps: About Mark, Projects, Presentations, Resume (download button), Contact (email compose), Browser (links), Terminal (command buttons), Network, Activity, Logs, Settings (dark mode). Same content from `content/`, mobile-friendly touch targets (at least 44px).

## Migrating real content from the old portfolio (Cursor does this)
Mark's existing portfolio lives in the `Markplowwright/Resume` repository. Cursor should read it (it will be cloned beside this repo, or its files copied into a `legacy/` folder that is deleted before launch) and move the real text into `src/content/`: bio, resume PDF to `public/resume.pdf`, each project's problem / what I built / tech / outcome / links, screenshots into `public/`, presentation titles and files. Rules: copy facts exactly, never invent employers, dates, numbers or links; where something is missing, leave a visible `[add ...]` placeholder and list every placeholder in `docs/TODO-CONTENT.md`; the email address stays a placeholder until Mark confirms which address to publish.

## Apps (the portfolio content and the personal spin)
1. **Files**: the portfolio file tree above (About Mark, Work & Projects, Presentations, Trash).
2. **Viewer**: opens PDF, slides and text files; the Contact file shows an email compose form that builds a `mailto:` link.
3. **Terminal**: fake shell with a shell toggle per skin (PowerShell / Command Prompt, zsh / bash). Commands: `help`, `whoami`, `hostname`, `projects`, `skills`, `contact`, `ls`/`dir`, `pwd`, `ping <host>`, `ipconfig`/`ifconfig`, `open <app>`, `clear`, plus an easter egg `sudo hire mark`. Parsing lives in a small pure function that is unit-testable. Network outputs are labelled sample output.
4. **Browser**: a links page (GitHub profile, repos, live demos); respects the Wi-Fi toggle.
5. **Task Manager / Activity Monitor / System Monitor**: live fake CPU and memory graphs; processes named after the projects.
6. **Event Viewer / Console / Logs**: six sample security events; click one to read what it means and the right response.
7. **Network Map**: SVG diagram of the Azure lab; click a node for its role; Ping / Traceroute / nslookup buttons show sample output.
8. **Settings**: Personalization (skin, light/dark, wallpaper picker), Date & time, Network, About.
Removed from the plan: the Ticket Queue (Mark will supply different examples later; leave a clear place in the registry to add them).

## Rules for Cursor
- Work in small steps. After each step the app must build (`npm run build`) with no TypeScript errors.
- Strict TypeScript. No `any` unless commented why.
- All portfolio text and project data go in `src/content/`, never hard-coded in components.
- Every interactive element is keyboard-reachable and has an accessible label. Windows use `role="dialog"`
  with `aria-label` set to the title.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Mobile: below 768px wide, render `MobileFallback` instead of the desktop. It shows the same content as a
  simple scrolling page with the same apps as sections. Recruiters often open links on phones.
- Never put skin-specific logic inside apps or the window store. If an app needs to know the skin, it reads
  `skinStore`, and only for cosmetic reasons (like the terminal prompt or app names).
- **Library rule:** before using any library (Fluent UI, react-rnd, anything), install it in a throwaway empty page first and
  confirm it works with the current React version, then check its license and last release date. If it is unmaintained or
  its license is unclear, do not use it. Record the decision in `docs/LICENSES.md`.
- Icons: one `AppIcon` component with `app` and `skin` props. No emoji icons. No logos from Microsoft, Apple or any distro.
- Placeholders: never invent facts. Use `[add ...]` and list them in `docs/TODO-CONTENT.md`.
- Do NOT add emulators, games, chat, or heavy libraries. Keep the bundle small.
- Do NOT add backend code. Everything is static.
- Comment the window manager code well: it's the part I will be asked about.

## Build phases
1. **Shell + skin system**: Desktop, window manager (drag, resize, snap, maximize), stores, registry, the `Skin` interface, the Windows skin only, `AppIcon`, boot and lock screens, remembered state.
2. **Files, Viewer and content**: file tree, preview pane, PDF/slides/text viewer, content migration from the old portfolio, Settings (skin switcher, wallpapers, dark mode).
3. **Terminal** (skin-aware prompts, shell toggle, easter egg).
4. **macOS and Linux skins** (chrome only), then verify switching keeps windows open and state is remembered.
5. **System apps**: Task Manager, Event Viewer, Network Map tools, Browser.
6. **Polish**: context menus, quick settings and calendar, toasts, search, widget, mobile home screen, accessibility pass (keyboard, labels, reduced motion), window switcher shortcut, Lighthouse check, social-preview metadata.
7. **Ship**: README with screenshots, deploy workflow verified, `docs/LICENSES.md` and `docs/TODO-CONTENT.md` cleared, update links on resume and LinkedIn.

## Deploy
GitHub Actions workflow at `.github/workflows/deploy.yml` builds with `npm run build` and publishes `dist/`
to GitHub Pages. Settings, Pages, Source must be set to "GitHub Actions".
