# Liquea

Liquea is a functional desktop web browser with an original **Liquea Liquid Glass**
interface. It combines a Chromium-powered browsing surface with a TypeScript browser
shell designed around calm motion, rounded squircles, translucent depth, and warm
gold accents.

> **Project status:** early developer release. Liquea can browse real websites and
> includes tabs, navigation, search, bookmarks, history, downloads, settings,
> themes, keyboard shortcuts, internal pages, privacy controls, and tab crash states.
> It is not yet recommended as a security-critical daily browser.

## Why This Stack?

- **Electron 42 / Chromium** provides a maintained, standards-compatible rendering,
  JavaScript, networking, media, accessibility, and sandbox foundation. Rebuilding
  all of that safely from scratch would require a large specialist team and years of
  work.
- **TypeScript** keeps main-process, preload, and UI contracts explicit and is used
  widely for production desktop and web applications.
- **React** provides predictable, component-based browser chrome with efficient
  updates.
- **WebContentsView** gives every tab a real, isolated Chromium web contents surface.
  Liquea does not use a fake iframe browser.
- **electron-store** persists preferences, bookmarks, history, and download metadata.

Chromium is the engine; Liquea's browser shell, visual design, state model, internal
pages, settings, tab management, and persistence are original. Liquea is not a
Chromium fork and does not claim to implement a new rendering engine.

## Features

- Real web browsing with URL detection and search fallback
- Google Search by default, plus DuckDuckGo, Bing, and Brave Search
- Isolated multi-tab browsing with topbar and sidebar layouts
- Back, forward, refresh/stop, home, loading, favicon, and crash states
- Persistent bookmarks, browsing history, and download records
- New tab, settings, history, bookmarks, downloads, and friendly error pages
- Light, dark, and system themes with five accent colors
- Three new-tab atmospheres and compact/comfortable tab density
- Do Not Track, conservative permission handling, popup-to-tab isolation, and clear-data controls
- Native menu shortcuts and familiar keyboard navigation
- macOS, Windows, and Linux packaging targets

## Getting Started

Requirements:

- Node.js 22 or newer (Node.js 26 is used in current development)
- npm 10 or newer
- macOS, Windows 10+, or a modern Linux desktop

```bash
git clone https://github.com/mustafadurrani02/Liquea.git
cd Liquea
npm install
npm run dev
```

If Electron was installed with lifecycle scripts disabled, run:

```bash
node node_modules/electron/install.js
```

## Build

Create an optimized application build:

```bash
npm run build
npm start
```

Create an installer for the current platform:

```bash
npm run package
```

Platform-specific commands are also available:

```bash
npm run package:mac
npm run package:win
npm run package:linux
```

Cross-compiling installers has host limitations. In particular, signed macOS builds
must be produced on macOS, and production Windows/macOS releases need platform
signing credentials.

## Quality Checks

```bash
npm run typecheck
npm test
npm run build
```

## Architecture

```text
src/
  main/       Native window, tabs, navigation, session, downloads, persistence
  preload/    Minimal typed IPC bridge; no Node.js access exposed to the UI
  renderer/   React browser chrome and Liquea internal pages
  shared/     Cross-process types and defaults
assets/       Brand assets
screenshots/  Product screenshots
```

The main process is the authority for privileged operations. The React renderer is
sandboxed and talks through a narrow preload API. Website tabs use sandboxed
`WebContentsView` instances with Node integration disabled. A failed tab renderer
is represented as a recoverable tab state instead of taking down the browser shell.

## Liquea Liquid Glass

The design system uses layered translucent surfaces rather than flat panels:

- background-aware glass with blur and saturation
- thin reflective borders and inset highlights
- large, continuous-radius squircles
- restrained gold light for focus and identity
- atmospheric gradients behind content, never above it
- short scale/fade transitions that preserve spatial continuity
- CSS custom properties for theme and accent changes without component rewrites

The interface is inspired by premium industrial and editorial design, but does not
copy the layout or controls of Safari, Chrome, Edge, Firefox, or Arc.

## Keyboard Shortcuts

| Action | macOS | Windows / Linux |
| --- | --- | --- |
| New tab | `Command+T` | `Ctrl+T` |
| Close tab | `Command+W` | `Ctrl+W` |
| Focus address bar | `Command+L` | `Ctrl+L` |
| Settings | `Command+,` | `Ctrl+,` |
| History | `Command+Y` | `Ctrl+Y` |
| Toggle bookmark | `Command+Shift+B` | `Ctrl+Shift+B` |
| Back / forward | `Option+Left/Right` | `Alt+Left/Right` |

## LiquidOS

LiquidOS support depends on its desktop and application compatibility layer. The
current Linux package can run if LiquidOS provides:

- a supported 64-bit Linux ABI
- X11 or Wayland
- the system libraries required by Electron/Chromium
- standard desktop process, file, and networking APIs

If LiquidOS uses a custom compositor, binary format, or application API, a dedicated
Electron platform port or a native Liquea host will be required. No claim of native
LiquidOS support is made until those system interfaces are defined and tested.

## Current Limitations

- No extension platform, account sync, password manager, private windows, profiles,
  tab groups, reader mode, or ad blocker yet.
- Privacy controls are a useful baseline, not anonymity tooling.
- Permission prompts are intentionally conservative and need a richer per-site UI.
- Session restore and interrupted-download resume are not implemented.
- Installer signing, notarization, auto-update, and release CI are not configured.
- Packaging is configured but each operating system still needs hardware testing.
- Chromium inherits upstream behavior, memory costs, and security update cadence.

See [ROADMAP.md](ROADMAP.md) for planned work.

## Security

Please report vulnerabilities privately to the maintainers rather than opening a
public issue. Keep Electron current: Chromium security fixes arrive through Electron
releases.

## License

Liquea's original source code is available under the [MIT License](LICENSE).
Electron, Chromium, React, and other dependencies retain their own licenses.
