import { describe, expect, it } from 'vitest'
import {
	colorDifference,
	generateSystem,
	hueDifference,
	parseColor,
	resolveTokens,
	toHex,
	type SystemSettings,
} from '../color'
import {
	buildExportModel,
	toCssVariables,
	toDesignTokens,
	toFigmaTokens,
	toTailwindCss,
	toTailwindScales,
} from '../export'
import {
	compositeOver,
	parseCss,
	parseImportString,
	parseImportValue,
	parseJsonTokens,
	parseTailwindConfig,
	readImport,
	readSource,
	recognizeImport,
} from '.'

const star = '*'
const slash = '/'
const blockComment = (text: string) => `${slash}${star} ${text} ${star}${slash}`
const lineComment = (text: string) => `${slash}${slash} ${text}`

const shadcnOklch = `
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  --radius-sm: calc(var(--radius) - 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --sidebar-ring: var(--ring);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * { @apply border-border outline-ring/50; }
}
`

const shadcnHsl = `
@tailwind base;
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    ${blockComment('brand')}
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --border: 214.3 31.8% 91.4%;
    --destructive: 0 84.2% 60.2%;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --primary: 217.2 91.2% 59.8%;
  }
}
`

const settings: SystemSettings = {
	brand: parseColor('#1f6cb0')!,
	brand2: null,
	neutralTint: 0.3,
	neutralHue: null,
	status: {},
}

describe('parseImportString', () => {
	it.each([
		['#1f6cb0', '#1f6cb0'],
		['rgb(31 108 176)', '#1f6cb0'],
		['oklch(0.5 0.13 250) !important', '#1666aa'],
		['207.6 70.1% 40.6%', '#1f6db0'],
		['207.6deg, 70.1%, 40.6%', '#1f6db0'],
		['31 108 176', '#1f6cb0'],
		['31, 108, 176', '#1f6cb0'],
		['0.5 0.13 250', '#1666aa'],
		['50% 0.13 250', '#1666aa'],
		['rebeccapurple', '#663399'],
	])('reads %j', (value, hex) => {
		expect(toHex(parseImportString(value)!.color)).toBe(hex)
	})

	it.each(['', 'inherit', 'transparent', 'currentColor', '0.625rem', 'calc(1px + 2px)', '500', '1f6cb0', 'var(--x)'])(
		'ignores %j',
		(value) => {
			expect(parseImportString(value)).toBeNull()
		},
	)

	it('keeps the alpha channel', () => {
		expect(parseImportString('oklch(1 0 0 / 10%)')!.alpha).toBeCloseTo(0.1)
		expect(parseImportString('217 91% 60% / 0.5')!.alpha).toBeCloseTo(0.5)
	})
})

describe('parseImportValue', () => {
	it('reads DTCG color objects in several color spaces', () => {
		expect(toHex(parseImportValue({ colorSpace: 'srgb', components: [1, 0, 0], alpha: 1 })!.color)).toBe('#ff0000')
		expect(toHex(parseImportValue({ colorSpace: 'hsl', components: [0, 100, 50] })!.color)).toBe('#ff0000')
		expect(toHex(parseImportValue({ colorSpace: 'oklch', components: [0.5, 0.13, 250] })!.color)).toBe('#1666aa')
		expect(parseImportValue({ colorSpace: 'display-p3', components: [1, 0, 0] })!.color.c).toBeGreaterThan(0.25)
	})

	it('falls back to the hex of a color object', () => {
		const value = parseImportValue({ colorSpace: 'unknown', components: [1, 2, 3], hex: '#1f6cb0' })
		expect(toHex(value!.color)).toBe('#1f6cb0')
	})

	it('ignores anything else', () => {
		expect(parseImportValue(42)).toBeNull()
		expect(parseImportValue(null)).toBeNull()
		expect(parseImportValue(['#fff'])).toBeNull()
		expect(parseImportValue({ colorSpace: 'srgb' })).toBeNull()
	})
})

