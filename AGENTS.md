# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. This file is the single source of truth for project context, architecture, and conventions. `CLAUDE.md` imports it.

> **Keep this file current.** Any change that adds, moves, renames, or removes a route, directory, module, store, or convention must update the relevant section here **in the same commit**. If the architecture table below disagrees with the code, the code is wrong or this file is stale — fix one of them before finishing the task.

---

## 1. Product

**ColorGen** (working name — a rebrand is under consideration) is a color-system toolkit for **developers and UI designers**.

Every tool feeds one pipeline:

```
pick / generate  →  refine  →  check accessibility  →  preview on real UI  →  export as code
```

### Decisions (fixed unless the owner changes them)

| Topic | Decision |
|---|---|
| Audience | Developers and UI/product designers. Not print, not fine art. |
| AI features | **None.** No LLM calls, no API keys, no "AI palette". |
| Accounts | None in v1. Everything is client-side. Login may come later — keep persistence behind one composable so a sync backend can be added without touching tools. |
| Monetization | None. No ads, no paywalls, no "pro" gating. |
| Design | Original identity. Must **not** resemble Coolors (no full-bleed vertical color stripes as the primary UI). Professional design system, dark + light mode. |

### v1 scope

1. Palette generator — rebuilt on OKLCH, new UI
2. Scale (shade) generator — color → 50…950 scale
3. Theme builder — palette → semantic tokens, light/dark, live UI preview, shadcn/Tailwind export
4. Contrast checker + fixer — WCAG 2.2 and APCA
5. `/color/[hex]` pages — programmatic SEO pages for every color

Post-v1 (in rough order): color converter, image extractor rebuild, gradient/mesh generator rebuild, color-blindness simulator, library collections, Figma plugin, browser extension.

---

## 2. Stack & commands

