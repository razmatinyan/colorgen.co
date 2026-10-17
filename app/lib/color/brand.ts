import { toGamutOklch } from './format'
import { hueDifference, toOklch, wrapHue } from './parse'
import { statusHueRanges } from './status'
import type { ColorInput, Oklch } from './types'

const secondBrandHueOffsets = [60, -60, 150, -150, 180] as const
const statusHueMargin = 10
const unflatteringHueRange = [95, 125] as const
const achromaticChroma = 0.03
const fallbackHue = 250
const lightnessRange = [0.5, 0.7] as const
const minChroma = 0.12

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function isAvoidedHue(hue: number) {
	const [min, max] = unflatteringHueRange
	if (hue >= min && hue <= max) return true
	return (['success', 'warning', 'danger'] as const).some((kind) => {
		const [min, max] = statusHueRanges[kind]
		const center = (min + max) / 2
		return Math.abs(hueDifference(hue, center)) <= (max - min) / 2 + statusHueMargin
	})
}

export function suggestSecondBrand(brandInput: ColorInput): Oklch {
	const brand = toOklch(brandInput)
	const baseHue = brand.c < achromaticChroma ? fallbackHue : brand.h
	const candidates = secondBrandHueOffsets.map(offset => wrapHue(baseHue + offset))
	const hue = candidates.find(candidate => !isAvoidedHue(candidate)) ?? candidates[0]!
	return toGamutOklch({
		l: clamp(brand.l, ...lightnessRange),
		c: Math.max(brand.c, minChroma),
		h: hue,
	})
}