describe('compositeOver', () => {
	it('blends translucent colors over the background in sRGB', () => {
		const white = parseColor('#ffffff')!
		const black = parseColor('#000000')!
		expect(colorDifference(compositeOver({ color: white, alpha: 0.5 }, black), '#808080')).toBeLessThan(0.005)
		expect(compositeOver({ color: white, alpha: 1 }, black)).toBe(white)
	})
})

describe('parseCss', () => {
	it('reads light and dark variables and resolves references', () => {
		const { colors } = parseCss(shadcnOklch)
		const find = (name: string, mode: 'light' | 'dark') =>
			colors.find((color) => color.name === name && color.mode === mode)
		expect(toHex(find('primary', 'light')!.color)).toBe('#171717')
		expect(toHex(find('primary', 'dark')!.color)).toBe('#e5e5e5')
		expect(toHex(find('color-primary', 'light')!.color)).toBe('#171717')
		expect(toHex(find('sidebar-ring', 'dark')!.color)).toBe(toHex(find('ring', 'dark')!.color))
		expect(find('card', 'dark')).toBeUndefined()
		expect(colors.some((color) => color.name.startsWith('radius'))).toBe(false)
	})

	it('reads bare HSL triplets inside @layer and ignores comments', () => {
		const { colors } = parseCss(shadcnHsl)
		expect(toHex(colors.find((color) => color.name === 'primary' && color.mode === 'light')!.color)).toBe('#2563eb')
		expect(colors.filter((color) => color.mode === 'dark').map((color) => color.name)).toEqual([
			'background',
			'primary',
		])
	})

	it('treats other dark selectors and media queries as dark mode', () => {
		const css = `
			[data-theme="dark"] { --a: #111111; }
			@media (prefers-color-scheme: dark) { :root { --b: #222222; } }
			:root { --a: #eeeeee; --b: #dddddd; }
		`
		const dark = parseCss(css).colors.filter((color) => color.mode === 'dark')
		expect(dark.map((color) => [color.name, toHex(color.color)])).toEqual([
			['a', '#111111'],
			['b', '#222222'],
		])
	})

	it('reads loose declarations without a selector', () => {
		expect(parseCss('--brand: #1f6cb0;\n--accent: #f68443').colors.map((color) => color.name)).toEqual([
			'brand',
			'accent',
		])
	})

	it('reports color values it cannot read', () => {
		const { skipped } = parseCss(':root { --primary: hsl(var(--missing)); --ring: oklch(nope); --size: 4px; }')
		expect(skipped).toEqual([
			{ source: '--primary', reason: 'missing-reference' },
			{ source: '--ring', reason: 'unreadable' },
		])
	})

	it('survives circular references', () => {
		const { colors } = parseCss(':root { --a: var(--b); --b: var(--a); --color-c: #fff; }')
		expect(colors.map((color) => color.name)).toEqual(['color-c'])
	})
})

