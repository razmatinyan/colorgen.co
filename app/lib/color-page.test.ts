import { describe, expect, it } from 'vitest'
import { harmonies, scaleSteps, wcagRatio } from './color'
import { buildColorPage, colorPageSummary, colorPageTitle, parseColorPageParam } from './color-page'

describe('parseColorPageParam', () => {
	it('accepts a lowercase 6-digit hex', () => {
		expect(parseColorPageParam('1f6cb0')).toEqual({ hex: '#1f6cb0' })
	})

	it('redirects uppercase and short hex to the canonical form', () => {
		expect(parseColorPageParam('1F6CB0')).toEqual({ redirect: '1f6cb0' })
		expect(parseColorPageParam('f00')).toEqual({ redirect: 'ff0000' })
	})

	it('rejects anything else', () => {
		expect(parseColorPageParam(undefined)).toBeNull()
		expect(parseColorPageParam('')).toBeNull()
		expect(parseColorPageParam('#1f6cb0')).toBeNull()
		expect(parseColorPageParam('blue')).toBeNull()
		expect(parseColorPageParam('1f6cb0-ffffff')).toBeNull()
		expect(parseColorPageParam('12345')).toBeNull()
	})
})

describe('buildColorPage', () => {
	const page = buildColorPage('#1f6cb0')

	it('describes the color', () => {
		expect(page.hex).toBe('#1f6cb0')
		expect(page.name).toBe('Blue')
		expect(page.family).toBe('blue')
		expect(page.values.map(value => value.id)).toEqual(['hex', 'rgb', 'hsl', 'oklch'])
		expect(page.values[1]!.value).toBe('rgb(31 108 176)')
	})

	it('keeps the exact color in its shade scale', () => {
		expect(page.shades.map(swatch => swatch.step)).toEqual([...scaleSteps])
		expect(page.shades.find(swatch => swatch.step === page.anchorStep)!.hex).toBe('#1f6cb0')
	})

	it('checks text on the color and the color as text', () => {
		expect(page.readability.map(row => row.id)).toEqual(['white-on-color', 'dark-on-color', 'color-on-white', 'color-on-dark'])
		const [whiteOnColor, , onWhite] = page.readability
		expect(whiteOnColor!.check.ratio).toBeCloseTo(wcagRatio('#ffffff', '#1f6cb0'), 5)
		expect(onWhite!.fix).toBeNull()
		expect(page.bestTextColor).toBe('#ffffff')
	})

	it('suggests the closest readable version when the color fails as text', () => {
		const yellow = buildColorPage('#facc15')
		const onWhite = yellow.readability.find(row => row.id === 'color-on-white')!
		expect(onWhite.fix).not.toBeNull()
		expect(wcagRatio(onWhite.fix!.hex, '#ffffff')).toBeGreaterThanOrEqual(4.5)
		expect(yellow.bestTextColor).not.toBe('#ffffff')
	})

	it('builds one palette per harmony around the exact color, the same every time', () => {
		expect(page.palettes.map(palette => palette.harmony)).toEqual([...harmonies])
		expect(page.palettes.every(palette => palette.hexes[0] === '#1f6cb0' && palette.hexes.length === 5)).toBe(true)
		expect(buildColorPage('#1f6cb0').palettes).toEqual(page.palettes)
	})

	it('links distinct related colors', () => {
		const hexes = page.related.map(color => color.hex)
		expect(new Set(hexes).size).toBe(hexes.length)
		expect(hexes).not.toContain('#1f6cb0')
		expect(page.related.map(color => color.id)).toContain('complementary')
		expect(hexes.every(hex => /^#[0-9a-f]{6}$/.test(hex))).toBe(true)
	})

	it('skips hue-based relatives for grays, black and white', () => {
		for (const hex of ['#808080', '#000000', '#ffffff']) {
			const gray = buildColorPage(hex)
			expect(gray.intensity).toBe('neutral')
			expect(gray.related.every(color => color.id === 'lighter' || color.id === 'darker')).toBe(true)
			expect(gray.related.map(color => color.hex)).not.toContain(hex)
		}
	})

	it('shows the color as a brand in a full system', () => {
		expect(page.system.scales.map(scale => scale.id)).toEqual(['brand', 'neutral', 'success', 'warning', 'danger', 'info'])
		expect(page.system.tokens.primary.light.hex).toBe('#1f6cb0')
		expect(wcagRatio(page.system.tokens.primary.dark.hex, page.system.tokens.background.dark.hex)).toBeGreaterThanOrEqual(4.5)
	})
})

describe('colorPageSummary', () => {
	it('is unique, readable text about the color', () => {
		const summary = colorPageSummary(buildColorPage('#1f6cb0'))
		expect(summary).toContain('#1F6CB0 is a blue')
		expect(summary).toContain('White text on it')
		expect(summary).not.toBe(colorPageSummary(buildColorPage('#f97316')))
	})

	it('uses "an" before vowels and warns when the color fails as text', () => {
		const summary = colorPageSummary(buildColorPage('#f97316'))
		expect(summary).toMatch(/is an orange/)
		expect(summary).toContain('use a darker shade for text')
	})
})

describe('colorPageTitle', () => {
	it('names the hex and the color', () => {
		expect(colorPageTitle(buildColorPage('#1f6cb0'))).toBe('#1F6CB0 color: Blue shades, palettes and contrast')
	})
})
