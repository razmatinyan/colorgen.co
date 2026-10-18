import { clampChroma, converter, formatHex, formatHsl, formatRgb } from 'culori'
import { normalize, toOklch } from './parse'
import type { ColorFormat, ColorInput, Oklch } from './types'

const toOklchColor = converter('oklch')
const toRgbColor = converter('rgb')
const gamutTolerance = 1e-5

const mapToSrgb = (color: ReturnType<typeof culori>) => clampChroma(color, 'oklch', 'rgb')

const culori = ({ l, c, h }: Oklch) => ({ mode: 'oklch' as const, l, c, h })

export function isInGamut(input: ColorInput) {
	const { r, g, b } = toRgbColor(culori(toOklch(input)))
	return [r, g, b].every((channel) => channel >= -gamutTolerance && channel <= 1 + gamutTolerance)
}

export function toGamutOklch(input: ColorInput): Oklch {
	const color = toOklch(input)
	if (isInGamut(color)) return color
	const { l, c, h } = toOklchColor(mapToSrgb(culori(color)))
	return normalize({ l, c, h: h ?? color.h })
}

export function toHex(input: ColorInput) {
	return formatHex(mapToSrgb(culori(toOklch(input))))
}

export function toRgbString(input: ColorInput) {
	return formatRgb(mapToSrgb(culori(toOklch(input))))
}

export function toHslString(input: ColorInput) {
	return formatHsl(mapToSrgb(culori(toOklch(input))))
}

export function toOklchString(input: ColorInput) {
	const { l, c, h } = toGamutOklch(input)
	return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`
}

export function formatColor(input: ColorInput, format: ColorFormat) {
	switch (format) {
		case 'hex':
			return toHex(input)
		case 'rgb':
			return toRgbString(input)
		case 'hsl':
			return toHslString(input)
		case 'oklch':
			return toOklchString(input)
	}
}
