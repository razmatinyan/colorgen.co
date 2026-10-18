import { describe, expect, it } from 'vitest'
import { wcagRatio } from './contrast'
import { parseColor } from './parse'
import { generateSystem, type SystemSettings } from './system'
import { isTokenRef, nearbyRefs, parseTokenRef, refHex, resolveTokens, tokenGroups, tokenNames } from './tokens'

const settings: SystemSettings = {
	brand: parseColor('#1f6cb0')!,
	brand2: parseColor('#8b5cf6')!,
	neutralTint: 0.3,
	status: {},
}
const system = generateSystem(settings)
const singleBrand = generateSystem({ ...settings, brand2: null })

describe('token names', () => {
	it('cover the shadcn set plus status colors, each once', () => {
		expect(new Set(tokenNames).size).toBe(tokenNames.length)
		for (const name of [
			'background',
			'primary-foreground',
			'ring',
			'chart-5',
			'sidebar-ring',
			'success',
			'warning-foreground',
			'info',
		]) {
			expect(tokenNames).toContain(name)
		}
		expect(tokenGroups.flatMap((group) => group.tokens)).toEqual(tokenNames)
	})
})

describe('parseTokenRef', () => {
	it('parses scale steps and white', () => {
		expect(parseTokenRef('brand.600')).toEqual({ scale: 'brand', step: 600 })
		expect(parseTokenRef('white')).toBe('white')
	})

	it.each(['', 'brand', 'brand.650', 'brand.600.1', 'accent.500', 'black', 'neutral.-50'])('rejects %j', (value) => {
		expect(parseTokenRef(value)).toBeNull()
		expect(isTokenRef(value)).toBe(false)
	})
})

describe('refHex', () => {
	it('resolves white and scale steps', () => {
		expect(refHex(system, 'white')).toBe('#ffffff')
		expect(refHex(system, 'brand.600')).toBe(system.brand.swatches[6]!.hex)
	})

	it('returns null for a removed second brand', () => {
		expect(refHex(singleBrand, 'brand2.500')).toBeNull()
	})
})

describe('resolveTokens', () => {
	const tokens = resolveTokens(system)

	it('resolves every token in both modes', () => {
		for (const name of tokenNames) {
			expect(tokens[name].light.hex).toMatch(/^#[0-9a-f]{6}$/)
			expect(tokens[name].dark.hex).toMatch(/^#[0-9a-f]{6}$/)
			expect(tokens[name].light.edited).toBe(false)
		}
	})

	it('uses the exact brand color as primary in light mode', () => {
		expect(tokens.primary.light.hex).toBe('#1f6cb0')
	})

	it('lifts primary in dark mode until it reads on the dark background', () => {
		expect(wcagRatio(tokens.primary.dark.hex, tokens.background.dark.hex)).toBeGreaterThanOrEqual(4.5)
	})

	it('picks the more readable text color for filled tokens', () => {
		const yellow = resolveTokens(generateSystem({ ...settings, brand: parseColor('#facc15')! }))
		expect(yellow['primary-foreground'].light.ref).toBe('neutral.950')
		expect(tokens['primary-foreground'].light.ref).toBe('white')
	})

	it('maps secondary to the second brand, or to a neutral without one', () => {
		expect(tokens.secondary.light.ref.startsWith('brand2.')).toBe(true)
		expect(resolveTokens(singleBrand).secondary.light.ref).toBe('neutral.100')
	})

	it('applies overrides and marks them as edited', () => {
		const edited = resolveTokens(system, { muted: { dark: 'neutral.700' } })
		expect(edited.muted.dark).toMatchObject({ ref: 'neutral.700', edited: true })
		expect(edited.muted.light.edited).toBe(false)
	})

	it('updates dependent defaults when a token is overridden', () => {
		const edited = resolveTokens(system, { primary: { light: 'brand.200' } })
		expect(edited.ring.light.ref).toBe('brand.200')
		expect(edited['sidebar-primary'].light.ref).toBe('brand.200')
		expect(edited['primary-foreground'].light.ref).toBe('neutral.950')
	})

	it('ignores overrides that point to a removed second brand', () => {
		const edited = resolveTokens(singleBrand, { 'chart-2': { light: 'brand2.500' } })
		expect(edited['chart-2'].light.edited).toBe(false)
		expect(edited['chart-2'].light.ref.startsWith('brand.')).toBe(true)
	})
})

describe('nearbyRefs', () => {
	it('orders the same scale by distance from the current step', () => {
		expect(nearbyRefs('brand.500').slice(0, 2).sort()).toEqual(['brand.400', 'brand.600'])
		expect(nearbyRefs('brand.500')).toHaveLength(10)
	})

	it('treats white as the lightest neutral', () => {
		expect(nearbyRefs('white')[0]).toBe('neutral.50')
		expect(nearbyRefs('neutral.50')).toContain('white')
	})
})