describe('parseJsonTokens', () => {
	it('reads DTCG tokens with group types, aliases and mode groups', () => {
		const json = JSON.stringify({
			color: { $type: 'color', blue: { 500: { $value: '#3b82f6' } } },
			light: { primary: { $type: 'color', $value: '{color.blue.500}' } },
			dark: { primary: { $type: 'color', $value: { colorSpace: 'srgb', components: [1, 1, 1] } } },
			spacing: { $type: 'dimension', small: { $value: '4px' } },
		})
		const { colors } = parseJsonTokens(json)!
		expect(colors.map((color) => [color.name, color.mode, toHex(color.color)])).toEqual([
			['color-blue-500', 'light', '#3b82f6'],
			['primary', 'light', '#3b82f6'],
			['primary', 'dark', '#ffffff'],
		])
	})

	it('reads legacy value/type tokens and plain string trees', () => {
		const legacy = parseJsonTokens(JSON.stringify({ primary: { value: '#1f6cb0', type: 'color' } }))!
		expect(legacy.colors[0]!.name).toBe('primary')
		const plain = parseJsonTokens(JSON.stringify({ brand: { 500: '#1f6cb0' }, primaryForeground: '#fff' }))!
		expect(plain.colors.map((color) => color.name)).toEqual(['brand-500', 'primary-foreground'])
	})

	it('takes the mode from the file name when the tokens have none', () => {
		const json = JSON.stringify({ theme: { primary: { $type: 'color', $value: '#1f6cb0' } } })
		expect(parseJsonTokens(json, 'sygen-dark.tokens.json')!.colors[0]!.mode).toBe('dark')
		expect(parseJsonTokens(json, 'sygen-light.tokens.json')!.colors[0]!.mode).toBe('light')
	})

	it('reports broken aliases', () => {
		const json = JSON.stringify({ primary: { $type: 'color', $value: '{color.missing}' } })
		expect(parseJsonTokens(json)!.skipped).toEqual([{ source: 'primary', reason: 'missing-reference' }])
	})

	it('returns null for invalid JSON or non-objects', () => {
		expect(parseJsonTokens('{ nope')).toBeNull()
		expect(parseJsonTokens('[1, 2]')).toBeNull()
	})
})

describe('parseTailwindConfig', () => {
	const config = `
		const colors = require('tailwindcss/colors')
		${blockComment('@type config')}
		module.exports = {
			content: ['./src/index.html'],
			theme: {
				colors: {
					transparent: 'transparent',
					white: colors.white,
					gray: colors.slate,
					danger: colors.red[600],
					brand: {
						DEFAULT: '#1f6cb0', ${lineComment('main')}
						light: "#5b9bd5",
						'900': '#0b2a4a',
					},
					primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
				},
				extend: {
					colors: { accent: '#f68443', ...colors, muted: theme('colors.gray.100') },
				},
			},
			plugins: [require('@tailwindcss/forms')],
		}
	`

	it('reads nested colors, DEFAULT keys and Tailwind palette references', () => {
		const { colors } = parseTailwindConfig(config)
		const byName = Object.fromEntries(colors.map((color) => [color.name, toHex(color.color)]))
		expect(byName.white).toBe('#ffffff')
		expect(byName['gray-500']).toBe('#64748b')
		expect(byName.danger).toBe('#dc2626')
		expect(byName.brand).toBe('#1f6cb0')
		expect(byName['brand-light']).toBe('#5b9bd5')
		expect(byName['brand-900']).toBe('#0b2a4a')
		expect(byName.accent).toBe('#f68443')
		expect(byName.muted).toBeUndefined()
	})

	it('reports colors that point to CSS variables', () => {
		const { skipped } = parseTailwindConfig(config)
		expect(skipped).toContainEqual({ source: 'colors.primary', reason: 'missing-reference' })
		expect(skipped).toContainEqual({ source: 'colors.primary.foreground', reason: 'missing-reference' })
	})

	it('finds nothing in unrelated code', () => {
		expect(parseTailwindConfig('export default { plugins: [] }').colors).toEqual([])
	})
})

describe('readSource', () => {
	it('detects the format', () => {
		expect(readSource({ text: shadcnOklch })!.format).toBe('css')
		expect(readSource({ text: '{ "primary": "#1f6cb0" }' })!.format).toBe('json')
		expect(readSource({ text: "export default { theme: { colors: { brand: '#1f6cb0' } } }" })!.format).toBe(
			'tailwind-config',
		)
		expect(readSource({ text: '   ' })).toBeNull()
		expect(readSource({ text: 'hello world' })).toBeNull()
	})
})

