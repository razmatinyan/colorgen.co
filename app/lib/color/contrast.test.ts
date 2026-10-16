import { describe, expect, it } from 'vitest'
import { apcaContrast, darkText, lightText, readableTextColor, wcagLevel, wcagRatio } from './contrast'

describe('wcagRatio', () => {
	it('matches the WCAG reference values', () => {
		expect(wcagRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
		expect(wcagRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
		expect(wcagRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
	})

	it('is symmetric', () => {
		expect(wcagRatio('#1f6cb0', '#ffffff')).toBeCloseTo(wcagRatio('#ffffff', '#1f6cb0'), 10)
	})
})

describe('wcagLevel', () => {
	it.each([
		[21, 'AAA'],
		[7, 'AAA'],
		[6.99, 'AA'],
		[4.5, 'AA'],
		[4.49, 'AA Large'],
		[3, 'AA Large'],
		[2.99, 'Fail'],
		[1, 'Fail'],
	] as const)('%d is %s', (ratio, level) => {
		expect(wcagLevel(ratio)).toBe(level)
	})
})

describe('apcaContrast', () => {
	it('matches the APCA reference values', () => {
		expect(apcaContrast('#000000', '#ffffff')).toBeCloseTo(106.04, 1)
		expect(apcaContrast('#ffffff', '#000000')).toBeCloseTo(-107.88, 1)
		expect(apcaContrast('#888888', '#ffffff')).toBeCloseTo(63.06, 1)
	})

	it('is zero for identical colors', () => {
		expect(apcaContrast('#1f6cb0', '#1f6cb0')).toBe(0)
	})

	it('is polarity-aware', () => {
		expect(apcaContrast('#111111', '#eeeeee')).toBeGreaterThan(0)
		expect(apcaContrast('#eeeeee', '#111111')).toBeLessThan(0)
	})
})

describe('readableTextColor', () => {
	it.each([
		['#ffffff', darkText],
		['#f4e19c', darkText],
		['#000000', lightText],
		['#1f6cb0', lightText],
		['#222933', lightText],
	])('picks readable text on %s', (background, expected) => {
		expect(readableTextColor(background)).toBe(expected)
	})
})
