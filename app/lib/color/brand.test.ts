import { describe, expect, it } from 'vitest'
import { suggestDistinctColor, suggestSecondBrand } from './brand'
import { isInGamut } from './format'
import { hueDifference, parseColor } from './parse'
import { statusHueRanges } from './status'

const brands = ['#1f6cb0', '#f68443', '#facc15', '#16a34a', '#e11d48', '#7c3aed', '#18181b', '#ffffff', '#808080']

describe('suggestSecondBrand', () => {
	it.each(brands)('stays in sRGB and is clearly colored for %s', (brand) => {
		const color = suggestSecondBrand(brand)
		expect(isInGamut(color)).toBe(true)
		expect(color.c).toBeGreaterThan(0.08)
		expect(color.l).toBeGreaterThanOrEqual(0.5)
		expect(color.l).toBeLessThanOrEqual(0.7)
	})

	it.each(brands)('avoids success, warning and danger hues for %s', (brand) => {
		const { h } = suggestSecondBrand(brand)
		for (const kind of ['success', 'warning', 'danger'] as const) {
			const [min, max] = statusHueRanges[kind]
			expect(h >= min && h <= max).toBe(false)
		}
	})

	it('differs clearly in hue from the brand', () => {
		const brand = parseColor('#1f6cb0')!
		expect(Math.abs(hueDifference(brand.h, suggestSecondBrand(brand).h))).toBeGreaterThanOrEqual(60)
	})

	it('avoids muddy yellow-greens', () => {
		const { h } = suggestSecondBrand('#f68443')
		expect(h < 95 || h > 125).toBe(true)
	})

	it('is deterministic', () => {
		expect(suggestSecondBrand('#1f6cb0')).toEqual(suggestSecondBrand('#1f6cb0'))
	})
})

describe('suggestDistinctColor', () => {
	it('picks a hue far from every existing color', () => {
		const existing = ['#1f6cb0', '#f68443']
		const color = suggestDistinctColor(existing)
		for (const input of existing) expect(Math.abs(hueDifference(color.h, parseColor(input)!.h))).toBeGreaterThan(60)
	})

	it.each([[[]], [['#808080']], [['#ffffff', '#000000']], [['#1f6cb0']]])('stays in sRGB and colored for %j', (existing) => {
		const color = suggestDistinctColor(existing)
		expect(isInGamut(color)).toBe(true)
		expect(color.c).toBeGreaterThan(0.08)
	})

	it('is deterministic', () => {
		expect(suggestDistinctColor(['#1f6cb0', '#16a34a'])).toEqual(suggestDistinctColor(['#1f6cb0', '#16a34a']))
	})
})
