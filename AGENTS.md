# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. This file is the single source of truth for project context, architecture, and conventions. `CLAUDE.md` imports it.

> **Keep this file current.** Any change that adds, moves, renames, or removes a route, directory, module, store, or convention must update the relevant section here **in the same commit**. If the architecture table below disagrees with the code, the code is wrong or this file is stale — fix one of them before finishing the task.

---

## 1. Product

**ColorGen** (working name — a rebrand is under consideration) helps **developers and UI designers get the colors for their design systems**.

The job to be done: *"I'm building a product. I need a complete, accessible color system for its UI — light and dark — in a format I can paste into code or Figma."*

The core product is the **design system builder**, one flow:

```
brand color  →  scales (brand, neutral, status)  →  semantic tokens (light + dark)  →  readability check  →  preview  →  export
```

Around it sit **standalone tools** (palette, shade scale, contrast checker, converter, `/color/[hex]` pages, later gradient and image). Each is useful on its own, shares the color engine, and can send its result into the builder ("Use in builder").

Users start from one of three places: **a brand color they already have** (main entry), **nothing** (needs a good starting color — the only place random generation belongs), or **an existing system to fix** (import, then fix contrast / add dark mode / fill missing scales).

### Decisions (fixed unless the owner changes them)

| Topic | Decision |
|---|---|
| Audience | Developers and UI/product designers. Not print, not fine art. |
| AI features | **None.** No LLM calls, no API keys, no "AI palette". |
| Accounts | None in v1. Everything is client-side. Login may come later — keep persistence behind one composable so a sync backend can be added without touching tools. |
| Monetization | None. No ads, no paywalls, no "pro" gating. |
| Design | Original identity. Must **not** resemble Coolors (no full-bleed vertical color stripes as the primary UI). Professional design system, dark + light mode. |
| Product shape | One **design system builder** as the core, **plus** standalone tools. Not a single tool, not a loose collection of unrelated tools. |
| System colors | **Brand** (primary, optionally more brand colors) + **neutral** (brand-tinted) + **status** (success, warning, danger, info). Every color is a full 50–950 scale. Not the 5-role mood-board model (primary/secondary/accent/highlight/neutral). |
| Exports | All four in v1: **Tailwind v4 + shadcn**, **plain CSS variables** (`:root` + `.dark`), **Figma variables** (JSON with light/dark modes), **W3C design tokens JSON**. |
| Generation | No "pick a harmony/style" UI. Random generation is never the main path — it only helps users who have no starting color, and should offer several good options to choose from rather than one roll of the dice. |

### v1 scope

1. **Design system builder** — brand color in; brand, neutral and status scales; semantic tokens for light and dark; readability check with auto-fix; UI gallery preview; all four exports; shareable URL
2. **Landing page** — starts the builder ("enter your brand color")
3. **Standalone tools** — shade scale generator, contrast checker (WCAG 2.2 + APCA), color converter, palette tool reworked around "start from your color", each with "Use in builder"
4. **`/color/[hex]` pages** — programmatic SEO pages that link into the builder

Post-v1 (in rough order): import an existing system, image extractor rebuild, gradient/mesh generator rebuild, color-blindness simulator, library collections, Figma plugin, browser extension.

---

## 2. Stack & commands

- **Nuxt 4** (`app/` srcDir), Vue 3 `<script setup lang="ts">`, TypeScript
- **Tailwind CSS v4** (CSS-first config, no `tailwind.config.*`) + **shadcn-vue** (`reka-maia` style, components in `app/components/ui`)
- **culori** — color engine dependency (OKLCH, gamut mapping, WCAG contrast)
- **@nuxtjs/color-mode** (dark/light, `.dark` class) and **@nuxt/fonts** (self-hosted Inter)
- **@vueuse/core**, **vue-sonner** (toasts via shadcn `Sonner`, mounted once in `app.vue` with the resolved color-mode theme; its stylesheet `vue-sonner/style.css` is loaded through `css` in `nuxt.config.ts` — without it toasts are invisible; show toasts only through `useAppToast`), **@nuxt/icon** with Lucide
- **@nuxtjs/sitemap**, **@nuxtjs/robots**
- Node 22

