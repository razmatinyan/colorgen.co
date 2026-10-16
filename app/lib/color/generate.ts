import { toGamutOklch } from './format'
import { wrapHue } from './parse'
import { between, pick, type Rng } from './random'
import type { Oklch } from './types'

export const harmonies = ['analogous', 'complementary', 'split-complementary', 'triadic', 'tetradic', 'monochromatic'] as const
export type Harmony = typeof harmonies[number]

export const paletteRoles = ['primary', 'secondary', 'accent', 'highlight', 'neutral'] as const
export type PaletteRole = typeof paletteRoles[number]

const hueOffsetsByHarmony: Record<Harmony, Record<PaletteRole, number>> = {
	'analogous': { primary: 0, secondary: 30, accent: -30, highlight: 60, neutral: 0 },
	'complementary': { primary: 0, secondary: 180, accent: 180, highlight: 0, neutral: 0 },
	'split-complementary': { primary: 0, secondary: 150, accent: 210, highlight: 0, neutral: 0 },
	'triadic': { primary: 0, secondary: 120, accent: 240, highlight: 0, neutral: 0 },
	'tetradic': { primary: 0, secondary: 90, accent: 180, highlight: 270, neutral: 0 },
	'monochromatic': { primary: 0, secondary: 0, accent: 0, highlight: 0, neutral: 0 },
}

export const roleRanges: Record<PaletteRole, { lightness: [number, number], chroma: [number, number] }> = {
	primary: { lightness: [0.48, 0.6], chroma: [0.12, 0.19] },
	secondary: { lightness: [0.6, 0.72], chroma: [0.09, 0.15] },
	accent: { lightness: [0.68, 0.79], chroma: [0.13, 0.2] },
	highlight: { lightness: [0.87, 0.94], chroma: [0.06, 0.12] },
	neutral: { lightness: [0.24, 0.32], chroma: [0.01, 0.03] },
}

const hueJitter = 8

export interface GeneratePaletteOptions {
	rng?: Rng
	harmony?: Harmony
	locked?: readonly (Oklch | null | undefined)[]
}

function anchorHueFrom(locked: GeneratePaletteOptions['locked'], offsets: Record<PaletteRole, number>, rng: Rng) {
	const index = paletteRoles.findIndex((_, roleIndex) => locked?.[roleIndex])
	if (index === -1) return between(rng, 0, 360)
	return wrapHue(locked![index]!.h - offsets[paletteRoles[index]!])
}

export function generatePalette({ rng = Math.random, harmony = pick(rng, harmonies), locked = [] }: GeneratePaletteOptions = {}): Oklch[] {
	const offsets = hueOffsetsByHarmony[harmony]
	const anchorHue = anchorHueFrom(locked, offsets, rng)
	return paletteRoles.map((role, index) => {
		const kept = locked[index]
		if (kept) return kept
		const { lightness, chroma } = roleRanges[role]
		return toGamutOklch({
			l: between(rng, ...lightness),
			c: between(rng, ...chroma),
			h: wrapHue(anchorHue + offsets[role] + between(rng, -hueJitter, hueJitter)),
		})
	})
}