describe('recognizeImport', () => {
	it('sorts colors into tokens, scales and loose colors', () => {
		const { tokens, scales, loose } = recognizeImport(
			parseCss(`
				:root {
					--color-blue-500: #3b82f6; --color-blue-600: #2563eb;
					--primary: #2563eb; --on-primary: #ffffff; --error: #dc2626;
					--brand: #1f6cb0; --radius-color: #000;
				}
			`).colors,
		)
		expect(toHex(tokens.primary!.light!.color)).toBe('#2563eb')
		expect(toHex(tokens['primary-foreground']!.light!.color)).toBe('#ffffff')
		expect(toHex(tokens.destructive!.light!.color)).toBe('#dc2626')
		expect(scales).toEqual([{ name: 'blue', steps: { 500: expect.anything(), 600: expect.anything() } }])
		expect(loose.map((color) => color.name)).toEqual(['brand', 'radius-color'])
	})

	it('prefers the real token name over an alias', () => {
		const { tokens } = recognizeImport(parseCss(':root { --destructive: #b91c1c; --error: #dc2626; }').colors)
		expect(toHex(tokens.destructive!.light!.color)).toBe('#b91c1c')
	})

	it('flattens translucent colors onto the background of their mode', () => {
		const { tokens } = recognizeImport(parseCss(shadcnOklch).colors)
		expect(toHex(tokens.border!.dark!.color)).toBe('#232323')
	})
})

describe('readImport', () => {
	it('maps a shadcn theme onto the builder model', () => {
		const reading = readImport([{ text: shadcnHsl }])
		expect(reading.formats).toEqual(['css'])
		expect(reading.hasDarkMode).toBe(true)
		const { system, picks, comparisons } = reading.result!
		expect(toHex(system.brand)).toBe('#2563eb')
		expect(system.brand2).toBeNull()
		expect(picks.find((pick) => pick.id === 'brand')!.source).toBe('--primary')
		expect(picks.find((pick) => pick.id === 'danger')!.source).toBe('--destructive')
		expect(toHex(system.status.danger!)).toBe('#ef4444')
		expect(comparisons.find((entry) => entry.name === 'primary' && entry.mode === 'light')!.match).toBe('same')
		expect(comparisons.every((entry) => entry.match !== 'changed')).toBe(true)
	})

	it('keeps a neutral hue that differs from the brand', () => {
		const css = `:root {
			--primary: #ea580c; --background: #ffffff; --foreground: #0f172a; --muted: #f1f5f9;
			--muted-foreground: #64748b; --border: #e2e8f0;
		}`
		const { system } = readImport([{ text: css }]).result!
		expect(system.neutralHue).not.toBeNull()
		expect(Math.abs(hueDifference(system.neutralHue!, 257))).toBeLessThan(10)
	})

	it('picks the brand from scales when there are no tokens', () => {
		const reading = readImport([
			{ text: 'module.exports = { theme: { colors: { gray: colors.zinc, ocean: colors.sky, red: colors.red } } }' },
		])
		expect(reading.formats).toEqual(['tailwind-config'])
		expect(reading.scaleNames).toEqual(['gray', 'ocean', 'red'])
		const { system, picks, comparisons, missingTokens } = reading.result!
		expect(picks.find((pick) => pick.id === 'brand')!.source).toBe('ocean scale')
		expect(Math.abs(hueDifference(system.neutralHue!, 286))).toBeLessThan(10)
		expect(picks.find((pick) => pick.id === 'danger')!.source).toBe('colors.red.600')
		expect(comparisons).toEqual([])
		expect(missingTokens).toBeGreaterThan(0)
	})

	it('adds a second brand only when secondary is colorful', () => {
		const gray = readImport([{ text: ':root { --primary: #1f6cb0; --secondary: #f1f5f9; }' }]).result!
		expect(gray.system.brand2).toBeNull()
		const purple = readImport([{ text: ':root { --primary: #1f6cb0; --secondary: #8b5cf6; }' }]).result!
		expect(toHex(purple.system.brand2!)).toBe('#8b5cf6')
	})

	it('counts unreadable and unresolved colors', () => {
		const reading = readImport([{ text: ':root { --primary: #1f6cb0; --ring: hsl(var(--x)); --accent: oklch(?); }' }])
		expect(reading.missingReferences).toBe(1)
		expect(reading.unreadable).toBe(1)
	})

	it('returns no result without colors', () => {
		expect(readImport([{ text: '' }]).result).toBeNull()
		expect(readImport([{ text: ':root { --radius: 4px; }' }]).result).toBeNull()
	})

	it('merges several files', () => {
		const light = JSON.stringify({ theme: { primary: { $type: 'color', $value: '#1f6cb0' } } })
		const dark = JSON.stringify({ theme: { primary: { $type: 'color', $value: '#5b9bd5' } } })
		const reading = readImport([
			{ text: light, fileName: 'light.tokens.json' },
			{ text: dark, fileName: 'dark.tokens.json' },
		])
		expect(reading.hasDarkMode).toBe(true)
		expect(reading.tokenCount).toBe(1)
	})
})

