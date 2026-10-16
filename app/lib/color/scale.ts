import { toGamutOklch, toHex } from './format'
import { toOklch } from './parse'
import type { ColorInput, Oklch } from './types'

export const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type ScaleStep = typeof scaleSteps[number]

const stepLightness = [0.975, 0.94, 0.885, 0.805, 0.715, 0.625, 0.535, 0.45, 0.37, 0.29, 0.21] as const

export interface ScaleSwatch {
	step: ScaleStep
	color: Oklch
	hex: string
}

function taperedChroma(baseChroma: number, lightness: number) {
	const distanceFromMidtone = Math.abs(lightness - 0.6)
	return baseChroma * Math.max(0.25, 1 - distanceFromMidtone ** 2 * 2.2)
}

export function nearestStepIndex(lightness: number) {
	let nearest = 0
	stepLightness.forEach((stepL, index) => {
		if (Math.abs(stepL - lightness) < Math.abs(stepLightness[nearest]! - lightness)) nearest = index
	})
	return nearest
}

export function generateScale(input: ColorInput): ScaleSwatch[] {
	const base = toOklch(input)
	const anchorIndex = nearestStepIndex(base.l)
	return scaleSteps.map((step, index) => {
		const lightness = stepLightness[index]!
		const target = index === anchorIndex ? base : { l: lightness, c: taperedChroma(base.c, lightness), h: base.h }
		const color = toGamutOklch(target)
		return { step, color, hex: toHex(color) }
	})
}

export function scaleHexes(input: ColorInput) {
	return generateScale(input).map(swatch => swatch.hex)
}
