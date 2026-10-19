import { describe, expect, it } from 'vitest'
import { isInGamut } from './format'
import { estimateNeutral, fitNeutralScale, generateNeutralScale, maxNeutralChroma, neutralChroma } from './neutral'
import { hueDifference, parseColor } from './parse'
import { scaleSteps } from './scale'

describe('neutralChroma', () => {
	it('grows with the tint and never exceeds the maximum', () => {
		expect(neutralChroma('#1f6cb0', 0)).toBe(0)
		expect(neutralChroma('#1f6cb0', 0.5)).toBeCloseTo(maxNeutralChroma / 2)
		expect(neutralChroma('#1f6cb0', 1)).toBeCloseTo(maxNeutralChroma)
		expect(neutralChroma('#1f6cb0', 3)).toBeCloseTo(maxNeutralChroma)
		expect(neutralChroma('#1f6cb0', -1)).toBe(0)
	})

	it('stays below the chroma of a muted brand', () => {
		const brand = parseColor('#6b7280')!
		expect(neutralChroma(brand, 1)).toBeLessThan(brand.c)
	})

	it('is zero for a grey brand', () => {
		expect(neutralChroma('#808080', 1)).toBeLessThan(1e-4)
	})

	it('ignores the brand chroma when the neutral has its own hue', () => {
		expect(neutralChroma('#808080', 1, 260)).toBeCloseTo(maxNeutralChroma)
	})
})

describe('generateNeutralScale', () => {
	const inputs = ['#1f6cb0', '#f68443', '#00ff00', '#808080', '#ffffff', '#000000']

	it.each(inputs)('returns 11 steps getting strictly darker for %s', (input) => {
		const scale = generateNeutralScale(input, 0.5)
		expect(scale.map((swatch) => swatch.step)).toEqual([...scaleSteps])
		const lightness = scale.map((swatch) => swatch.color.l)
		lightness.slice(1).forEach((l, index) => expect(l).toBeLessThan(lightness[index]!))
	})

	it.each(inputs)('stays inside sRGB and near-grey for %s', (input) => {
		for (const swatch of generateNeutralScale(input, 1)) {
			expect(isInGamut(swatch.color)).toBe(true)
			expect(swatch.color.c).toBeLessThanOrEqual(maxNeutralChroma + 1e-6)
		}
	})

	it('carries the brand hue', () => {
		const brand = parseColor('#1f6cb0')!
		const tinted = generateNeutralScale(brand, 0.6).filter((swatch) => swatch.color.c > 0.01)
		expect(tinted.length).toBeGreaterThan(5)
		for (const swatch of tinted) expect(Math.abs(swatch.color.h - brand.h)).toBeLessThan(3)
	})

	it('uses its own hue when given one', () => {
		const tinted = generateNeutralScale('#f68443', 0.8, 260).filter((swatch) => swatch.color.c > 0.01)
		expect(tinted.length).toBeGreaterThan(5)
		for (const swatch of tinted) expect(Math.abs(hueDifference(swatch.color.h, 260))).toBeLessThan(3)
	})

	it('is pure grey without tint', () => {
		for (const swatch of generateNeutralScale('#f68443', 0)) {
			expect(swatch.color.c).toBe(0)
			expect(swatch.hex.slice(1, 3)).toBe(swatch.hex.slice(3, 5))
		}
	})

	it('keeps the lightest and darkest steps usable as page backgrounds', () => {
		const scale = generateNeutralScale('#1f6cb0')
		expect(scale[0]!.color.l).toBeGreaterThan(0.97)
		expect(scale.at(-1)!.color.l).toBeLessThan(0.2)
	})
})

describe('estimateNeutral', () => {
	const slate = ['#f8fafc', '#e2e8f0', '#94a3b8', '#64748b', '#334155', '#0f172a'].map((hex) => parseColor(hex)!)
	const neutral = ['#fafafa', '#e5e5e5', '#a3a3a3', '#737373', '#404040', '#171717'].map((hex) => parseColor(hex)!)

	it('returns null without usable grays', () => {
		expect(estimateNeutral([], '#1f6cb0')).toBeNull()
		expect(estimateNeutral([parseColor('#ff0000')!], '#1f6cb0')).toBeNull()
	})

	it('finds no tint in pure grays', () => {
		expect(estimateNeutral(neutral, '#f68443')).toEqual({ tint: 0, hue: null })
	})

	it('keeps the hue of tinted grays that differ from the brand', () => {
		const estimate = estimateNeutral(slate, '#f68443')!
		expect(estimate.hue).not.toBeNull()
		expect(Math.abs(hueDifference(estimate.hue!, 257))).toBeLessThan(10)
		expect(estimate.tint).toBeGreaterThan(0.5)
	})

	it('follows the brand when the grays carry its hue', () => {
		const brand = parseColor('#1f6cb0')!
		const grays = generateNeutralScale(brand, 0.4).map((swatch) => swatch.color)
		const estimate = estimateNeutral(grays, brand)!
		expect(estimate.hue).toBeNull()
		expect(estimate.tint).toBeCloseTo(0.4, 1)
	})

	it('round-trips a neutral with its own hue', () => {
		const grays = generateNeutralScale('#f68443', 0.6, 200).map((swatch) => swatch.color)
		const estimate = estimateNeutral(grays, '#f68443')!
		expect(estimate.hue).toBe(200)
		expect(estimate.tint).toBeCloseTo(0.6, 1)
	})
})

describe('fitNeutralScale', () => {
	const hexSteps = (brand: string, tint: number, hue: number | null) =>
		Object.fromEntries(generateNeutralScale(brand, tint, hue).map((swatch) => [swatch.step, parseColor(swatch.hex)!]))

	it.each([
		['#1f6cb0', 0.3, null],
		['#ea580c', 0.8, 257],
		['#f68443', 0.6, 200],
		['#16a34a', 0.15, null],
	] as const)('recovers the settings of a %s neutral scale exactly', (brand, tint, hue) => {
		expect(fitNeutralScale(hexSteps(brand, tint, hue), brand)).toEqual({ tint, hue })
	})

	it('returns null without grays', () => {
		expect(fitNeutralScale({}, '#1f6cb0')).toBeNull()
	})
})
