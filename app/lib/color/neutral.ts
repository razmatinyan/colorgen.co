import { hueDifference, toOklch, wrapHue } from './parse'
import { colorDifference } from './difference'
import { toSwatches, type ScaleStep, type ScaleSwatch } from './scale'
import type { ColorInput, Oklch } from './types'

const neutralLightness = [0.985, 0.967, 0.922, 0.87, 0.708, 0.556, 0.446, 0.372, 0.276, 0.208, 0.145] as const
const neutralChromaShare = [0.12, 0.2, 0.35, 0.55, 0.85, 1, 1, 0.95, 0.9, 0.9, 0.9] as const

export const maxNeutralChroma = 0.045
export const defaultNeutralTint = 0.3
const brandChromaCeiling = 0.6
const maxNeutralSampleChroma = 0.08
const minTintedChroma = 0.004
const brandHueTolerance = 12
const hueSearchRadius = 4
const tintSearchRadius = 3

export function neutralChroma(brand: ColorInput, tint: number, hue: number | null = null) {
	const clampedTint = Math.min(1, Math.max(0, tint))
	const chroma = clampedTint * maxNeutralChroma
	return hue === null ? Math.min(chroma, toOklch(brand).c * brandChromaCeiling) : chroma
}

export function generateNeutralScale(
	brand: ColorInput,
	tint = defaultNeutralTint,
	hue: number | null = null,
): ScaleSwatch[] {
	const h = hue ?? toOklch(brand).h
	const chroma = neutralChroma(brand, tint, hue)
	return toSwatches(neutralLightness.map((l, index) => ({ l, c: chroma * neutralChromaShare[index]!, h })))
}

function chromaShareAt(lightness: number) {
	const darkerIndex = neutralLightness.findIndex((stepLightness) => stepLightness <= lightness)
	if (darkerIndex <= 0) return neutralChromaShare[darkerIndex === -1 ? neutralChromaShare.length - 1 : 0]!
	const lighter = neutralLightness[darkerIndex - 1]!
	const darker = neutralLightness[darkerIndex]!
	const progress = (lighter - lightness) / (lighter - darker)
	const lighterShare = neutralChromaShare[darkerIndex - 1]!
	return lighterShare + (neutralChromaShare[darkerIndex]! - lighterShare) * progress
}

export interface NeutralEstimate {
	tint: number
	hue: number | null
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

function fitError(samples: readonly Oklch[], shares: readonly number[], chroma: number, hue: number) {
	return samples.reduce((sum, color, index) => {
		const predicted = chroma * shares[index]!
		const da = color.c * Math.cos(toRadians(color.h)) - predicted * Math.cos(toRadians(hue))
		const db = color.c * Math.sin(toRadians(color.h)) - predicted * Math.sin(toRadians(hue))
		return sum + da ** 2 + db ** 2
	}, 0)
}

const offsets = (radius: number) => Array.from({ length: radius * 2 + 1 }, (_, index) => index - radius)

export function estimateNeutral(grays: readonly Oklch[], brand: ColorInput): NeutralEstimate | null {
	const samples = grays.filter((color) => color.c <= maxNeutralSampleChroma && color.l > 0.05 && color.l < 0.995)
	if (!samples.length) return null
	const shares = samples.map((color) => chromaShareAt(color.l))
	const fullChroma =
		samples.reduce((sum, color, index) => sum + color.c * shares[index]!, 0) /
		shares.reduce((sum, share) => sum + share ** 2, 0)
	const tinted = samples.filter((color) => color.c >= minTintedChroma)
	if (fullChroma < minTintedChroma || !tinted.length) return { tint: 0, hue: null }

	const x = tinted.reduce((sum, color) => sum + color.c * Math.cos(toRadians(color.h)), 0)
	const y = tinted.reduce((sum, color) => sum + color.c * Math.sin(toRadians(color.h)), 0)
	const roughHue = wrapHue((Math.atan2(y, x) * 180) / Math.PI)
	const brandColor = toOklch(brand)
	const followsBrand =
		Math.abs(hueDifference(roughHue, brandColor.h)) <= brandHueTolerance &&
		fullChroma <= brandColor.c * brandChromaCeiling + minTintedChroma

	const roughTint = Math.round(Math.min(1, fullChroma / maxNeutralChroma) * 100)
	const hues = followsBrand ? [null] : offsets(hueSearchRadius).map((offset) => wrapHue(Math.round(roughHue) + offset))
	let best: NeutralEstimate & { error: number } = { tint: roughTint, hue: hues[0]!, error: Infinity }
	for (const hue of hues) {
		for (const offset of offsets(tintSearchRadius)) {
			const tint = Math.min(100, Math.max(0, roughTint + offset))
			const error = fitError(samples, shares, neutralChroma(brandColor, tint / 100, hue), hue ?? brandColor.h)
			if (error < best.error) best = { tint, hue, error }
		}
	}
	return { tint: best.tint / 100, hue: best.hue }
}

export function fitNeutralScale(steps: Partial<Record<ScaleStep, Oklch>>, brand: ColorInput): NeutralEstimate | null {
	const estimate = estimateNeutral(Object.values(steps), brand)
	if (!estimate) return null
	const roughTint = Math.round(estimate.tint * 100)
	const hues =
		estimate.hue === null ? [null] : offsets(hueSearchRadius).map((offset) => wrapHue(estimate.hue! + offset))
	let best = { ...estimate, error: Infinity }
	for (const hue of hues) {
		for (const offset of offsets(tintSearchRadius)) {
			const tint = Math.min(100, Math.max(0, roughTint + offset)) / 100
			const error = generateNeutralScale(brand, tint, hue).reduce((sum, swatch) => {
				const imported = steps[swatch.step]
				return imported ? sum + colorDifference(swatch.hex, imported) : sum
			}, 0)
			if (error < best.error - 1e-9) best = { tint, hue, error }
		}
	}
	return { tint: best.tint, hue: best.hue }
}