describe('round trip through every export', () => {
	const systems: [string, SystemSettings][] = [
		['one brand', settings],
		[
			'two brands and edits',
			{ ...settings, brand2: parseColor('#8b5cf6')!, status: { danger: parseColor('#b91c1c')! } },
		],
		['own neutral hue', { ...settings, brand: parseColor('#ea580c')!, neutralTint: 0.8, neutralHue: 257 }],
	]

	describe.each(systems)('%s', (_, input) => {
		const system = generateSystem(input)
		const tokens = resolveTokens(system, { primary: { dark: 'brand.300' } })
		const model = buildExportModel(system, tokens)
		const exports: [string, { text: string; fileName?: string }[]][] = [
			['Tailwind + shadcn in HEX', [{ text: toTailwindCss(model, 'hex') }]],
			['CSS', [{ text: toCssVariables(model, 'hex') }]],
			['design tokens', [{ text: toDesignTokens(model) }]],
			[
				'Figma',
				[
					{ text: toFigmaTokens(model, 'light'), fileName: 'sygen-light.tokens.json' },
					{ text: toFigmaTokens(model, 'dark'), fileName: 'sygen-dark.tokens.json' },
				],
			],
		]

		it.each(exports)('comes back unchanged from %s', (_, sources) => {
			const { result } = readImport(sources)
			expect(toHex(result!.system.brand)).toBe(toHex(input.brand))
			expect(result!.system.brand2 && toHex(result!.system.brand2)).toBe(input.brand2 && toHex(input.brand2))
			expect(result!.comparisons).toHaveLength(76)
			expect(result!.comparisons.filter((entry) => entry.match !== 'same')).toEqual([])
			const imported = resolveTokens(generateSystem(result!.system), result!.system.tokens)
			for (const name of Object.keys(tokens) as (keyof typeof tokens)[]) {
				expect(imported[name].light.hex).toBe(tokens[name].light.hex)
				expect(imported[name].dark.hex).toBe(tokens[name].dark.hex)
			}
		})

		it('stays within rounding from the rounded OKLCH values of Tailwind + shadcn', () => {
			const { result } = readImport([{ text: toTailwindCss(model, 'oklch') }])
			expect(result!.comparisons).toHaveLength(76)
			const imported = resolveTokens(generateSystem(result!.system), result!.system.tokens)
			for (const name of Object.keys(tokens) as (keyof typeof tokens)[]) {
				expect(colorDifference(imported[name].light.hex, tokens[name].light.hex)).toBeLessThan(0.01)
				expect(colorDifference(imported[name].dark.hex, tokens[name].dark.hex)).toBeLessThan(0.01)
			}
		})
	})

	it('reads exported scales alone', () => {
		const system = generateSystem(settings)
		const model = buildExportModel(system, resolveTokens(system))
		const { result } = readImport([{ text: toTailwindScales(model.scales, 'hex') }])
		expect(toHex(result!.system.brand)).toBe('#1f6cb0')
		expect(result!.system.neutralHue).toBeNull()
		expect(result!.system.neutralTint).toBeCloseTo(0.3, 1)
	})
})
