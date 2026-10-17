import { describe, expect, it } from 'vitest'
import { apcaUsage, checkContrast, findContrastFix, wcagCriteria } from './contrast-check'
import { wcagRatio } from './contrast'
import { isInGamut, toHex } from './format'
import { hueDifference, parseColor } from './parse'

describe('checkContrast', () => {
	it('checks every WCAG criterion', () => {
		const check = checkContrast('#777777', '#ffffff')
		expect(check.ratio).toBeCloseTo(4.48, 2)
		const passing = Object.fromEntries(check.criteria.map(criterion => [criterion.id, criterion.passes]))
		expect(passing).toEqual({ 'body-aa': false, 'large-aa': true, 'ui-aa': true, 'body-aaa': false, 'large-aaa': false })
	})

	it('reports APCA with polarity and a usage', () => {
		const darkOnLight = checkContrast('#000000', '#ffffff')
		const lightOnDark = checkContrast('#ffffff', '#000000')
		expect(darkOnLight.lc).toBeGreaterThan(100)
		expect(lightOnDark.lc).toBeLessThan(-100)
		expect(darkOnLight.usage.id).toBe('fluent')
		expect(checkContrast('#ffffff', '#ffffff').usage.id).toBe('invisible')
	})

	it('lists criteria from AA to AAA', () => {
		expect(wcagCriteria.map(criterion => criterion.level)).toEqual(['AA', 'AA', 'AA', 'AAA', 'AAA'])
	})
})

describe('apcaUsage', () => {
	it.each([[106, 'fluent'], [-80, 'body'], [60, 'content'], [59.9, 'large'], [30, 'spot'], [15, 'non-text'], [3, 'invisible']] as const)('Lc %d is %s', (lc, id) => {
		expect(apcaUsage(lc).id).toBe(id)
	})
})

describe('findContrastFix', () => {
	const cases = [
		['#7aa6d8', '#ffffff', 4.5],
		['#7aa6d8', '#ffffff', 7],
		['#1f6cb0', '#0b1020', 4.5],
		['#f68443', '#ffffff', 3],
		['#808080', '#808080', 4.5],
		['#ff0000', '#000000', 7],
	] as const

	it.each(cases)('makes %s pass on %s at %d:1, inside sRGB', (color, against, minRatio) => {
		const fix = findContrastFix(color, against, minRatio)!
		expect(fix).not.toBeNull()
		expect(wcagRatio(fix.hex, against)).toBeGreaterThanOrEqual(minRatio)
		expect(fix.ratio).toBeGreaterThanOrEqual(minRatio)
		expect(isInGamut(fix.color)).toBe(true)
		expect(fix.hex).toMatch(/^#[0-9a-f]{6}$/)
	})

	it('keeps the hue of a colored input', () => {
		const fix = findContrastFix('#7aa6d8', '#ffffff', 4.5)!
		expect(Math.abs(hueDifference(fix.color.h, parseColor('#7aa6d8')!.h))).toBeLessThan(3)
	})

	it('changes lightness as little as needed', () => {
		const fix = findContrastFix('#7aa6d8', '#ffffff', 4.5)!
		expect(fix.ratio).toBeLessThan(4.7)
	})

	it('returns a passing color unchanged', () => {
		expect(findContrastFix('#000000', '#ffffff', 4.5)!.hex).toBe('#000000')
		expect(toHex(findContrastFix('#1f6cb0', '#ffffff', 4.5)!.color)).toBe('#1f6cb0')
	})

	it('returns null when no lightness can reach the ratio', () => {
		expect(findContrastFix('#808080', '#767676', 7)).toBeNull()
	})
})
