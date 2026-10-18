import { toGamutOklch } from './format'
import { hueDifference, toOklch, wrapHue } from './parse'
import type { ColorInput, Oklch } from './types'

export const statusKinds = ['success', 'warning', 'danger', 'info'] as const
export type StatusKind = (typeof statusKinds)[number]

export const statusHueRanges: Record<StatusKind, readonly [min: number, max: number]> = {
	success: [138, 165],
	warning: [68, 92],
	danger: [22, 29],
	info: [225, 265],
}

const statusReferences: Record<StatusKind, Oklch> = {
	success: { l: 0.63, c: 0.17, h: 150 },
	warning: { l: 0.77, c: 0.17, h: 72 },
	danger: { l: 0.58, c: 0.22, h: 27 },
	info: { l: 0.59, c: 0.16, h: 245 },
}

const maxHueShift = 10
const achromaticBrandChroma = 0.03
const referenceBrandChroma = 0.15
const chromaFactorRange = [0.75, 1.1] as const
const maxLightnessShift = 0.03

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function isStatusKind(value: string): value is StatusKind {
	return (statusKinds as readonly string[]).includes(value)
}

export function harmonizeHue(hue: number, towardHue: number, maxShift = maxHueShift) {
	const difference = hueDifference(hue, towardHue)
	return wrapHue(hue + Math.sign(difference) * Math.min(Math.abs(difference) / 2, maxShift))
}

export function suggestStatusColor(kind: StatusKind, brandInput: ColorInput): Oklch {
	const brand = toOklch(brandInput)
	const reference = statusReferences[kind]
	const [minHue, maxHue] = statusHueRanges[kind]
	const isAchromatic = brand.c < achromaticBrandChroma
	const hue = isAchromatic ? reference.h : clamp(harmonizeHue(reference.h, brand.h), minHue, maxHue)
	const chromaFactor = clamp(brand.c / referenceBrandChroma, ...chromaFactorRange)
	const lightnessShift = clamp((brand.l - reference.l) * 0.2, -maxLightnessShift, maxLightnessShift)
	return toGamutOklch({ l: reference.l + lightnessShift, c: reference.c * chromaFactor, h: hue })
}

export function suggestStatusColors(brand: ColorInput): Record<StatusKind, Oklch> {
	return Object.fromEntries(statusKinds.map((kind) => [kind, suggestStatusColor(kind, brand)])) as Record<
		StatusKind,
		Oklch
	>
}
