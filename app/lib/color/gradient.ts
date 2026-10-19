import { converter } from 'culori'
import { toGamutOklch } from './format'
import { flatteringHue, flatteringLightness } from './generate'
import { hueDifference, normalize, wrapHue } from './parse'
import type { ColorInput, Oklch } from './types'

export const gradientSpaces = ['oklch', 'oklab', 'srgb'] as const
export type GradientSpace = (typeof gradientSpaces)[number]

export const minGradientStops = 2
export const maxGradientStops = 5
export const minGradientSteps = 2
export const maxGradientSteps = 12

const huelessChroma = 0.02
const toOklab = converter('oklab')
const toRgb = converter('rgb')
const toOklchColor = converter('oklch')

const lerp = (from: number, to: number, t: number) => from + (to - from) * t
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const culori = ({ l, c, h }: Oklch) => ({ mode: 'oklch' as const, l, c, h })

function fromCulori(color: { l?: number; c?: number; h?: number }, fallbackHue: number): Oklch {
	return normalize({ l: color.l ?? 0, c: color.c ?? 0, h: color.h ?? fallbackHue })
}

function mixInOklch(a: Oklch, b: Oklch, t: number): Oklch {
	const fromHue = a.c < huelessChroma ? b.h : a.h
	const toHue = b.c < huelessChroma ? a.h : b.h
	return { l: lerp(a.l, b.l, t), c: lerp(a.c, b.c, t), h: wrapHue(fromHue + hueDifference(fromHue, toHue) * t) }
}

function mixInOklab(a: Oklch, b: Oklch, t: number): Oklch {
	const from = toOklab(culori(a))
	const to = toOklab(culori(b))
	const mixed = toOklchColor({
		mode: 'oklab',
		l: lerp(from.l, to.l, t),
		a: lerp(from.a, to.a, t),
		b: lerp(from.b, to.b, t),
	})
	return fromCulori(mixed, t < 0.5 ? a.h : b.h)
}

function mixInSrgb(a: Oklch, b: Oklch, t: number): Oklch {
	const from = toRgb(culori(a))
	const to = toRgb(culori(b))
	const mixed = toOklchColor({
		mode: 'rgb',
		r: lerp(from.r, to.r, t),
		g: lerp(from.g, to.g, t),
		b: lerp(from.b, to.b, t),
	})
	return fromCulori(mixed, t < 0.5 ? a.h : b.h)
}

const mixers: Record<GradientSpace, (a: Oklch, b: Oklch, t: number) => Oklch> = {
	oklch: mixInOklch,
	oklab: mixInOklab,
	srgb: mixInSrgb,
}

export function mixColors(aInput: ColorInput, bInput: ColorInput, t: number, space: GradientSpace): Oklch {
	const a = toGamutOklch(aInput)
	const b = toGamutOklch(bInput)
	const amount = clamp(t, 0, 1)
	if (amount === 0) return a
	if (amount === 1) return b
	return normalize(toGamutOklch(mixers[space](a, b, amount)))
}

export function gradientColorAt(stops: readonly ColorInput[], t: number, space: GradientSpace): Oklch {
	if (stops.length === 0) throw new Error('A gradient needs at least one color')
	if (stops.length === 1) return toGamutOklch(stops[0]!)
	const segments = stops.length - 1
	const position = clamp(t, 0, 1) * segments
	const index = Math.min(Math.floor(position), segments - 1)
	return mixColors(stops[index]!, stops[index + 1]!, position - index, space)
}

export function sampleGradient(stops: readonly ColorInput[], count: number, space: GradientSpace): Oklch[] {
	const total = Math.max(minGradientSteps, Math.round(count))
	return Array.from({ length: total }, (_, index) => gradientColorAt(stops, index / (total - 1), space))
}

export interface GradientSuggestion {
	id: string
	label: string
	stops: Oklch[]
}

function flattering(color: Oklch): Oklch {
	const h = flatteringHue(color.h)
	return normalize(toGamutOklch({ l: flatteringLightness(color.l, h), c: color.c, h }))
}

export function suggestGradients(baseInput: ColorInput): GradientSuggestion[] {
	const base = toGamutOklch(baseInput)
	const lighter = normalize(toGamutOklch({ l: Math.min(0.96, base.l + 0.3), c: base.c * 0.45, h: base.h }))
	const deeper = normalize(toGamutOklch({ l: Math.max(0.2, base.l - 0.28), c: base.c * 0.9, h: wrapHue(base.h + 12) }))
	const suggestions: GradientSuggestion[] = [
		{ id: 'soft', label: 'Soft fade', stops: [lighter, base] },
		{ id: 'deep', label: 'Deep fade', stops: [base, deeper] },
	]
	if (base.c < huelessChroma) return suggestions
	const shifted = (offset: number) => flattering({ ...base, h: wrapHue(base.h + offset) })
	return [
		...suggestions,
		{ id: 'neighbor-after', label: 'Next hue', stops: [base, shifted(45)] },
		{ id: 'neighbor-before', label: 'Previous hue', stops: [shifted(-45), base] },
		{ id: 'neighbors', label: 'Three neighbors', stops: [shifted(-40), base, shifted(40)] },
		{ id: 'opposite', label: 'Opposite hue', stops: [base, shifted(180)] },
	]
}

export function suggestNextStop(stops: readonly ColorInput[]): Oklch {
	const last = toGamutOklch(stops.at(-1) ?? { l: 0.6, c: 0.15, h: 250 })
	if (last.c < huelessChroma)
		return normalize(toGamutOklch({ ...last, l: last.l > 0.5 ? last.l - 0.25 : last.l + 0.25 }))
	return flattering({ ...last, h: wrapHue(last.h + 40) })
}

export function isGradientSpace(value: string): value is GradientSpace {
	return (gradientSpaces as readonly string[]).includes(value)
}
