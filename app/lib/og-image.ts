import {
	checkContrast,
	convertColor,
	defaultNeutralTint,
	describeColor,
	generateSystem,
	isGradientSpace,
	maxGradientStops,
	minGradientStops,
	nearestStepIndex,
	parseColor,
	readableTextColor,
	scaleHexes,
	systemScales,
	toHex,
	wcagLevel,
	type GradientSpace,
	type Oklch,
} from './color'
import { scaleLabel, scaleNameOf, systemScaleNames } from './scale-names'
import { toFallbackGradient } from './export'
import { defaultGradientOptions, isGradientType, type GradientType } from './gradient-url'
import { parseColorsParam } from './palette-url'

export const ogImageKinds = [
	'home',
	'builder',
	'palette',
	'scale',
	'contrast',
	'convert',
	'color',
	'gradient',
	'image',
] as const
export type OgImageKind = (typeof ogImageKinds)[number]

export interface OgImageProps {
	kind?: string
	colors?: string
	tint?: number | string
	hue?: number | string
	type?: string
	angle?: number | string
	space?: string
}

export interface OgScaleRow {
	label: string
	hexes: string[]
	anchorIndex: number | null
}

export interface OgNamedColor {
	hex: string
	name: string
}

export interface OgColorValue {
	label: string
	value: string
}

export type OgVisual =
	| { type: 'scales'; rows: OgScaleRow[] }
	| { type: 'colors'; colors: OgNamedColor[] }
	| { type: 'contrast'; text: string; background: string; ratio: string; level: string; lc: string }
	| { type: 'color'; hex: string; name: string; foreground: string; values: OgColorValue[]; shades: string[] }
	| { type: 'gradient'; background: string; stops: string[] }

export interface OgImageModel {
	kind: OgImageKind
	label: string
	title: string
	visual: OgVisual
}

export const ogImageHomeBrand = '#2f5bea'
export const maxImageScaleRows = 6
export const ogImageSampleColors = ['#1d1b3a', '#4b2f6b', '#c2477a', '#f2785c', '#fbbf6e', '#fde7c4'] as const

const colorLimits: Record<Exclude<OgImageKind, 'image'>, readonly [number, number]> = {
	home: [1, 1],
	builder: [1, Number.POSITIVE_INFINITY],
	palette: [1, 6],
	scale: [1, Number.POSITIVE_INFINITY],
	contrast: [2, 2],
	convert: [1, 1],
	color: [1, 1],
	gradient: [minGradientStops, maxGradientStops],
}

const labels: Record<OgImageKind, string> = {
	home: 'Design system colors',
	builder: 'Design system builder',
	palette: 'Palette generator',
	scale: 'Shade scale generator',
	contrast: 'Contrast checker',
	convert: 'Color converter',
	color: 'Shades, palettes and contrast',
	gradient: 'Gradient generator',
	image: 'Image color extractor',
}

const shownValueIds = ['hex', 'rgb', 'hsl', 'oklch'] as const

function isOgImageKind(value: string | undefined): value is OgImageKind {
	return ogImageKinds.includes(value as OgImageKind)
}

function displayHex(color: Oklch) {
	return toHex(color).toUpperCase()
}

function listHexes(colors: readonly Oklch[]) {
	const hexes = colors.map(displayHex)
	if (hexes.length <= 2) return hexes.join(' and ')
	return `${hexes[0]} and ${hexes.length - 1} more`
}

function toInteger(value: number | string | undefined) {
	const number = typeof value === 'string' ? Number(value) : value
	return typeof number === 'number' && Number.isInteger(number) ? number : null
}

function parseTint(value: number | string | undefined) {
	const tint = toInteger(value)
	return tint !== null && tint >= 0 && tint <= 100 ? tint / 100 : defaultNeutralTint
}

function parseHue(value: number | string | undefined) {
	const hue = toInteger(value)
	return hue !== null && hue >= 0 && hue < 360 ? hue : null
}

function parseGradient({ type, angle, space }: OgImageProps) {
	const parsedAngle = toInteger(angle)
	return {
		type: (type && isGradientType(type) ? type : defaultGradientOptions.type) as GradientType,
		angle: parsedAngle !== null && parsedAngle >= 0 && parsedAngle < 360 ? parsedAngle : defaultGradientOptions.angle,
		space: (space && isGradientSpace(space) ? space : defaultGradientOptions.space) as GradientSpace,
	}
}

