import { describe, expect, it } from 'vitest'
import { isInGamut, toHex } from './format'
import { parseColor } from './parse'
import { generateScale, nearestStepIndex, scaleHexes, scaleSteps } from './scale'

describe('generateScale', () => {
	const inputs = ['#1f6cb0', '#f68443', '#f4e19c', '#222933', '#808080', '#ffffff', '#000000', '#00ff00']

	it.each(inputs)('returns 11 labelled steps for %s', (input) => {
		expect(generateScale(input).map((swatch) => swatch.step)).toEqual([...scaleSteps])
	})

	it.each(inputs)('gets strictly darker from 50 to 950 for %s', (input) => {
		const lightness = generateScale(input).map((swatch) => swatch.color.l)
		lightness.slice(1).forEach((l, index) => expect(l).toBeLessThan(lightness[index]!))
	})

	it.each(inputs)('keeps every step inside sRGB for %s', (input) => {
		for (const swatch of generateScale(input)) {
			expect(isInGamut(swatch.color)).toBe(true)
			expect(swatch.hex).toMatch(/^#[0-9a-f]{6}$/)
		}
	})

	it('contains the exact base color at its nearest step', () => {
		const base = parseColor('#1f6cb0')!
		const scale = generateScale(base)
		expect(scale[nearestStepIndex(base.l)]!.hex).toBe('#1f6cb0')
	})

	it('keeps the hue of the base color wherever the color is visibly saturated', () => {
		const base = parseColor('#1f6cb0')!
		const visiblySaturated = generateScale(base).filter((swatch) => swatch.color.c > 0.04)
		expect(visiblySaturated.length).toBeGreaterThanOrEqual(6)
		for (const swatch of visiblySaturated) {
			expect(Math.abs(swatch.color.h - base.h)).toBeLessThan(6)
		}
	})

	it('stays grey for grey input', () => {
		for (const swatch of generateScale('#808080')) expect(swatch.color.c).toBeLessThan(0.005)
	})

	it('exposes hex values via scaleHexes', () => {
		expect(scaleHexes('#1f6cb0')).toEqual(generateScale('#1f6cb0').map((swatch) => toHex(swatch.color)))
	})
})

describe('nearestStepIndex', () => {
	it.each([
		[1, 0],
		[0.62, 5],
		[0.3, 9],
		[0, 10],
	])('maps lightness %d to step index %d', (lightness, index) => {
		expect(nearestStepIndex(lightness)).toBe(index)
	})
})
