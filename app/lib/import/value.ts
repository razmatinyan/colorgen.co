import { converter, parse, type Color } from 'culori'
import { normalize, type Oklch } from '../color'

export interface ImportedValue {
	color: Oklch
	alpha: number
}

const toOklchColor = converter('oklch')
const toRgbColor = converter('rgb')

const number = String.raw`[+-]?(?:\d+\.?\d*|\.\d+)`
const separator = String.raw`\s*[\s,]\s*`
const alphaPart = String.raw`(?:\s*\/\s*${number}%?)?`
const bareHsl = new RegExp(`^${number}(?:deg)?${separator}${number}%${separator}${number}%${alphaPart}$`)
const bareRgb = new RegExp(`^\\d{1,3}${separator}\\d{1,3}${separator}\\d{1,3}${alphaPart}$`)
const bareOklch = new RegExp(`^(${number})(%?)\\s+(${number})\\s+${number}(?:deg)?${alphaPart}$`)

function expandBareTriplet(value: string) {
	if (bareHsl.test(value)) return `hsl(${value})`
	if (bareRgb.test(value)) return `rgb(${value})`
	const oklch = bareOklch.exec(value)
	if (oklch) {
		const lightness = Number(oklch[1])
		const isLightness = oklch[2] === '%' ? lightness <= 100 : lightness <= 1
		if (isLightness && Number(oklch[3]) <= 0.5) return `oklch(${value})`
	}
	return value
}

function fromCulori(color: Color | undefined): ImportedValue | null {
	if (!color) return null
	const alpha = color.alpha ?? 1
	if (!(alpha > 0)) return null
	const { l, c, h } = toOklchColor(color)
	if (![l, c].every(Number.isFinite)) return null
	return { color: normalize({ l, c, h: h ?? 0 }), alpha: Math.min(1, alpha) }
}

export function parseImportString(raw: string): ImportedValue | null {
	const value = raw
		.replace(/!important\s*$/i, '')
		.trim()
		.replace(/;$/, '')
		.trim()
	if (!value || /^(?:inherit|initial|unset|currentcolor|transparent|none|[0-9a-f]+)$/i.test(value)) return null
	return fromCulori(parse(expandBareTriplet(value)))
}

type Components = [number, number, number]

const colorSpaces: Record<string, (components: Components) => Color> = {
	srgb: ([r, g, b]) => ({ mode: 'rgb', r, g, b }),
	'srgb-linear': ([r, g, b]) => ({ mode: 'lrgb', r, g, b }),
	'display-p3': ([r, g, b]) => ({ mode: 'p3', r, g, b }),
	rec2020: ([r, g, b]) => ({ mode: 'rec2020', r, g, b }),
	hsl: ([h, s, l]) => ({ mode: 'hsl', h, s: s / 100, l: l / 100 }),
	oklch: ([l, c, h]) => ({ mode: 'oklch', l, c, h }),
	oklab: ([l, a, b]) => ({ mode: 'oklab', l, a, b }),
	lch: ([l, c, h]) => ({ mode: 'lch', l, c, h }),
	lab: ([l, a, b]) => ({ mode: 'lab', l, a, b }),
}

function parseColorObject(value: Record<string, unknown>): ImportedValue | null {
	const alpha = typeof value.alpha === 'number' ? value.alpha : 1
	const create = typeof value.colorSpace === 'string' ? colorSpaces[value.colorSpace] : undefined
	const components = Array.isArray(value.components)
		? value.components.map((component) => (typeof component === 'number' ? component : 0))
		: null
	if (create && components?.length === 3) return fromCulori({ ...create(components as Components), alpha })
	const parsed = typeof value.hex === 'string' ? parse(value.hex) : undefined
	return parsed ? fromCulori({ ...parsed, alpha }) : null
}

export function parseImportValue(value: unknown): ImportedValue | null {
	if (typeof value === 'string') return parseImportString(value)
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return parseColorObject(value as Record<string, unknown>)
	}
	return null
}

export function compositeOver({ color, alpha }: ImportedValue, background: Oklch): Oklch {
	if (alpha >= 1) return color
	const foreground = toRgbColor({ mode: 'oklch', ...color })
	const backdrop = toRgbColor({ mode: 'oklch', ...background })
	const mix = (top: number, bottom: number) => top * alpha + bottom * (1 - alpha)
	const { l, c, h } = toOklchColor({
		mode: 'rgb',
		r: mix(foreground.r, backdrop.r),
		g: mix(foreground.g, backdrop.g),
		b: mix(foreground.b, backdrop.b),
	})
	return normalize({ l, c, h: h ?? 0 })
}