function scaleRow(label: string, color: Oklch): OgScaleRow {
	return { label, hexes: scaleHexes(color), anchorIndex: nearestStepIndex(color.l) }
}

function systemRows(brand: Oklch, extras: Oklch[], neutralTint: number, neutralHue: number | null): OgScaleRow[] {
	const system = generateSystem({ brand, extras, neutralTint, neutralHue, status: {} })
	const names = systemScaleNames(system)
	return systemScales(system).map((scale) => ({
		label: scaleLabel(scaleNameOf(names, scale.id)),
		hexes: scale.swatches.map((swatch) => swatch.hex),
		anchorIndex: scale.anchorStep === null ? null : scale.swatches.findIndex((s) => s.step === scale.anchorStep),
	}))
}

function namedColors(colors: readonly Oklch[]): OgNamedColor[] {
	return colors.map((color) => ({ hex: displayHex(color), name: describeColor(color) }))
}

function colorVisual(color: Oklch): OgVisual {
	const conversion = convertColor(color)
	return {
		type: 'color',
		hex: displayHex(color),
		name: describeColor(color),
		foreground: readableTextColor(color),
		values: shownValueIds.map((id) => {
			const value = conversion.values.find((entry) => entry.id === id)!
			return { label: value.label, value: value.value }
		}),
		shades: scaleHexes(color),
	}
}

function buildForColors(kind: Exclude<OgImageKind, 'image'>, colors: Oklch[], props: OgImageProps): OgImageModel {
	const label = labels[kind]
	const first = colors[0]!
	switch (kind) {
		case 'home':
			return {
				kind,
				label,
				title: 'Turn your brand color into a complete design system',
				visual: { type: 'scales', rows: systemRows(first, [], defaultNeutralTint, null) },
			}
		case 'builder':
			return {
				kind,
				label,
				title: `Design system for ${listHexes(colors)}`,
				visual: {
					type: 'scales',
					rows: systemRows(first, colors.slice(1), parseTint(props.tint), parseHue(props.hue)),
				},
			}
		case 'palette':
			return {
				kind,
				label,
				title: `Palette built around ${displayHex(first)}`,
				visual: { type: 'colors', colors: namedColors(colors) },
			}
		case 'scale':
			return {
				kind,
				label,
				title: colors.length === 1 ? `${displayHex(first)} shades, 50 to 950` : `Color scales for ${listHexes(colors)}`,
				visual: {
					type: 'scales',
					rows: colors.slice(0, maxImageScaleRows).map((color) => scaleRow(displayHex(color), color)),
				},
			}
		case 'contrast': {
			const [text, background] = colors as [Oklch, Oklch]
			const check = checkContrast(text, background)
			return {
				kind,
				label,
				title: `${displayHex(text)} on ${displayHex(background)}`,
				visual: {
					type: 'contrast',
					text: toHex(text),
					background: toHex(background),
					ratio: `${check.ratio.toFixed(2)}:1`,
					level: wcagLevel(check.ratio),
					lc: `Lc ${Math.round(Math.abs(check.lc))}`,
				},
			}
		}
		case 'convert':
			return { kind, label, title: `${displayHex(first)} in every color format`, visual: colorVisual(first) }
		case 'color':
			return { kind, label, title: `${displayHex(first)} color`, visual: colorVisual(first) }
		case 'gradient': {
			const options = parseGradient(props)
			return {
				kind,
				label,
				title: `Gradient from ${displayHex(first)} to ${displayHex(colors.at(-1)!)}`,
				visual: {
					type: 'gradient',
					background: toFallbackGradient({ stops: colors, ...options }),
					stops: colors.map(displayHex),
				},
			}
		}
	}
}

export function buildOgImage(props: OgImageProps): OgImageModel {
	const kind = isOgImageKind(props.kind) ? props.kind : 'home'
	if (kind === 'image') {
		const colors = ogImageSampleColors.map((hex) => parseColor(hex)!)
		return {
			kind,
			label: labels.image,
			title: 'Pull a color palette from any image',
			visual: { type: 'colors', colors: namedColors(colors) },
		}
	}

	const colors = parseColorsParam(props.colors)
	const [min, max] = colorLimits[kind]
	if (!colors || colors.length < min || colors.length > max) {
		return buildForColors('home', [parseColor(ogImageHomeBrand)!], {})
	}
	return buildForColors(kind, colors, props)
}
