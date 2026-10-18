import { describe, expect, it } from 'vitest'
import { isInGamut } from './format'
import {
	flatteringHue,
	flatteringLightness,
	generatePalette,
	harmonies,
	minYellowLightness,
	muddyHueRange,
	paletteOptionCount,
	paletteRoles,
	roleRanges,
	startingColorCount,
	suggestPalettes,
	suggestStartingColors,
	yellowHueRange,
} from './generate'
import { createRng, shuffle } from './random'

const hueDistance = (a: number, b: number) => {
	const difference = Math.abs(a - b) % 360
	return Math.min(difference, 360 - difference)
}

describe('createRng', () => {
	it('is deterministic per seed and stays in [0, 1)', () => {
		const a = createRng(42)
		const b = createRng(42)
		for (let i = 0; i < 100; i++) {
			const value = a()
			expect(value).toBe(b())
			expect(value).toBeGreaterThanOrEqual(0)
			expect(value).toBeLessThan(1)
		}
	})

	it('differs between seeds', () => {
		expect(createRng(1)()).not.toBe(createRng(2)())
	})
})

describe('generatePalette', () => {
	it('returns one color per role', () => {
		expect(generatePalette({ rng: createRng(1) })).toHaveLength(paletteRoles.length)
	})

	it('is reproducible from a seed', () => {
		expect(generatePalette({ rng: createRng(7) })).toEqual(generatePalette({ rng: createRng(7) }))
	})

	it.each(harmonies)('keeps %s palettes in gamut and within role ranges', (harmony) => {
		for (let seed = 0; seed < 50; seed++) {
			const palette = generatePalette({ rng: createRng(seed), harmony })
			palette.forEach((color, index) => {
				const range = roleRanges[paletteRoles[index]!]
				const isLiftedYellow =
					paletteRoles[index] !== 'neutral' && color.h >= yellowHueRange[0] && color.h <= yellowHueRange[1]
				const maxLightness = isLiftedYellow ? Math.max(range.lightness[1], minYellowLightness) : range.lightness[1]
				expect(isInGamut(color)).toBe(true)
				expect(color.l).toBeGreaterThanOrEqual(range.lightness[0] - 0.02)
				expect(color.l).toBeLessThanOrEqual(maxLightness + 0.02)
				expect(color.c).toBeLessThanOrEqual(range.chroma[1] + 1e-6)
			})
		}
	})

	it('places complementary secondary colors opposite the primary', () => {
		for (let seed = 0; seed < 20; seed++) {
			const [primary, secondary] = generatePalette({ rng: createRng(seed), harmony: 'complementary' })
			expect(hueDistance(primary!.h, secondary!.h)).toBeGreaterThan(160)
		}
	})

	it('keeps locked colors exactly', () => {
		const locked = { l: 0.55, c: 0.15, h: 30 }
		const palette = generatePalette({ rng: createRng(3), locked: [null, locked] })
		expect(palette[1]).toBe(locked)
	})

	it('builds the harmony around a locked color', () => {
		const lockedPrimary = { l: 0.55, c: 0.15, h: 200 }
		for (let seed = 0; seed < 20; seed++) {
			const [, secondary] = generatePalette({ rng: createRng(seed), harmony: 'complementary', locked: [lockedPrimary] })
			expect(hueDistance(secondary!.h, 20)).toBeLessThanOrEqual(8.5)
		}
	})
})

describe('shuffle', () => {
	it('keeps every item and is reproducible', () => {
		const items = [1, 2, 3, 4, 5, 6]
		expect(shuffle(createRng(5), items).sort()).toEqual(items)
		expect(shuffle(createRng(5), items)).toEqual(shuffle(createRng(5), items))
		expect(items).toEqual([1, 2, 3, 4, 5, 6])
	})
})

