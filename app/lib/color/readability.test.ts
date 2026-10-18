import { describe, expect, it } from 'vitest'
import { parseColor } from './parse'
import { checkReadability, findFix, fixReadability, readabilityPairs } from './readability'
import { generateSystem, type SystemSettings } from './system'
import { resolveTokens, tokenNames } from './tokens'

const settings: SystemSettings = {
	brand: parseColor('#1f6cb0')!,
	brand2: parseColor('#8b5cf6')!,
	neutralTint: 0.3,
	status: {},
}
const brands = ['#1f6cb0', '#facc15', '#f68443', '#16a34a', '#e11d48', '#7c3aed', '#0a2540', '#18181b', '#ffffff']

describe('readabilityPairs', () => {
	it('only reference known tokens and have unique ids', () => {
		for (const pair of readabilityPairs) {
			expect(tokenNames).toContain(pair.foreground)
			expect(tokenNames).toContain(pair.background)
		}
		expect(new Set(readabilityPairs.map((pair) => pair.id)).size).toBe(readabilityPairs.length)
	})
})

describe('checkReadability', () => {
	it('checks every pair in light and dark', () => {
		const results = checkReadability(resolveTokens(generateSystem(settings)))
		expect(results).toHaveLength(readabilityPairs.length * 2)
		for (const result of results) {
			expect(result.passes).toBe(result.ratio >= result.pair.minRatio)
			expect(Number.isFinite(result.apca)).toBe(true)
		}
	})

	it('passes everything for a mid-tone blue brand by default', () => {
		expect(checkReadability(resolveTokens(generateSystem(settings))).filter((result) => !result.passes)).toEqual([])
	})

	it('flags a pale brand on a white page', () => {
		const system = generateSystem({ ...settings, brand: parseColor('#facc15')! })
		const failing = checkReadability(resolveTokens(system)).filter((result) => !result.passes)
		expect(failing.some((result) => result.pair.id === 'primary/background' && result.mode === 'light')).toBe(true)
	})
})

describe('findFix', () => {
	it('moves the failing token to the nearest step that passes', () => {
		const system = generateSystem(settings)
		const tokens = resolveTokens(system, { 'muted-foreground': { light: 'neutral.300' } })
		const pair = readabilityPairs.find((item) => item.id === 'muted-foreground/muted')!
		expect(findFix(system, tokens, pair, 'light')).toEqual({
			token: 'muted-foreground',
			mode: 'light',
			ref: 'neutral.600',
		})
	})
})

describe('fixReadability', () => {
	it.each(brands)('makes every pair pass for %s', (brand) => {
		const system = generateSystem({ ...settings, brand: parseColor(brand)! })
		const overrides = fixReadability(system, {})
		expect(checkReadability(resolveTokens(system, overrides)).filter((result) => !result.passes)).toEqual([])
	})

	it('changes nothing when everything already passes', () => {
		expect(fixReadability(generateSystem(settings), {})).toEqual({})
	})

	it('can fix a single pair and mode', () => {
		const system = generateSystem(settings)
		const broken = { 'muted-foreground': { light: 'neutral.300', dark: 'neutral.600' } } as const
		const fixed = fixReadability(system, broken, { pairId: 'muted-foreground/muted', mode: 'light' })
		expect(fixed['muted-foreground']!.light).not.toBe('neutral.300')
		expect(fixed['muted-foreground']!.dark).toBe('neutral.600')
	})
})

describe('fixReadability with linked tokens', () => {
	it('does not override a token that a previous fix already made readable', () => {
		const system = generateSystem({ ...settings, brand: parseColor('#facc15')!, brand2: null })
		const overrides = fixReadability(system, {})
		expect(overrides.primary?.light).toBeDefined()
		expect(overrides.ring).toBeUndefined()
	})
})
