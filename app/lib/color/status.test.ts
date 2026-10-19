import { describe, expect, it } from 'vitest'
import { isInGamut } from './format'
import { hueDifference } from './parse'
import {
	harmonizeHue,
	isStatusKind,
	statusHueRanges,
	statusKinds,
	suggestStatusColor,
	suggestStatusColors,
} from './status'

const brands = [
	'#1f6cb0',
	'#f68443',
	'#e11d48',
	'#16a34a',
	'#facc15',
	'#7c3aed',
	'#0891b2',
	'#808080',
	'#000000',
	'#ffffff',
	'#00ff00',
]

describe('harmonizeHue', () => {
	it('moves halfway toward a close hue', () => {
		expect(harmonizeHue(150, 160)).toBeCloseTo(155)
	})

	it('moves at most the maximum shift', () => {
		expect(harmonizeHue(150, 250)).toBeCloseTo(160)
		expect(harmonizeHue(150, 250, 5)).toBeCloseTo(155)
	})

	it('takes the short way around the hue circle', () => {
		expect(harmonizeHue(5, 345)).toBeCloseTo(355)
		expect(harmonizeHue(355, 15)).toBeCloseTo(5)
	})

	it('leaves the hue alone when both are equal', () => {
		expect(harmonizeHue(72, 72)).toBe(72)
	})
})

describe('suggestStatusColor', () => {
	it.each(brands)('keeps every status recognizable and in sRGB for %s', (brand) => {
		for (const kind of statusKinds) {
			const color = suggestStatusColor(kind, brand)
			const [minHue, maxHue] = statusHueRanges[kind]
			expect(color.h).toBeGreaterThanOrEqual(minHue)
			expect(color.h).toBeLessThanOrEqual(maxHue)
			expect(color.c).toBeGreaterThan(0.1)
			expect(isInGamut(color)).toBe(true)
		}
	})

	it('leans toward the brand hue', () => {
		const neutral = suggestStatusColor('success', '#808080')
		const leaning = suggestStatusColor('success', '#0891b2')
		expect(Math.abs(hueDifference(leaning.h, 215))).toBeLessThan(Math.abs(hueDifference(neutral.h, 215)))
	})

	it('is more muted for a muted brand', () => {
		expect(suggestStatusColor('danger', '#64748b').c).toBeLessThan(suggestStatusColor('danger', '#e11d48').c)
	})

	it('is deterministic', () => {
		expect(suggestStatusColor('warning', '#1f6cb0')).toEqual(suggestStatusColor('warning', '#1f6cb0'))
	})
})

describe('suggestStatusColors', () => {
	it('returns one color per status', () => {
		expect(Object.keys(suggestStatusColors('#1f6cb0'))).toEqual([...statusKinds])
	})
})

describe('isStatusKind', () => {
	it('accepts status names only', () => {
		expect(isStatusKind('danger')).toBe(true)
		expect(isStatusKind('brand')).toBe(false)
		expect(isStatusKind('')).toBe(false)
	})
})
