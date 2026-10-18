import { describe, expect, it } from 'vitest'
import { toHex } from './format'
import { fromHsv, hsvToHex, pureHue, toHsv } from './picker'

describe('toHsv / fromHsv', () => {
	it.each(['#1f6cb0', '#f68443', '#00ff00', '#663399', '#ffffff', '#000000', '#808080'])('round-trips %s', (hex) => {
		expect(toHex(fromHsv(toHsv(hex)))).toBe(hex)
	})

	it('matches known HSV values', () => {
		const red = toHsv('#ff0000')
		expect(red.h).toBeCloseTo(0, 3)
		expect(red.s).toBeCloseTo(1, 3)
		expect(red.v).toBeCloseTo(1, 3)
		expect(toHex(fromHsv({ h: 120, s: 1, v: 1 }))).toBe('#00ff00')
		expect(toHex(fromHsv({ h: 240, s: 0.5, v: 0.5 }))).toBe('#404080')
	})

	it('keeps the previous hue and saturation where grays and black have none', () => {
		const previous = { h: 210, s: 0.6, v: 0.7 }
		expect(toHsv('#808080', previous)).toMatchObject({ h: 210, s: 0 })
		expect(toHsv('#000000', previous)).toMatchObject({ h: 210, s: 0.6, v: 0 })
		expect(toHsv('#ffffff').h).toBe(0)
	})

	it('maps colors outside sRGB to the closest one first', () => {
		const hsv = toHsv({ l: 0.7, c: 0.3, h: 150 })
		for (const channel of [hsv.s, hsv.v]) {
			expect(channel).toBeGreaterThanOrEqual(0)
			expect(channel).toBeLessThanOrEqual(1)
		}
	})

	it('clamps and wraps out-of-range input', () => {
		expect(toHex(fromHsv({ h: 480, s: 2, v: 2 }))).toBe(toHex(fromHsv({ h: 120, s: 1, v: 1 })))
		expect(toHex(fromHsv({ h: -120, s: -1, v: 0.5 }))).toBe('#808080')
	})
})

describe('pureHue', () => {
	it.each([
		[0, '#ff0000'],
		[60, '#ffff00'],
		[180, '#00ffff'],
		[300, '#ff00ff'],
	] as const)('hue %d is %s', (h, hex) => {
		expect(pureHue(h)).toBe(hex)
	})
})

describe('hsvToHex', () => {
	it('gives exact screen colors', () => {
		expect(hsvToHex({ h: 180, s: 1, v: 1 })).toBe('#00ffff')
		expect(hsvToHex({ h: 0, s: 0, v: 0.5 })).toBe('#808080')
	})
})
