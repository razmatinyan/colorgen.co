import { describe, expect, it } from 'vitest'
import { scaleSteps } from './color'
import { buildOgImage, ogImageKinds, ogImageSampleColors } from './og-image'

describe('buildOgImage', () => {
	it('falls back to the home image for unknown kinds and invalid colors', () => {
		expect(buildOgImage({}).kind).toBe('home')
		expect(buildOgImage({ kind: 'nope', colors: '1f6cb0' }).kind).toBe('home')
		expect(buildOgImage({ kind: 'builder', colors: 'zzzzzz' }).kind).toBe('home')
		expect(buildOgImage({ kind: 'builder' }).kind).toBe('home')
	})

	it('rejects color counts outside each tool limits', () => {
		expect(buildOgImage({ kind: 'builder', colors: '111111-222222-333333' }).kind).toBe('home')
		expect(buildOgImage({ kind: 'contrast', colors: '1f6cb0' }).kind).toBe('home')
		expect(buildOgImage({ kind: 'gradient', colors: '1f6cb0' }).kind).toBe('home')
		expect(buildOgImage({ kind: 'color', colors: '1f6cb0-ffffff' }).kind).toBe('home')
	})

	it('shows the full system on the home image', () => {
		const model = buildOgImage({ kind: 'home', colors: '2f5bea' })
		expect(model.title).toBe('Turn your brand color into a complete design system')
		expect(model.visual.type).toBe('scales')
		if (model.visual.type !== 'scales') return
		expect(model.visual.rows.map((row) => row.label)).toEqual([
			'Brand',
			'Neutral',
			'Success',
			'Warning',
			'Danger',
			'Info',
		])
		expect(model.visual.rows.every((row) => row.hexes.length === scaleSteps.length)).toBe(true)
	})

	it('keeps the brand color in the builder image and adds the second brand', () => {
		const model = buildOgImage({ kind: 'builder', colors: '1f6cb0-8b5cf6', tint: '50' })
		expect(model.title).toBe('Design system for #1F6CB0 and #8B5CF6')
		if (model.visual.type !== 'scales') throw new Error('expected scales')
		const [brand, brand2, neutral] = model.visual.rows
		expect(brand2!.label).toBe('Second brand')
		expect(brand!.hexes[brand!.anchorIndex!]).toBe('#1f6cb0')
		expect(neutral!.anchorIndex).toBeNull()
	})

	it('changes the neutral scale with the tint and ignores an invalid one', () => {
		const neutral = (tint?: string) => {
			const visual = buildOgImage({ kind: 'builder', colors: '1f6cb0', tint }).visual
			return visual.type === 'scales' ? visual.rows[1]!.hexes : []
		}
		expect(neutral('0')).not.toEqual(neutral('100'))
		expect(neutral('abc')).toEqual(neutral())
		expect(neutral('101')).toEqual(neutral())
	})

	it('lists palette colors with names', () => {
		const model = buildOgImage({ kind: 'palette', colors: '1f6cb0-ffffff-000000' })
		expect(model.title).toBe('Palette built around #1F6CB0')
		expect(model.visual).toEqual({
			type: 'colors',
			colors: [
				{ hex: '#1F6CB0', name: expect.any(String) },
				{ hex: '#FFFFFF', name: 'White' },
				{ hex: '#000000', name: 'Black' },
			],
		})
	})

	it('names one scale or several', () => {
		expect(buildOgImage({ kind: 'scale', colors: '1f6cb0' }).title).toBe('#1F6CB0 shades, 50 to 950')
		expect(buildOgImage({ kind: 'scale', colors: '1f6cb0-f68443' }).title).toBe('Color scales for #1F6CB0 and #F68443')
		expect(buildOgImage({ kind: 'scale', colors: '1f6cb0-f68443-22c55e' }).title).toBe(
			'Color scales for #1F6CB0 and 2 more',
		)
	})

	it('reports contrast with WCAG level and APCA Lc', () => {
		const model = buildOgImage({ kind: 'contrast', colors: '000000-ffffff' })
		expect(model.title).toBe('#000000 on #FFFFFF')
		expect(model.visual).toMatchObject({
			type: 'contrast',
			text: '#000000',
			background: '#ffffff',
			ratio: '21.00:1',
			level: 'AAA',
		})
		if (model.visual.type === 'contrast') expect(model.visual.lc).toMatch(/^Lc \d+$/)
	})

	it('shows a color with readable text, values and shades', () => {
		const model = buildOgImage({ kind: 'color', colors: '1f6cb0' })
		expect(model.title).toBe('#1F6CB0 color')
		if (model.visual.type !== 'color') throw new Error('expected color')
		expect(model.visual.foreground).toBe('#ffffff')
		expect(model.visual.values.map((value) => value.label)).toEqual(['HEX', 'RGB', 'HSL', 'OKLCH'])
		expect(model.visual.values[1]!.value).toBe('rgb(31 108 176)')
		expect(model.visual.shades).toContain('#1f6cb0')
		expect(buildOgImage({ kind: 'convert', colors: 'ffffff' }).visual).toMatchObject({ foreground: '#111114' })
	})

	it('draws the gradient with its type and angle, falling back to defaults', () => {
		const model = buildOgImage({ kind: 'gradient', colors: '1f6cb0-facc15', type: 'radial', angle: '45' })
		expect(model.title).toBe('Gradient from #1F6CB0 to #FACC15')
		if (model.visual.type !== 'gradient') throw new Error('expected gradient')
		expect(model.visual.background.startsWith('radial-gradient(circle, #1f6cb0 0%')).toBe(true)
		const fallback = buildOgImage({ kind: 'gradient', colors: '1f6cb0-facc15', type: 'spiral', angle: '400' })
		expect(fallback.visual.type === 'gradient' && fallback.visual.background).toMatch(/^linear-gradient\(90deg, /)
	})

	it('uses sample colors for the image tool', () => {
		const model = buildOgImage({ kind: 'image', colors: 'ignored' })
		expect(model.visual.type === 'colors' && model.visual.colors.map((color) => color.hex)).toEqual(
			ogImageSampleColors.map((hex) => hex.toUpperCase()),
		)
	})

	it('builds every kind', () => {
		const colorsFor = { contrast: '1f6cb0-ffffff', gradient: '1f6cb0-facc15' } as Record<string, string>
		for (const kind of ogImageKinds) {
			expect(buildOgImage({ kind, colors: colorsFor[kind] ?? '1f6cb0' }).kind).toBe(kind)
		}
	})
})