- **Nuxt 4** (`app/` srcDir), Vue 3 `<script setup lang="ts">`, TypeScript
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.*`) + **shadcn-vue** (`reka-maia` style, components in `app/components/ui`)
- **culori** — color engine dependency (OKLCH, gamut mapping, WCAG contrast)
- **@nuxtjs/color-mode** (dark/light, `.dark` class) and **@nuxt/fonts** (self-hosted Inter)
- **@vueuse/core**, **vue-sonner** (toasts), **@nuxt/icon** with Lucide
- **@nuxtjs/sitemap**, **@nuxtjs/robots**
- Node 22

Legacy dependencies still installed until their pages are rebuilt: `chroma-js`, `colorthief`, `html2canvas`, `vuedraggable`. Do not use them in new code.

```bash
npm run dev        # dev server
npm run build      # production build
npm run generate   # static generation
npm run preview    # preview production build
npm run typecheck  # vue-tsc via nuxt typecheck — must pass before finishing a task
```

Planned (update this list when added): `vitest` with `npm run test`, `nuxt-og-image` for palette share images.

Add shadcn components with the CLI (`npx shadcn-vue@latest add <name>`), never by hand-copying. Do not edit generated files in `app/components/ui/` except for token-level styling tweaks.

The CLI currently emits two things that must be fixed after every `add`:
1. `import { cn } from 'cn'` → `import { cn } from '@/lib/utils'` (the module `cn` doesn't exist).
2. Icon components from `@lucide/vue` (`<XIcon />`, `<ChevronDownIcon />`, …) → Nuxt Icon (`<Icon name="lucide:x" />`). `@lucide/vue` is not a direct dependency.

It may also prepend a Google Fonts `@import` and a duplicate `@layer base` to `tailwind.css` — remove them (fonts are self-hosted by `@nuxt/fonts`).

---

## 3. Architecture

Status legend: ✅ exists · 🚧 planned · 🗑️ legacy, to be removed during the rebuild.

### Directory layout

| Path | Purpose | Status |
|---|---|---|
| `app/lib/color/` | **Color engine.** Pure TS, no Vue, no Nuxt, no DOM. Parsing, conversion, gamut mapping, harmonies, scales, contrast (WCAG/APCA), CVD simulation, naming. Fully unit-tested. | 🚧 |
| `app/lib/export/` | Pure formatters: CSS vars, Tailwind v4 `@theme`, shadcn theme, SCSS, W3C design-tokens JSON, SVG, ASE. | 🚧 |
| `app/lib/utils.ts` | shadcn `cn()` helper | ✅ |
| `app/lib/tools.ts` | Tool registry (label, route, icon, live/planned) — drives header nav and, later, the command menu and landing page | ✅ |
| `app/composables/` | Vue glue: URL state, persistence (`useLibrary`), keyboard shortcuts. `useAppToast` ✅; the rest of the current contents 🗑️ | ✅ |
| `app/components/ui/` | shadcn-vue primitives (generated) | ✅ |
| `app/components/app/` | App shell: `AppHeader` (tool nav, mobile popover menu), `AppLogo` (mark follows `--brand`), `AppThemeToggle` (system → light → dark), `AppFooter`. Command menu (⌘K) 🚧 | ✅ |
| `app/components/color/` | Reusable color widgets. `ColorGradientSlider` ✅ (channel slider with gradient track); swatch, color input, contrast badge 🚧 | ✅ |
| `app/components/<tool>/` | Tool-specific components, one folder per tool (`palette/`, `scale/`, `theme/`, `contrast/`, …) | 🚧 |
| `app/layouts/default.vue` | Header + content + footer (content pages) | ✅ |
| `app/layouts/tool.vue` | Header + full-height workspace, no footer (tool pages, `definePageMeta({ layout: 'tool' })`) | ✅ |
| `app/pages/` | Routes (see below). Pages compose components; no color math in pages. | ✅ |
| `app/assets/css/tailwind.css` | Tailwind entry, all design tokens (light + dark, OKLCH). Explained in `docs/design-system.md` | ✅ |
| `app/prototype/` + `app/components/prototype/` + `app/pages/prototype/` | **Temporary** design-review prototype of the palette tool (`/prototype/palette`, noindex): sidebar of colors with inline editing (`PaletteRow` → `ColorEditor`) and a `Preview` gallery of common UI elements (masonry of shadcn-style cards) in the palette. Delete once the real palette tool ships (Phase 2). Never import from real code. | ✅ temporary |
| `app/utils/` | Legacy helpers (`generatePalette`, `downloadColors`, …) — logic moves to `app/lib/` | 🗑️ |
| `app/components/{Home,Palette,Gradient}/`, `PaletteCard*.vue`, `ColorPicker.vue`, `DropZone.vue` | Legacy page components. Unstyled since the legacy CSS was removed; replaced as each page is rebuilt | 🗑️ |
| `app/info/trendingPalettes.js` | Legacy hardcoded data | 🗑️ |
| `docs/design-system.md` | Design system intent: concept, tokens, typography, layout, motion, interaction | ✅ |
| `app/plugins/chroma.ts`, `colorthief.client.ts` | Legacy color libs exposed via `$chroma` / `$colorthief` | 🗑️ |
| `app/plugins/gtag.js` | Google Analytics | ✅ |
| `server/api/saved/palettes.post.ts` | Cookie-based saved palettes | 🗑️ replaced by client-side `useLibrary` |
| `server/api/palette/[palette].ts` | Echoes its param; unused | 🗑️ |
| `server/api/gradient/[gradient].ts` | Gradient param parsing | 🗑️ |
| `tests/` or co-located `*.test.ts` in `app/lib/` | Vitest unit tests | 🚧 |

### Routes

Existing public URLs are kept so search rankings survive the rebuild.

| Route | Tool | Status |
|---|---|---|
| `/` | Landing — tool-first, links into every tool | ✅ (redesign 🚧) |
| `/palette`, `/palette/[colors]` | Palette generator; colors in URL as `hex-hex-hex` (no `#`) | ✅ (rebuild 🚧) |
| `/scale`, `/scale/[hex]` | Shade scale generator | 🚧 |
| `/theme` | Theme builder (state in query string) | 🚧 |
| `/contrast`, `/contrast/[fg]-[bg]` | Contrast checker + fixer | 🚧 |
| `/color/[hex]` | Programmatic SEO color page | 🚧 |
| `/gradient`, `/gradient/[gradient]` | Gradient generator | ✅ (rebuild post-v1) |
| `/image-colors` | Image color extractor | ✅ (rebuild post-v1) |
| `/saved` | Local library of saved palettes/themes (noindex) | ✅ (rebuild 🚧) |
| `/contact` | Contact | ✅ |
| `/prototype/palette` | Design-review prototype (noindex, excluded from sitemap/robots) | ✅ temporary |