Legacy dependencies still installed until their pages are rebuilt: `chroma-js`, `colorthief`, `html2canvas`. Do not use them in new code.

```bash
npm run dev        # dev server
npm run build      # production build
npm run generate   # static generation
npm run preview    # preview production build
npm run typecheck  # vue-tsc via nuxt typecheck — must pass before finishing a task
npm test           # Vitest, runs app/lib/**/*.test.ts once — must pass before finishing a task
npm run test:watch # Vitest in watch mode
```

Planned (update this list when added): `nuxt-og-image` for palette share images.

Add shadcn components with the CLI (`npx shadcn-vue@latest add <name>`), never by hand-copying. Do not edit generated files in `app/components/ui/` except for token-level styling tweaks.

The CLI currently emits two things that must be fixed after every `add`:
1. `import { cn } from 'cn'` → `import { cn } from '@/lib/utils'` (the module `cn` doesn't exist).
2. Icon components from `@lucide/vue` (`<XIcon />`, `<ChevronDownIcon />`, …) → Nuxt Icon (`<Icon name="lucide:x" />`). `@lucide/vue` is not a direct dependency.

It may also prepend a Google Fonts `@import` and a duplicate `@layer base` to `tailwind.css` — remove them (fonts are self-hosted by `@nuxt/fonts`).

After adding components, **restart the dev server** — the shadcn module only registers `app/components/ui/*` folders at startup. Until then the new components render as unknown HTML elements (look for "Failed to resolve component" warnings), while `nuxt typecheck` still passes.

The CLI output also contains comments — remove them (see the no-comments rule in §6).

---

## 3. Architecture

Status legend: ✅ exists · 🚧 planned · 🗑️ legacy, to be removed during the rebuild.

### Directory layout

| Path | Purpose | Status |
|---|---|---|
| `app/lib/color/` | **Color engine.** Pure TS on top of `culori`, no Vue/Nuxt/DOM; import from `~/lib/color` (barrel `index.ts`). `types` (`Oklch`, `ColorInput` = Oklch or any CSS string), `parse` (`parseColor`, `toOklch`, `normalize`, `wrapHue`, `hueDifference` — signed shortest hue distance), `format` (`toHex`/`toRgbString`/`toHslString`/`toOklchString`/`formatColor`, `isInGamut`, `toGamutOklch` — gamut mapping reduces chroma only, lightness and hue stay exact), `contrast` (`wcagRatio`, `wcagLevel`, `apcaContrast` APCA-W3 0.0.98G-4g, `readableTextColor`), `scale` (`generateScale`/`scaleHexes`: 50–950, base color anchored at its nearest step; `toSwatches` gamut-maps 11 colors into labelled swatches), `neutral` (`generateNeutralScale`, `neutralChroma`: grays tinted with the brand hue, tint 0–1 up to `maxNeutralChroma`, own lightness curve with near-white 50 and near-black 950), `status` (`suggestStatusColor(s)`, `harmonizeHue`: success/warning/danger/info from fixed reference colors, hue pulled up to 10° toward the brand and clamped to `statusHueRanges` so each stays recognizable; chroma follows the brand's intensity), `system` (`generateSystem(SystemSettings)` → brand, optional second brand (`brand2`), neutral and four status scales; edited status colors replace the suggestions; `systemScales` lists the present ones in order), `brand` (`suggestSecondBrand`: hue ±60/150/180° from the brand, skipping success/warning/danger hues and muddy yellow-greens), `tokens` (shadcn token set + `success`/`warning`/`info` and their foregrounds, grouped in `tokenGroups`; a token value is a `TokenRef` — `'white'` or `'<scale>.<step>'` — per mode; `resolveTokens(system, overrides)` fills defaults: exact brand as light `primary`, lifted until 4.5:1 on the dark background in dark mode, white or neutral 950 text by WCAG, `ring`/`sidebar-*` follow their source tokens; overrides pointing to a missing scale are ignored; `nearbyRefs` orders steps by distance), `readability` (`readabilityPairs` — 15 text pairs at 4.5:1, `primary` and `ring` on the page at 3:1 — `checkReadability` with WCAG ratio, level and APCA Lc, `findFix` = nearest passing step of the foreground then the background, `fixReadability` for one pair or all), `random` (seeded `createRng`), `generate` (`generatePalette` per role with a randomly chosen harmony, built around locked colors), `names` (`describeColor`). Every module has a co-located `*.test.ts` | ✅ |
| `app/lib/palette-url.ts` | `/palette/<colors>` param parsing/serializing (`parseColorsParam`, `toColorsParam`) and the shared bare-hex helpers `parseHexPart`/`toHexPart`, tested | ✅ |
| `app/lib/builder-url.ts` | `/builder/<brands>` path (`parseBrandsParam`/`toBrandsParam`: one or two bare hex colors, dash-separated) and query (`parseBuilderQuery`/`toBuilderQuery`): `tint` (0–100), edited status colors (`success`, `warning`, `danger`, `info` as bare hex) and `tokens` overrides (`name.mode~ref`, comma-separated, e.g. `primary.dark~brand.400`); defaults are omitted, malformed values ignored. Tested | ✅ |
| `app/lib/keyboard.ts` | `isInteractiveTarget` — single-key shortcuts ignore events from inputs, buttons, links and editable elements | ✅ |
| `app/lib/export/` | Pure formatters from one `ExportModel` (`buildExportModel(system, tokens)`: scales named `brand`, `brand-2`, `neutral`, `success`, `warning`, `danger`, `info`; tokens with light/dark hex, OKLCH and the scale step they point to). `toTailwindCss` (Tailwind v4 `@theme` scales as `--color-<scale>-<step>`, shadcn `:root` / `.dark` tokens with raw values, `@theme inline` mapping), `toCssVariables` (scales once in `:root`, tokens as `var(--<scale>-<step>)` references, `.dark` overrides tokens only), `toDesignTokens` (W3C DTCG: `color` primitives incl. `white`, `light` / `dark` groups as aliases), `toFigmaTokens(model, mode)` (one DTCG file per mode with plain values — Figma's variable import; mode mapping not verified against Figma yet). Colors as `oklch` or `hex` for CSS formats, DTCG color objects (`colorSpace`, `components`, `alpha`, `hex`) for JSON; `toJson` keeps number arrays on one line. Tested. Planned: SCSS, SVG, ASE | ✅ |
| `app/lib/utils.ts` | shadcn `cn()` helper | ✅ |
| `app/lib/tools.ts` | Tool registry (label, route, icon, live/planned) — drives header nav, the command menu and, later, the landing page. Builder is listed first | ✅ |
| `app/composables/` | Vue glue: URL state, persistence (`useLibrary`), keyboard shortcuts. `useAppToast` ✅, `useCommandMenu` ✅ (shared ⌘K open state), `useUndoHistory` ✅ (snapshot/undo/redo for any ref; call `snapshot()` before a change), `useLibrary` ✅ (shared; `localStorage` key `colorgen-library`, read on mount; currently only recents — `rememberRecent`, `clearRecents`), `useRecentTracking(kind, snapshot)` ✅ (tool pages call it; records the current URL with a title and swatch colors whenever the path changes, one entry per visit), `useFileDownload` ✅ (client-only Blob download), `useModifierKey` ✅ (`⌘` on Apple devices, `Ctrl` elsewhere, resolved after mount); `useColorCount` / `useHomeSchemes` 🗑️ | ✅ |
| `app/components/ui/` | shadcn-vue primitives (generated). Local fix: `sidebar/SidebarProvider.vue` treats the viewport as desktop until mounted (`isMobile` = mounted && media query) to avoid a hydration mismatch on phones — keep it when re-adding the sidebar. Token tweak: sidebar menu buttons use `rounded-sm` (in `sidebar/index.ts`) | ✅ |
| `app/components/app/` | App shell: `AppSidebar` (tool pages: logo, search → command menu, Builder, Tools group with "Soon" items, Recent with empty state, footer with Library, Contact, GitHub, theme cycle; collapses to an icon rail with ⌘B/Ctrl+B, sheet on mobile), `AppTopBar` (top bar inside the tool panel: sidebar toggle, page title as `h1` — `title-as="p"` for legacy pages that have their own — and the page's actions in the default slot; labels hide below `sm`), `AppHeader` (content pages only: tool nav, mobile popover menu), `AppLogo` (mark follows `--brand`), `AppThemeToggle` (system → light → dark), `AppFooter`, `AppCommandTrigger` (search pill in the header), `AppCommandMenu` (global ⌘K / Ctrl+K dialog, mounted once in `app.vue`: tools, theme, links) and `AppSegmentedControl` (pill segmented control with `v-model`, e.g. Light/Dark) | ✅ |
| `app/components/color/` | Reusable color widgets. `ColorGradientSlider` ✅ (channel slider with gradient track), `ColorChannelSliders` ✅ (Lightness / Intensity / Hue for one `Oklch`, emits `update` patches and `commit` before a change); swatch, color input, contrast badge 🚧 | ✅ |
| `app/components/<tool>/` | Tool-specific components, one folder per tool (`builder/`, `palette/`, `scale/`, `contrast/`, …) | 🚧 |
| `app/layouts/default.vue` | Header + content + footer (content pages) | ✅ |
| `app/layouts/app.vue` | App shell for every tool page (`definePageMeta({ layout: 'app' })`): shadcn `SidebarProvider` + `AppSidebar` (variant `inset`, collapsible `icon`) + `SidebarInset` panel. Open/collapsed state persists in the `sidebar_state` cookie (read via `useCookie` so SSR matches). On `lg+` nothing scrolls but card contents; each page renders its own `AppTopBar` | ✅ |
| `app/lib/library.ts` | Pure library schema: `LibraryData` (`{ version: 1, recents }`), `parseLibrary`/`migrateLibrary` (anything unknown → empty library, invalid entries dropped, only local paths), `upsertRecent` (dedupes by visit id and by path, newest first, max 8), `clearRecents`. Tested | ✅ |
| `app/pages/` | Routes (see below). Pages compose components; no color math in pages. | ✅ |
| `app/assets/css/tailwind.css` | Tailwind entry, all design tokens (light + dark, OKLCH). Explained in `docs/design-system.md` | ✅ |
| `app/composables/usePaletteGenerator.ts` | Palette generator state: five role colors with labels and "used for" hints, locks, undo/redo, inline-editor selection, CSS export. All color math comes from `~/lib/color`. Exposes `paletteGeneratorKey` for `provide`/`inject` | ✅ |
| `.claude/settings.json`, `.claude/hooks/no-comments.mjs` | PreToolUse hook enforcing the no-comments rule; `--scan <paths>` mode lists existing comments | ✅ |
| `app/composables/useDesignSystemBuilder.ts` | Builder state: `BuilderState` (brand, second brand or `null`, neutral tint, edited status colors, token overrides), the generated `system`, resolved `tokens`, `readability` results, sidebar `colors` with labels and "used for" hints, add/remove second brand (removing also drops token overrides that point to it), token set/reset, `fixPair`/`fixAll`, undo/redo, inline-editor selection; `tokenRefLabel` ("Brand 600", "White"). Exposes `designSystemBuilderKey` for `provide`/`inject` | ✅ |
| `app/components/builder/` | Builder UI: `ColorRow` (sidebar item that expands inline), `ColorEditor` (brand and second brand: color input + sliders, second brand removable; neutral: brand tint; status: sliders + reset to suggested), `Tokens` (readability summary with Fix / Fix all, then every token group with light and dark cells), `TokenCell` (swatch + "Brand 600" label; popover step picker over every scale plus white, with the pairs it takes part in), `Scales` (every scale, click a step to copy, dot marks the user's exact color), `Preview` (UI gallery driven by the resolved tokens; alert tints come from the status scales), `ExportDialog` (format switch — Tailwind + shadcn, CSS, Figma, design tokens — OKLCH/HEX option, file preview, Copy and Download; warns about failing readability checks with a link to the Tokens view; opened from the top bar or with `E`) | ✅ |
| `app/components/palette/` | Palette tool UI: `ColorRow` (sidebar item that expands inline), `ColorEditor` (sliders, copy formats, readability), `Preview` (gallery of UI elements in the palette). State comes from `usePaletteGenerator` via `provide`/`inject` (`paletteGeneratorKey`) | ✅ |
| `app/utils/` | Legacy helpers (`generatePalette`, `downloadColors`, …) — logic moves to `app/lib/` | 🗑️ |
| `app/components/{Home,Gradient}/`, `PaletteCard*.vue`, `ColorPicker.vue`, `DropZone.vue` | Legacy page components. Unstyled since the legacy CSS was removed; replaced as each page is rebuilt | 🗑️ |
| `app/info/trendingPalettes.js` | Legacy hardcoded data | 🗑️ |
| `docs/design-system.md` | Design system intent: concept, tokens, typography, layout, motion, interaction | ✅ |
| `app/plugins/chroma.ts`, `colorthief.client.ts` | Legacy color libs exposed via `$chroma` / `$colorthief` | 🗑️ |
| `app/plugins/gtag.js` | Google Analytics | ✅ |
| `server/api/saved/palettes.post.ts` | Cookie-based saved palettes | 🗑️ replaced by client-side `useLibrary` |
| `server/api/gradient/[gradient].ts` | Gradient param parsing | 🗑️ |
| `vitest.config.ts` + co-located `app/lib/**/*.test.ts` | Vitest unit tests in plain Node (no Nuxt environment) | ✅ |

### Routes

Existing public URLs are kept so search rankings survive the rebuild.

| Route | Tool | Status |
|---|---|---|
| `/` | Landing — tool-first, links into every tool | ✅ (redesign 🚧) |
| `/palette`, `/palette/<colors>` | Palette generator (`pages/palette/[[colors]].vue`; static page key so URL updates don't remount). Colors live in the URL as `hex-hex-hex` (no `#`), synced with `router.replace` (debounced, no history entries); malformed params 301 to `/palette`; canonical = current path | ✅ |
| `/builder`, `/builder/<brands>` | Design system builder (`pages/builder/[[brands]].vue`; static page key). Brand colors in the path as bare hex (`1f6cb0-8b5cf6`, or one color when the second brand is removed; `/builder` alone starts with a default brand plus a suggested second one), options in the query (`tint`, edited status colors, `tokens` — see `lib/builder-url.ts`); synced with `router.replace`, debounced; malformed path 301s to `/builder`; canonical = current path without query | ✅ |
| `/scale`, `/scale/[hex]` | Shade scale generator | 🚧 |
| `/contrast`, `/contrast/[fg]-[bg]` | Contrast checker + fixer | 🚧 |
| `/color/[hex]` | Programmatic SEO color page | 🚧 |
| `/gradient`, `/gradient/[gradient]` | Gradient generator | ✅ (rebuild post-v1) |
| `/image-colors` | Image color extractor | ✅ (rebuild post-v1) |
| `/saved` | Local library of saved palettes/themes (noindex) | ✅ (rebuild 🚧) |
| `/contact` | Contact | ✅ |

### Data flow & state

- **Tool state lives in the URL** (path for colors, query for options). Every screen must be shareable and reload-safe. Use a single `useToolState`-style composable per tool that syncs to the router.
- **Persistence:** `useLibrary()` is the only module that reads/writes saved items. v1 backend = `localStorage` with a versioned schema (`lib/library.ts`, currently `{ version: 1, recents }`; saved items arrive as a version bump handled in `migrateLibrary`). Never touch `localStorage` outside it, and only on the client.
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
- **Layout & wording:** tools use a sidebar + preview layout where selecting an item expands its editor inline (never list on one side, editor on the other). Main UI uses plain words (Lightness / Intensity / Hue, "Readable as text?"); technical formats only where values are copied or exported. Details in `docs/design-system.md`.
- **Scrollbars:** thumb only, no arrows or track (global rule in `tailwind.css`).
- **Motion:** short (150–250 ms), purposeful, and disabled under `prefers-reduced-motion`.
- **Accessibility:** the app chrome itself meets WCAG 2.2 AA. Full keyboard operation, visible focus rings, labelled controls, and screen-reader announcements for copy/generate actions.
- **Keyboard-first:** tools expose shortcuts (e.g. space = regenerate, `L` = lock, `C` = copy, `⌘K` = command palette). Show them in tooltips.
- Responsive down to 360 px; tools must be usable on mobile, not just viewable.

---

## 6. Code conventions

**No comments in code. None.** No `//` or `/* */` comments, no JSDoc, no `<!-- -->` in templates, no CSS comments — in every code file, including generated ones. Intent goes into names: functions, variables, types and components should explain themselves. Enforced by a PreToolUse hook (`.claude/settings.json` → `.claude/hooks/no-comments.mjs`) that blocks any Write/Edit adding a comment to `.ts/.tsx/.js/.mjs/.cjs/.vue/.css/.scss`. Tools that write files directly (e.g. the shadcn CLI) bypass the hook, so after running them strip their comments and check with `node .claude/hooks/no-comments.mjs --scan app server` (exit code 1 lists every comment).

**Build as if from scratch.** The rebuild does not preserve legacy code for its own sake. When touching an area, replace bad names, wrong logic, and Nuxt anti-patterns rather than working around them. Only public URLs are preserved.

### Legacy problems to eliminate (remove items as they are fixed)

- `utils/generatePalette.ts`: harmony math in HSL (perceptually uneven); "Split Complementary" is just complementary in LAB; "Random" ignores the base color; calls `useNuxtApp()` from a util. → `lib/color/` in OKLCH.
- Saved palettes stored in a cookie through `server/api/saved/palettes.post.ts`: ~4KB limit, sent with every request, entries matched by string equality, `status` returned in the body instead of HTTP status codes. → client-side `useLibrary()`.
- `server/api/gradient/[gradient].ts` parses a URL param on the server, costing a network round-trip for pure string parsing. → shared pure parser in `lib/`, no API.
- Composables: `useHomeSchemes` stores a `computed` inside `useState` (not serializable); `useColorCount` is a global `useState` key that leak state between pages; `Number` wrapper type. → per-tool state synced to the URL.
- Plugins exposing libraries (`$chroma`, `$extractPalette`) instead of importing modules. → direct imports from `lib/`.
- `utils/copyURL.ts` copies any text but is named for URLs. → `useClipboard` from VueUse. `utils/downloadColors.ts` screenshots DOM via `html2canvas` + `querySelector` strings. → generated SVG/PNG from data.
- Mixed `.js`/`.ts` (`plugins/gtag.js`, `info/trendingPalettes.js`), legacy SFCs without `lang="ts"`, PascalCase component folders (`Home/`, `Palette/`, `Gradient/`). → TypeScript only; lowercase tool folders.
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
