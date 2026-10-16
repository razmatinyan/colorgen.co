import { describe, expect, it } from 'vitest'
import { isInGamut } from './format'
import { generatePalette, harmonies, paletteRoles, roleRanges } from './generate'
import { createRng } from './random'

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
				expect(isInGamut(color)).toBe(true)
				expect(color.l).toBeGreaterThanOrEqual(range.lightness[0] - 0.02)
				expect(color.l).toBeLessThanOrEqual(range.lightness[1] + 0.02)
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
