# Sygen

**Colors for your design system.** Start from your brand color and get a complete, accessible UI color system for light and dark mode, ready to paste into code or Figma.

Live at **[sygenn.vercel.app](https://sygenn.vercel.app)**. Free, no sign-up, everything runs in your browser.

## Design system builder

The core of Sygen, at [`/builder`](https://sygenn.vercel.app/builder):

1. **Brand color in.** Enter the color you already have. No color yet? The [palette tool](https://sygenn.vercel.app/palette) suggests starting points.
2. **Scales.** Brand (plus an optional second brand), a neutral gray tinted with your brand, and success, warning, danger and info, each as a full 50–950 scale in OKLCH.
3. **Semantic tokens.** shadcn-style tokens (`background`, `primary`, `muted`, `border`, …) for light and dark mode, each pointing to a scale step you can change.
4. **Readability check.** Every text and background pair is checked against WCAG 2.2 and APCA, with one-click fixes.
5. **Preview.** A gallery of real UI components in your colors.
6. **Export.** Tailwind v4 + shadcn, plain CSS variables, Figma variables or W3C design tokens.

Every state lives in the URL, so a system can be shared or reopened by its link.

## Tools

Each tool works on its own and can send its result to the builder.

| Tool                                                   | What it does                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| [Palette](https://sygenn.vercel.app/palette)           | Palettes built around your color, previewed on UI components         |
| [Scale](https://sygenn.vercel.app/scale)               | 50–950 shade scales for up to six colors, with Tailwind export       |
| [Contrast](https://sygenn.vercel.app/contrast)         | WCAG 2.2 and APCA checks, with the closest colors that pass          |
| [Convert](https://sygenn.vercel.app/convert)           | HEX, RGB, HSL, HWB, OKLCH, OKLab, LCH, Lab and Display P3            |
| [Gradient](https://sygenn.vercel.app/gradient)         | Linear, radial and conic gradients that stay vivid, blended in OKLCH |
| [Image colors](https://sygenn.vercel.app/image-colors) | Main colors of an image and a suggested brand color                  |
| [Color pages](https://sygenn.vercel.app/color/1f6cb0)  | Shades, readable pairs, palettes and a brand system for any color    |

Saved items and recent work are kept in your browser's local storage and listed in the [library](https://sygenn.vercel.app/saved).

## Tech stack

- [Nuxt 4](https://nuxt.com), Vue 3 and TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) and [shadcn-vue](https://www.shadcn-vue.com)
- [culori](https://culorijs.org) under a framework-free color engine in `app/lib/color` (OKLCH, gamut mapping, WCAG 2.2 and APCA contrast)
- [nuxt-og-image](https://nuxtseo.com/docs/og-image) with the Takumi renderer for per-page share images
- [Vitest](https://vitest.dev) for unit tests, [Prettier](https://prettier.io) for formatting
- Deployed on [Vercel](https://vercel.com)

## Getting started

Requires Node 22.22.3+ or 24.15+.

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:3000. `npm install` also turns on the project's git hooks.

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the dev server             |
| `npm run build`        | Production build                 |
| `npm run preview`      | Preview the production build     |
| `npm test`             | Run the unit tests once          |
| `npm run test:watch`   | Run the unit tests in watch mode |
| `npm run typecheck`    | Type-check the project           |
| `npm run format`       | Format the repository            |
| `npm run format:check` | Check formatting                 |

### Environment variables

| Variable          | Needed for                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NUXT_APP_SECRET` | Production. Signs share image URLs; at least 32 characters, keep it stable across deploys. Generate one with `npx nuxt-og-image generate-secret`. |
| `NUXT_SITE_URL`   | Optional. Overrides the site URL used for canonical links, the sitemap and share images. Defaults to `https://sygenn.vercel.app`.                 |
| `GTAG_ID`         | Optional. Turns on Google Analytics.                                                                                                              |

## Contributing

Architecture, conventions and product decisions are documented in [`AGENTS.md`](AGENTS.md) and [`docs/design-system.md`](docs/design-system.md). Before opening a pull request, make sure `npm run format:check`, `npm run typecheck` and `npm test` pass.

A few project rules are enforced by hooks:

- No comments in code; names carry the intent.
- No AI attribution in commit messages or pull requests.
- LF line endings everywhere.

Feedback on the code and ideas for the tools are welcome. Open an [issue](https://github.com/razmatinyan/sygen.app/issues).

## Author

Built by [Raz Matinyan](https://razmatinyan.com) in Armenia.
