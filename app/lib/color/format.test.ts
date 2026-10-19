import { describe, expect, it } from 'vitest'
import { formatColor, isInGamut, toGamutOklch, toHex, toHslString, toOklchString, toRgbString } from './format'
import { parseColor } from './parse'

describe('formatting', () => {
	const brand = '#1f6cb0'

	it('formats every supported format', () => {
		expect(toHex(brand)).toBe('#1f6cb0')
		expect(toRgbString(brand)).toBe('rgb(31, 108, 176)')
		expect(toHslString(brand)).toMatch(/^hsl\(208\.\d+, 70\.\d+%, 40\.\d+%\)$/)
		expect(toOklchString(brand)).toMatch(/^oklch\(\d+\.\d% 0\.\d{3} \d+\.\d\)$/)
	})

	it('dispatches through formatColor', () => {
		expect(formatColor(brand, 'hex')).toBe(toHex(brand))
		expect(formatColor(brand, 'rgb')).toBe(toRgbString(brand))
		expect(formatColor(brand, 'hsl')).toBe(toHslString(brand))
		expect(formatColor(brand, 'oklch')).toBe(toOklchString(brand))
	})

	it('round-trips hex through OKLCH', () => {
		for (const hex of ['#000000', '#ffffff', '#ff0000', '#1f6cb0', '#f4e19c', '#222933']) {
			expect(toHex(parseColor(hex)!)).toBe(hex)
		}
	})

	it('keeps colors on the edge of sRGB exact', () => {
		for (const hex of ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#0000ff']) {
			expect(toHex(parseColor(hex)!)).toBe(hex)
			expect(isInGamut(hex)).toBe(true)
		}
	})
})

describe('gamut mapping', () => {
	const outOfGamut = { l: 0.7, c: 0.4, h: 150 }

	it('detects colors outside sRGB', () => {
		expect(isInGamut(outOfGamut)).toBe(false)
		expect(isInGamut('#1f6cb0')).toBe(true)
	})

	it('maps into sRGB by reducing chroma only, keeping lightness and hue exact', () => {
		const mapped = toGamutOklch(outOfGamut)
		expect(isInGamut(mapped)).toBe(true)
		expect(mapped.c).toBeLessThan(outOfGamut.c)
		expect(mapped.l).toBeCloseTo(outOfGamut.l, 6)
		expect(mapped.h).toBeCloseTo(outOfGamut.h, 6)
	})

	it('leaves in-gamut colors unchanged', () => {
		const color = parseColor('#1f6cb0')!
		expect(toGamutOklch(color)).toBe(color)
	})

	it('never produces invalid hex for out-of-gamut input', () => {
		expect(toHex(outOfGamut)).toMatch(/^#[0-9a-f]{6}$/)
	})
})
