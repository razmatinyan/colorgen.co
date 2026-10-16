# Design system

Source of truth for tokens is `app/assets/css/tailwind.css`. This document explains the intent behind them; if the two disagree, update both.

## Direction

ColorGen follows **shadcn/ui's "Maia" style** (`components.json` → `"style": "reka-maia"`): soft, rounded, monochrome chrome with generous but compact spacing. The look must read as a real product, not a generated landing page. The user's colors are the only saturated thing on screen.

**Hallmarks (keep):** pure-neutral surfaces, `rounded-2xl` cards with a `ring-foreground/10` edge, pill buttons (`rounded-4xl`), filled pill inputs/selects, `rounded-xl` list items with `bg-muted` for the active one, sentence-case labels.

**Avoid (reads as "AI-made"):** uppercase/letter-spaced micro labels, monospace "instrument" readouts, engineering grids, gradient glows, purple gradients, glassmorphism, heavy shadows, decorative illustrations, full-bleed vertical color stripes (Coolors).

**Accent:** `--brand` is overridden at runtime (on `<html>`) with the active palette's primary color. It's used **only** for the logo mark. Primary actions stay monochrome (`bg-primary`) like shadcn.

## Components

Use shadcn-vue primitives from `app/components/ui/` first (Button, Card, Badge, Select, ToggleGroup, Kbd, Separator, Tooltip, Popover, Dialog…). Add new ones with the CLI — see AGENTS.md §2 for the two import fixes the CLI currently needs.

| Pattern | How |
|---|---|
| Panels | `Card size="sm"` + `CardHeader` (`CardTitle`, `CardDescription`, optional `CardAction`) + `CardContent` |
| Main action | `<Button>` (default variant) with an optional `<Kbd>` hint |
| Secondary actions | `variant="outline"`; icon-only actions `variant="ghost" size="icon"` with a tooltip |
| Segmented control | `ToggleGroup type="single" :spacing="1"` inside `rounded-4xl bg-muted p-1`; active item `data-[state=on]:bg-background` |
| Selectable list item | `rounded-xl p-2.5`, `hover:bg-muted/50`, selected `bg-muted` |
| Key/value block | `rounded-xl bg-muted/50 p-1` with `rounded-lg px-3 py-2` rows; label `text-muted-foreground`, value `font-medium tabular-nums` |
| Status | `Badge variant="secondary"` + status tint (`bg-success/15 text-success`, `bg-warning/20`, `bg-destructive/10 text-destructive`) and a text label |
| Swatch | `rounded-lg`/`rounded-xl` with `ring-1 ring-foreground/10 ring-inset` so light colors don't dissolve |

## Color tokens

shadcn's neutral palette in OKLCH (chroma 0), light and dark.

| Token | Use |
|---|---|
| `background` / `foreground` | Page canvas and default text |
| `card`, `popover` | Raised surfaces |
| `muted` / `muted-foreground` | Fills for inputs, segmented controls, selected items; secondary text |
| `primary` / `primary-foreground` | Main actions (near-black in light, near-white in dark) |
| `secondary`, `accent` | Secondary buttons, hover fills |
| `border`, `input`, `ring` | Hairlines, input borders, focus rings |
| `success`, `warning`, `destructive` | Status only |
| `brand` / `brand-foreground` | Runtime palette color — logo mark only |

Rules:
- Components use token utilities only. No raw hex or arbitrary color values in app chrome.
- User colors are applied via inline `style`. Previews that need many derived colors set scoped CSS variables (`--pv-*`) on their root and reference them with `bg-(--pv-primary)`.
- Status is never conveyed by color alone.

## Typography

**Inter** for everything (400, 500, 600, 700), self-hosted via `@nuxt/fonts`. No monospace font; numbers and color values use `tabular-nums`.

Readable sizes — nothing smaller than 12px:

| Use | Class |
|---|---|
| Page title | `text-xl font-semibold` (tool pages), `text-4xl`+ for landing display |
| Card title | `CardTitle` (`text-base font-medium`) |
| Body, labels, values, descriptions | `text-sm` (14px) — the default for almost everything |
| Badges, chart legends, tiny meta | `text-xs` (12px) — minimum |

Labels and section headings are **sentence case**, `text-sm font-medium`, never uppercase. Tracking: headings `-0.022em` (`--tracking-heading`, applied in the base layer), body `-0.011em`, display `-0.035em` (`tracking-(--tracking-display)`).

