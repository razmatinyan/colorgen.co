import { describe, expect, it } from 'vitest'
import { gradientColorAt, mixColors, sampleGradient, suggestGradients, suggestNextStop, isGradientSpace } from './gradient'
import { isInGamut, toHex } from './format'
import { parseColor } from './parse'

const blue = parseColor('#1f6cb0')!
const yellow = parseColor('#facc15')!
const white = parseColor('#ffffff')!
const black = parseColor('#000000')!

describe('mixColors', () => {
	it('returns the exact ends', () => {
		for (const space of ['oklch', 'oklab', 'srgb'] as const) {
			expect(toHex(mixColors(blue, yellow, 0, space))).toBe('#1f6cb0')
			expect(toHex(mixColors(blue, yellow, 1, space))).toBe('#facc15')
		}
	})

	it('mixes in sRGB like CSS does by default', () => {
		expect(toHex(mixColors('#0000ff', '#ffff00', 0.25, 'srgb'))).toBe('#4040bf')
	})

	it('keeps the middle colorful in OKLCH, unlike sRGB', () => {
		const vivid = mixColors('#0000ff', '#ffff00', 0.5, 'oklch')
		const flat = mixColors('#0000ff', '#ffff00', 0.5, 'srgb')
		expect(flat.c).toBeLessThan(0.01)
		expect(vivid.c).toBeGreaterThan(0.1)
	})

	it('takes the shorter way around the hue wheel', () => {
		const middle = mixColors({ l: 0.6, c: 0.15, h: 350 }, { l: 0.6, c: 0.15, h: 30 }, 0.5, 'oklch')
		expect(middle.h).toBeCloseTo(10, 0)
	})

	it('keeps the colored end\'s hue when mixing with white or black', () => {
		const tint = mixColors(white, blue, 0.5, 'oklch')
		expect(tint.h).toBeCloseTo(blue.h, 0)
		const shade = mixColors(blue, black, 0.5, 'oklch')
		expect(shade.h).toBeCloseTo(blue.h, 0)
	})

	it('clamps t and stays in sRGB for out-of-gamut input', () => {
		const wide = { l: 0.7, c: 0.35, h: 150 }
		expect(isInGamut(mixColors(wide, blue, 0.3, 'oklch'))).toBe(true)
		expect(toHex(mixColors(blue, yellow, -1, 'oklab'))).toBe('#1f6cb0')
		expect(toHex(mixColors(blue, yellow, 2, 'oklab'))).toBe('#facc15')
	})

	it('mixes grays as grays', () => {
		expect(mixColors(white, black, 0.5, 'oklab').c).toBeLessThan(0.001)
		expect(mixColors(white, black, 0.5, 'oklch').c).toBeLessThan(0.001)
	})
})

describe('gradientColorAt', () => {
	it('hits every stop at its even position', () => {
		const stops = [blue, white, yellow]
		expect(toHex(gradientColorAt(stops, 0, 'oklch'))).toBe('#1f6cb0')
		expect(toHex(gradientColorAt(stops, 0.5, 'oklch'))).toBe('#ffffff')
		expect(toHex(gradientColorAt(stops, 1, 'oklch'))).toBe('#facc15')
	})

	it('handles one stop and rejects none', () => {
		expect(toHex(gradientColorAt([blue], 0.4, 'oklch'))).toBe('#1f6cb0')
		expect(() => gradientColorAt([], 0.5, 'oklch')).toThrow()
	})
})

describe('sampleGradient', () => {
	it('returns the requested count including both ends', () => {
		const steps = sampleGradient([blue, yellow], 5, 'oklab')
		expect(steps).toHaveLength(5)
		expect(toHex(steps[0]!)).toBe('#1f6cb0')
		expect(toHex(steps[4]!)).toBe('#facc15')
	})

	it('never returns fewer than two colors', () => {
		expect(sampleGradient([blue, yellow], 0, 'oklch')).toHaveLength(2)
	})

	it('moves lightness evenly in OKLab', () => {
		const steps = sampleGradient([black, white], 5, 'oklab').map(color => color.l)
		const gaps = steps.slice(1).map((l, index) => l - steps[index]!)
		gaps.forEach(gap => expect(gap).toBeCloseTo(0.25, 2))
	})
})

describe('suggestGradients', () => {
	it('starts every hue suggestion from the exact color', () => {
		const suggestions = suggestGradients(blue)
		expect(suggestions.map(item => item.id)).toEqual(['soft', 'deep', 'neighbor-after', 'neighbor-before', 'neighbors', 'opposite'])
		suggestions.forEach(item => expect(item.stops.map(toHex)).toContain('#1f6cb0'))
		suggestions.forEach(item => item.stops.forEach(stop => expect(isInGamut(stop)).toBe(true)))
	})

	it('only fades grays, black and white', () => {
		for (const gray of ['#808080', '#000000', '#ffffff']) {
			expect(suggestGradients(gray).map(item => item.id)).toEqual(['soft', 'deep'])
		}
	})
})

describe('suggestNextStop', () => {
	it('moves the hue on from the last color', () => {
		const next = suggestNextStop([yellow, blue])
		expect(Math.abs(next.h - blue.h)).toBeGreaterThan(20)
		expect(isInGamut(next)).toBe(true)
	})

	it('changes lightness after a gray', () => {
		expect(suggestNextStop([white]).l).toBeLessThan(0.9)
		expect(suggestNextStop([black]).l).toBeGreaterThan(0.1)
	})
})

describe('isGradientSpace', () => {
	it('accepts only known spaces', () => {
		expect(isGradientSpace('oklch')).toBe(true)
		expect(isGradientSpace('hsl')).toBe(false)
	})
})
