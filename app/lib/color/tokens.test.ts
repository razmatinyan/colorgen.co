import { describe, expect, it } from 'vitest'
import { wcagRatio } from './contrast'
import { parseColor } from './parse'
import { generateSystem, type SystemSettings } from './system'
import {
	isTokenRef,
	nearbyRefs,
	parseTokenRef,
	refHex,
	resolveTokens,
	tokenGroups,
	tokenNames,
	withoutExtraColor,
} from './tokens'

const settings: SystemSettings = {
	brand: parseColor('#1f6cb0')!,
	extras: [parseColor('#8b5cf6')!],
	neutralTint: 0.3,
	status: {},
}
const system = generateSystem(settings)
const singleBrand = generateSystem({ ...settings, extras: [] })

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

	it('picks status fills that keep their text readable for any brand', () => {
		const statusPairs = [
			['destructive', 'destructive-foreground'],
			['success', 'success-foreground'],
			['warning', 'warning-foreground'],
			['info', 'info-foreground'],
		] as const
		for (let h = 0; h < 360; h += 15) {
			for (const l of [0.3, 0.5, 0.65, 0.8]) {
				for (const c of [0, 0.08, 0.2]) {
					const brandTokens = resolveTokens(generateSystem({ ...settings, brand: { l, c, h }, extras: [] }))
					for (const [fill, text] of statusPairs) {
						for (const mode of ['light', 'dark'] as const) {
							expect(wcagRatio(brandTokens[text][mode].hex, brandTokens[fill][mode].hex)).toBeGreaterThanOrEqual(4.5)
						}
					}
				}
			}
		}
	})

	it('keeps an edited status color exact when its text is already readable', () => {
		const edited = generateSystem({ ...settings, status: { danger: parseColor('#b91c1c')! } })
		expect(resolveTokens(edited).destructive.light.hex).toBe('#b91c1c')
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

	it('gives charts the brand colors in order, then lighter and darker brand steps', () => {
		const chartRefs = (extras: string[]) => {
			const tokens = resolveTokens(generateSystem({ ...settings, extras: extras.map((hex) => parseColor(hex)!) }))
			return (['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const).map((name) =>
				tokens[name].light.ref.replace(/\.\d+$/, ''),
			)
		}
		expect(chartRefs([])).toEqual(['brand', 'brand', 'brand', 'brand', 'brand'])
		expect(chartRefs(['#8b5cf6'])).toEqual(['brand', 'brand2', 'brand', 'brand2', 'brand'])
		expect(chartRefs(['#8b5cf6', '#14b8a6'])).toEqual(['brand', 'brand2', 'brand3', 'brand', 'brand2'])
		expect(chartRefs(['#8b5cf6', '#14b8a6', '#f43f5e', '#eab308', '#0ea5e9'])).toEqual([
			'brand',
			'brand2',
			'brand3',
			'brand4',
			'brand5',
		])
	})

	it('resolves overrides that point to any extra color', () => {
		const many = generateSystem({
			...settings,
			extras: ['#8b5cf6', '#14b8a6', '#f43f5e'].map((hex) => parseColor(hex)!),
		})
		const edited = resolveTokens(many, { accent: { light: 'brand4.100' } })
		expect(edited.accent.light).toMatchObject({ ref: 'brand4.100', edited: true })
	})

	it('ignores overrides that point to a removed second brand', () => {
		const edited = resolveTokens(singleBrand, { 'chart-2': { light: 'brand2.500' } })
		expect(edited['chart-2'].light.edited).toBe(false)
		expect(edited['chart-2'].light.ref.startsWith('brand.')).toBe(true)
	})
})

describe('withoutExtraColor', () => {
	it('drops refs to the removed color and renumbers the ones after it', () => {
		expect(
			withoutExtraColor(
				{
					primary: { light: 'brand.500', dark: 'brand3.300' },
					secondary: { light: 'brand2.600' },
					'chart-4': { dark: 'brand4.500' },
					ring: { light: 'white' },
				},
				1,
			),
		).toEqual({
			primary: { light: 'brand.500' },
			secondary: { light: 'brand2.600' },
			'chart-4': { dark: 'brand3.500' },
			ring: { light: 'white' },
		})
	})

	it('drops tokens that are left without overrides', () => {
		expect(withoutExtraColor({ secondary: { light: 'brand2.600' } }, 0)).toEqual({})
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