### Data flow & state

- **Tool state lives in the URL** (path for colors, query for options). Every screen must be shareable and reload-safe. Use a single `useToolState`-style composable per tool that syncs to the router.
- **Persistence:** `useLibrary()` is the only module that reads/writes saved items. v1 backend = `localStorage` with a versioned schema (`{ version, items }`) and a migration function. Never touch `localStorage` outside it, and only on the client.
- **Color values** cross module boundaries as the engine's typed color object or as lowercase 6-digit hex strings. Never pass CSS strings like `rgb(...)` between modules.
- No global store library (Pinia) unless state genuinely needs to be shared across routes.

---

## 4. Color engine rules (`app/lib/color/`)

- **Perceptual space is OKLCH.** All generation, interpolation, scales, and harmonies operate in OKLCH (or OKLab for mixing). HSL is allowed only as an input/output format, never for math.
- **Gamut-map** every output to sRGB (and optionally Display-P3) before display/export. Never clip silently.
- Functions are **pure and deterministic**. Randomness takes an injectable seed/RNG so results are reproducible in tests and from URLs.
- Every exported function has unit tests, including edge cases: black, white, greys (undefined hue), out-of-gamut input, invalid strings.
- Contrast: implement WCAG 2.x ratio **and** APCA Lc. Label which one is shown in the UI.
- Keep the engine framework-free so it can later be reused in a Figma plugin or browser extension.

---

## 5. Design system

Full spec: **`docs/design-system.md`**. Tokens: `app/assets/css/tailwind.css`.

The chrome is neutral and quiet; the user's colors are the content. Visual style follows shadcn/ui "Maia" (rounded cards, pill buttons, pure neutrals, Inter, sentence-case labels). `--brand` is set at runtime to the active palette's primary color and is used only for the logo mark.

- **Tokens only.** Components use semantic Tailwind tokens (`bg-background`, `text-muted-foreground`, `border-border`, …). No raw hex/rgb, no arbitrary color values (`bg-[#...]`) in app chrome. User colors are applied via inline `style` bindings.
- **Tokens are defined in OKLCH** in the CSS entry file, for both `:root` (light) and `.dark`.
- **Dark and light mode** are first-class: every component is checked in both. Color mode follows system by default with a manual toggle, persisted, with no flash on load (SSR-safe).
- **Typography:** Inter only, no monospace; numbers and values use `tabular-nums`. Readable sizes: `text-sm` (14px) for body/labels/values, `text-xs` (12px) minimum. Sentence case everywhere — no uppercase labels. Headings use tight tracking (`-0.022em`), body `-0.011em`.
- **Shape:** cards `rounded-2xl`, buttons/inputs/badges pill (`rounded-4xl`), list items `rounded-xl`. Depth from surface steps and card rings, not shadows. Use shadcn primitives before writing custom markup.
- **Layout & wording:** tools use a sidebar + preview layout where selecting an item expands its editor inline (never list on one side, editor on the other). Main UI uses plain words (Style, Lightness / Intensity / Hue, "Readable as text?"); technical formats only where values are copied or exported. Details in `docs/design-system.md`.
- **Scrollbars:** thumb only, no arrows or track (global rule in `tailwind.css`).
- **Motion:** short (150–250 ms), purposeful, and disabled under `prefers-reduced-motion`.
- **Accessibility:** the app chrome itself meets WCAG 2.2 AA. Full keyboard operation, visible focus rings, labelled controls, and screen-reader announcements for copy/generate actions.
- **Keyboard-first:** tools expose shortcuts (e.g. space = regenerate, `L` = lock, `C` = copy, `⌘K` = command palette). Show them in tooltips.
- Responsive down to 360 px; tools must be usable on mobile, not just viewable.

