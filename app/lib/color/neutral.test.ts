import { describe, expect, it } from 'vitest'
import { isInGamut } from './format'
import { generateNeutralScale, maxNeutralChroma, neutralChroma } from './neutral'
import { parseColor } from './parse'
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
})

describe('generateNeutralScale', () => {
	const inputs = ['#1f6cb0', '#f68443', '#00ff00', '#808080', '#ffffff', '#000000']

	it.each(inputs)('returns 11 steps getting strictly darker for %s', (input) => {
		const scale = generateNeutralScale(input, 0.5)
		expect(scale.map(swatch => swatch.step)).toEqual([...scaleSteps])
		const lightness = scale.map(swatch => swatch.color.l)
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
		const tinted = generateNeutralScale(brand, 0.6).filter(swatch => swatch.color.c > 0.01)
		expect(tinted.length).toBeGreaterThan(5)
		for (const swatch of tinted) expect(Math.abs(swatch.color.h - brand.h)).toBeLessThan(3)
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
