import { clampChroma, colorsNamed, converter } from 'culori'
import { isInGamut, toHex } from './format'
import { toOklch } from './parse'
import type { ColorInput, Oklch } from './types'

export const conversionFormats = [
	{ id: 'hex', label: 'HEX', gamut: 'srgb' },
	{ id: 'rgb', label: 'RGB', gamut: 'srgb' },
	{ id: 'hsl', label: 'HSL', gamut: 'srgb' },
	{ id: 'hwb', label: 'HWB', gamut: 'srgb' },
	{ id: 'oklch', label: 'OKLCH', gamut: 'any' },
	{ id: 'oklab', label: 'OKLab', gamut: 'any' },
	{ id: 'lch', label: 'LCH', gamut: 'any' },
	{ id: 'lab', label: 'Lab', gamut: 'any' },
	{ id: 'p3', label: 'Display P3', gamut: 'p3' },
] as const

export type ConversionFormat = (typeof conversionFormats)[number]
export type ConversionFormatId = ConversionFormat['id']

export interface ConvertedValue {
	id: ConversionFormatId
	label: string
	value: string
	isMapped: boolean
}

export interface ColorConversion {
	color: Oklch
	hex: string
	inSrgb: boolean
	inP3: boolean
	names: string[]
	values: ConvertedValue[]
}

const toRgb = converter('rgb')
const toHsl = converter('hsl')
const toHwb = converter('hwb')
const toOklab = converter('oklab')
const toLab = converter('lab')
const toLch = converter('lch')
const toP3 = converter('p3')
const gamutTolerance = 1e-5

const culoriOklch = ({ l, c, h }: Oklch) => ({ mode: 'oklch' as const, l, c, h })

function trim(value: number, digits: number) {
	return String(Number(value.toFixed(digits)) + 0)
}

function percent(value: number, digits: number) {
	return `${trim(value * 100, digits)}%`
}

function inUnitRange(...channels: number[]) {
	return channels.every((channel) => channel >= -gamutTolerance && channel <= 1 + gamutTolerance)
}

export function isInP3(input: ColorInput) {
	const { r, g, b } = toP3(culoriOklch(toOklch(input)))
	return inUnitRange(r, g, b)
}

export function cssColorNames(hex: string) {
	const value = Number.parseInt(hex.slice(1), 16)
	return Object.entries(colorsNamed)
		.filter(([, named]) => named === value)
		.map(([name]) => name)
		.sort()
}

function formatValue(id: ConversionFormatId, color: Oklch, hex: string, inP3: boolean) {
	const srgb = toRgb(hex)!
	switch (id) {
		case 'hex':
			return hex
		case 'rgb':
			return `rgb(${[srgb.r, srgb.g, srgb.b].map((channel) => Math.round(channel * 255)).join(' ')})`
		case 'hsl': {
			const { h, s, l } = toHsl(srgb)
			return `hsl(${trim(h ?? 0, 1)} ${percent(s, 1)} ${percent(l, 1)})`
		}
		case 'hwb': {
			const { h, w, b } = toHwb(srgb)
			return `hwb(${trim(h ?? 0, 1)} ${percent(w, 1)} ${percent(b, 1)})`
		}
		case 'oklch':
			return `oklch(${percent(color.l, 2)} ${trim(color.c, 4)} ${trim(color.h, 2)})`
		case 'oklab': {
			const { l, a, b } = toOklab(culoriOklch(color))
			return `oklab(${percent(l, 2)} ${trim(a, 4)} ${trim(b, 4)})`
		}
		case 'lch': {
			const { l, c, h } = toLch(culoriOklch(color))
			return `lch(${trim(l, 3)}% ${trim(c, 3)} ${trim(c < 1e-4 ? 0 : (h ?? 0), 3)})`
		}
		case 'lab': {
			const { l, a, b } = toLab(culoriOklch(color))
			return `lab(${trim(l, 2)}% ${trim(a, 2)} ${trim(b, 2)})`
		}
		case 'p3': {
			const { r, g, b } = toP3(inP3 ? culoriOklch(color) : clampChroma(culoriOklch(color), 'oklch', 'p3'))
			return `color(display-p3 ${[r, g, b].map((channel) => trim(Math.min(1, Math.max(0, channel)), 5)).join(' ')})`
		}
	}
}

export function convertColor(input: ColorInput): ColorConversion {
	const color = toOklch(input)
	const hex = toHex(color)
	const inSrgb = isInGamut(color)
	const inP3 = isInP3(color)
	return {
		color,
		hex,
		inSrgb,
		inP3,
		names: cssColorNames(hex),
		values: conversionFormats.map((format) => ({
			id: format.id,
			label: format.label,
			value: formatValue(format.id, color, hex, inP3),
			isMapped: (format.gamut === 'srgb' && !inSrgb) || (format.gamut === 'p3' && !inP3),
		})),
	}
}