---

## 6. Code conventions

**Build as if from scratch.** The rebuild does not preserve legacy code for its own sake. When touching an area, replace bad names, wrong logic, and Nuxt anti-patterns rather than working around them. Only public URLs are preserved.

### Legacy problems to eliminate (remove items as they are fixed)

- `utils/generatePalette.ts`: harmony math in HSL (perceptually uneven); "Split Complementary" is just complementary in LAB; "Random" ignores the base color; calls `useNuxtApp()` from a util. → `lib/color/` in OKLCH.
- Saved palettes stored in a cookie through `server/api/saved/palettes.post.ts`: ~4KB limit, sent with every request, entries matched by string equality, `status` returned in the body instead of HTTP status codes. → client-side `useLibrary()`.
- `server/api/gradient/[gradient].ts` parses a URL param on the server, costing a network round-trip for pure string parsing. `server/api/palette/[palette].ts` just echoes its param. → shared pure parser in `lib/`, no API.
- Composables: `useHomeSchemes` stores a `computed` inside `useState` (not serializable); `useColorCount` / `useFirstColor` / `useSecondColor` are global `useState` keys that leak state between pages; `Number` wrapper type. → per-tool state synced to the URL.
- Plugins exposing libraries (`$chroma`, `$extractPalette`) instead of importing modules. → direct imports from `lib/`.
- `utils/copyURL.ts` copies any text but is named for URLs. → `useClipboard` from VueUse. `utils/detectColorType.ts` regex parsing. → engine parser. `utils/downloadColors.ts` screenshots DOM via `html2canvas` + `querySelector` strings. → generated SVG/PNG from data.
- Mixed `.js`/`.ts` (`plugins/gtag.js`, `info/trendingPalettes.js`), legacy SFCs without `lang="ts"`, PascalCase component folders (`Home/`, `Palette/`, `Gradient/`). → TypeScript only; lowercase tool folders.
- `/saved` canonical points to `/palette/saved`.
- `npm audit` reports high/critical vulnerabilities in the dependency tree — review after legacy deps are removed.

- Vue SFCs: `<script setup lang="ts">`, Composition API, typed props/emits. No Options API, no new `.js` files.
- Components `PascalCase.vue` in lowercase folders. Nuxt prefixes with the folder name (`components/color/GradientSlider.vue` → `<ColorGradientSlider>`), so don't repeat the folder in the file name except for `app/` shell components, which use the `App` prefix.
- Composables `useThing.ts`; lib modules `kebab-case.ts`. Everything exported from `app/composables/` and `app/utils/` is auto-imported globally — keep helpers that aren't composables in `app/lib/` and import them explicitly.
- Styling with Tailwind utilities. No new global CSS files and no `<style>` blocks unless something can't be expressed with utilities.
- SSR safety: browser APIs (`window`, `localStorage`, `navigator.clipboard`, canvas) only inside `onMounted`, `import.meta.client` guards, or `.client` plugins/components.
- SEO: every indexable page sets `useSeoMeta` + canonical URL. Programmatic pages must have unique titles and descriptions and real content.
- Keep `nuxt.config.ts` sitemap/robots/routeRules in sync with the route table above.

## 7. Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`.
- Do not commit or push unless asked. Branch off `master` for rebuild work.

## 8. Definition of done

1. `npm run typecheck` passes (and `npm run test` once it exists).
2. New engine/export logic has tests.
3. UI checked in light **and** dark mode, desktop and mobile widths.
4. **This file's architecture section reflects the change.**