describe('suggestPalettes', () => {
	const base = { l: 0.55, c: 0.15, h: 200 }

	it('offers one palette per harmony, each built around the base color', () => {
		const options = suggestPalettes({ base, rng: createRng(1) })
		expect(options).toHaveLength(paletteOptionCount)
		for (const option of options) {
			expect(option).toHaveLength(paletteRoles.length)
			expect(option[0]).toEqual(base)
		}
	})

	it('offers palettes that differ from each other', () => {
		const options = suggestPalettes({ base, rng: createRng(2) })
		const keys = new Set(
			options.map((option) =>
				option.map((color) => `${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)}`).join('|'),
			),
		)
		expect(keys.size).toBe(options.length)
	})

	it('keeps locked colors in every option', () => {
		const accent = { l: 0.7, c: 0.16, h: 40 }
		for (const option of suggestPalettes({ base, locked: [null, null, accent], rng: createRng(3) })) {
			expect(option[2]).toEqual(accent)
		}
	})

	it('ignores a lock on the base slot', () => {
		const other = { l: 0.3, c: 0.1, h: 10 }
		expect(suggestPalettes({ base, locked: [other], rng: createRng(4) })[0]![0]).toEqual(base)
	})

	it('is reproducible from a seed', () => {
		expect(suggestPalettes({ base, rng: createRng(9) })).toEqual(suggestPalettes({ base, rng: createRng(9) }))
	})

	it.each([
		{ l: 0, c: 0, h: 0 },
		{ l: 1, c: 0, h: 0 },
		{ l: 0.5, c: 0, h: 0 },
	])('stays in gamut for gray base %j', (gray) => {
		for (const option of suggestPalettes({ base: gray, rng: createRng(6) })) {
			option.slice(1).forEach((color) => expect(isInGamut(color)).toBe(true))
		}
	})
})

describe('suggestStartingColors', () => {
	it('offers distinct, colorful hues around the wheel', () => {
		for (let seed = 0; seed < 20; seed++) {
			const colors = suggestStartingColors(createRng(seed))
			expect(colors).toHaveLength(startingColorCount)
			colors.forEach((color) => {
				expect(isInGamut(color)).toBe(true)
				expect(color.c).toBeGreaterThan(0.08)
			})
			const hues = colors.map((color) => color.h)
			hues.forEach((hue, index) =>
				hues.slice(index + 1).forEach((other) => expect(hueDistance(hue, other)).toBeGreaterThan(15)),
			)
		}
	})

	it('is reproducible from a seed', () => {
		expect(suggestStartingColors(createRng(3))).toEqual(suggestStartingColors(createRng(3)))
	})
})

describe('flattering colors', () => {
	it('moves muddy yellow-green hues to the nearest clean edge', () => {
		expect(flatteringHue(100)).toBe(muddyHueRange[0])
		expect(flatteringHue(120)).toBe(muddyHueRange[1])
		expect(flatteringHue(60)).toBe(60)
		expect(flatteringHue(200)).toBe(200)
	})

	it('lifts yellows so they do not turn olive', () => {
		expect(flatteringLightness(0.55, 95)).toBe(minYellowLightness)
		expect(flatteringLightness(0.9, 95)).toBe(0.9)
		expect(flatteringLightness(0.55, 250)).toBe(0.55)
	})

	it('never generates muddy or dark yellow colors', () => {
		for (let seed = 0; seed < 200; seed++) {
			const palette = generatePalette({ rng: createRng(seed), locked: [{ l: 0.55, c: 0.15, h: (seed * 37) % 360 }] })
			palette.slice(1, -1).forEach((color) => {
				const [min, max] = muddyHueRange
				expect(color.h <= min + 1 || color.h >= max - 1).toBe(true)
				if (color.h >= yellowHueRange[0] && color.h <= yellowHueRange[1])
					expect(color.l).toBeGreaterThanOrEqual(minYellowLightness - 0.01)
			})
		}
	})

	it('keeps your own muddy color as it is', () => {
		const olive = { l: 0.55, c: 0.12, h: 110 }
		expect(generatePalette({ rng: createRng(1), locked: [olive] })[0]).toBe(olive)
	})
})
