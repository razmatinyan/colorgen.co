import { toOklch } from './parse'
import { toSwatches, type ScaleSwatch } from './scale'
import type { ColorInput } from './types'

const neutralLightness = [0.985, 0.967, 0.922, 0.87, 0.708, 0.556, 0.446, 0.372, 0.276, 0.208, 0.145] as const
const neutralChromaShare = [0.12, 0.2, 0.35, 0.55, 0.85, 1, 1, 0.95, 0.9, 0.9, 0.9] as const

export const maxNeutralChroma = 0.045
export const defaultNeutralTint = 0.3
const brandChromaCeiling = 0.6

export function neutralChroma(brand: ColorInput, tint: number) {
	const clampedTint = Math.min(1, Math.max(0, tint))
	return Math.min(clampedTint * maxNeutralChroma, toOklch(brand).c * brandChromaCeiling)
}

export function generateNeutralScale(brand: ColorInput, tint = defaultNeutralTint): ScaleSwatch[] {
	const { h } = toOklch(brand)
	const chroma = neutralChroma(brand, tint)
	return toSwatches(neutralLightness.map((l, index) => ({ l, c: chroma * neutralChromaShare[index]!, h })))
}