## Shape and spacing

- Radius: cards `rounded-2xl`, buttons/inputs/badges `rounded-4xl` (pills), list items and inner blocks `rounded-xl`, swatches `rounded-lg`.
- Depth from surface steps and the card ring, not shadows. `shadow-xs` only on the active segment of a segmented control.
- Spacing on the 4px grid. Workspace gutters `p-4 sm:px-6`, gaps `gap-4` between cards.

## Layout

- `layouts/default.vue`: header, content, footer. For landing/content pages.
- `layouts/tool.vue`: header plus full-height workspace, no footer. On `lg+` the page doesn't scroll; each card's content scrolls.
- Tool workspace: a toolbar row (title + one-line instruction on the left, actions on the right), then **two areas**: a **sidebar** card on the left (~23rem) and a **preview** card filling the rest.
- **Edit where you select.** Selecting an item in the sidebar expands its controls inline, directly under it (accordion; one open at a time, click again to collapse). Never put an item list on one side and its editor on the other — splitting "choose" and "change" across the screen was tested and rejected as confusing.
- Keep expanded editors compact so the rest of the list stays visible: button rows instead of long lists, small side-by-side tiles instead of stacked rows.
- Mobile/tablet: the two cards stack (sidebar → preview) and size to their content (`content-start`).
- Previews adapt to their own width with container queries (`@container`, `@xl:`), not viewport breakpoints.
- **Previews are galleries of UI elements, not mock dashboards** — a masonry (`columns-*`) of small shadcn-style cards: buttons and inputs, a form, a chart, a stat card, navigation, chat, notifications, an empty state, avatars. Each palette role has a consistent job across the cards (primary = main buttons, toggles, active items; secondary = secondary buttons and positive numbers; accent = badges and alerts; highlight = avatars and soft accents; neutral = text, borders, surfaces), and the sidebar hints describe exactly those jobs.
- **Builder preview roles:** brand = main buttons, checkboxes/switches, focus rings, progress, chart bars (its scale), links and the active nav item (600 light / 300 dark text on a 100 / 900 fill); neutral = page, surfaces, fields, text, muted text and borders; success / warning / danger / info = alerts, status badges, validation messages, toasts and deltas — tinted (50 / 950 fill, 700 / 300 text, 200 / 800 border) or solid (the status color itself in light, its 400 step in dark). Phase 3 replaces this mapping with real semantic tokens.

## Wording

Plain words, not color science, in the main UI:

| Say | Not |
|---|---|
| Lightness · Intensity · Hue (shown as %, %, °) | L · C · H, Chroma |
| No harmony/style picker — Generate picks a harmony internally | Harmony, Style, Triadic, … |
| Readable as text? | Contrast ratio, WCAG (still shown as AA/AAA labels) |
| A short "used for" hint under every role name (Primary → "Buttons, links, active states") | Bare role names |

Technical formats (HEX, RGB, HSL, OKLCH) appear only where the user copies or exports values. Every panel has a one-line description saying what to do in it.

## Scrollbars

Thumb only — no arrow buttons, no visible track (global rule in `tailwind.css`): a 10px rounded thumb at `foreground / 20%`, `35%` on hover. Chromium/Safari use `::-webkit-scrollbar`; Firefox gets `scrollbar-width: thin` via `@supports not selector(::-webkit-scrollbar)` (setting the standard properties in Chromium would disable the pseudo-element styling and bring the arrows back).

## Motion

150–250ms, ease-out, on color/opacity/transform only. Color changes animate (`transition-colors duration-300`). Everything respects `prefers-reduced-motion` (enforced globally in the base layer).

## Interaction

- Keyboard-first: `Space` generate, `L` lock, `C` copy hex, `↑/↓` select, `⌘Z / ⇧⌘Z` undo/redo, `⌘K` command menu (planned). Shortcuts are shown in tooltips with `<Kbd>`.
- Single-key shortcuts are ignored while focus is in an input, button, link, combobox or editable element.
- Every copy action confirms with a toast that names the copied value.

## Dark mode

`@nuxtjs/color-mode` with `classSuffix: ''` toggles `.dark` on `<html>`; default follows the system, the header toggle cycles system → light → dark and persists in `localStorage` (`colorgen-color-mode`). No flash on load. UI that depends on the resolved mode must render inside `<ClientOnly>` or use `dark:` variants.
