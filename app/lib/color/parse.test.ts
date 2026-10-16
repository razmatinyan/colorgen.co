import { describe, expect, it } from 'vitest'
import { hueDifference, normalize, parseColor, toOklch, wrapHue } from './parse'
import { toHex } from './format'

describe('parseColor', () => {
	it.each([
		['#1f6cb0', '#1f6cb0'],
		['1f6cb0', '#1f6cb0'],
		['#F00', '#ff0000'],
		['f00', '#ff0000'],
		['rgb(255 0 0)', '#ff0000'],
		['rgb(0, 128, 255)', '#0080ff'],
		['hsl(120 100% 50%)', '#00ff00'],
		['rebeccapurple', '#663399'],
		['  white  ', '#ffffff'],
		['oklch(62.8% 0.2577 29.23)', '#ff0000'],
	])('parses %s', (input, hex) => {
		const color = parseColor(input)
		expect(color).not.toBeNull()
		expect(toHex(color!)).toBe(hex)
	})

	it.each(['', '   ', 'not-a-color', '#12', '#ggg', 'rgb(1,2)', '12345'])('rejects %j', (input) => {
		expect(parseColor(input)).toBeNull()
	})

	it('gives greys a hue of 0 and near-zero chroma', () => {
		const grey = parseColor('#808080')!
		expect(grey.h).toBe(0)
		expect(grey.c).toBeLessThan(1e-4)
	})

	it('returns OKLCH channels in range', () => {
		const color = parseColor('#1f6cb0')!
		expect(color.l).toBeGreaterThan(0)
		expect(color.l).toBeLessThan(1)
		expect(color.h).toBeGreaterThanOrEqual(0)
		expect(color.h).toBeLessThan(360)
	})
})

describe('toOklch', () => {
	it('passes OKLCH objects through untouched', () => {
		const color = { l: 0.5, c: 0.1, h: 200 }
		expect(toOklch(color)).toBe(color)
	})

	it('throws on invalid strings', () => {
		expect(() => toOklch('nope')).toThrow('Invalid color')
	})
})

describe('normalize and wrapHue', () => {
	it('clamps lightness and chroma', () => {
		expect(normalize({ l: 1.4, c: -0.2, h: 10 })).toEqual({ l: 1, c: 0, h: 0 })
	})

	it.each([[370, 10], [-30, 330], [360, 0], [0, 0]])('wraps %d to %d', (input, expected) => {
		expect(wrapHue(input)).toBe(expected)
	})
})

describe('hueDifference', () => {
	it.each([
		[10, 30, 20],
		[30, 10, -20],
		[350, 10, 20],
		[10, 350, -20],
		[27, 250, -137],
		[250, 27, 137],
		[0, 0, 0],
		[720, 0, 0],
	])('from %d to %d is %d', (from, to, difference) => {
		expect(hueDifference(from, to)).toBeCloseTo(difference)
	})
})
