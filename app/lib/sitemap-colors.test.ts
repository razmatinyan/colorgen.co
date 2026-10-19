import { describe, expect, it } from 'vitest'
import { parseColor, toHex } from './color'
import { parseColorPageParam } from './color-page'
import { parseContrastParam } from './contrast-url'
import { parseScalesParam } from './scale-url'
import {
	colorSitemapPaths,
	namedColorHexes,
	sitemapColorHexes,
	tailwindColorHexes,
	tailwindColors,
} from './sitemap-colors'

const hex = /^#[0-9a-f]{6}$/

describe('tailwindColors', () => {
	it('has 22 families of 11 lowercase hex shades', () => {
		expect(Object.keys(tailwindColors)).toHaveLength(22)
		for (const shades of Object.values(tailwindColors)) {
			expect(shades).toHaveLength(11)
			for (const shade of shades) expect(shade).toMatch(hex)
		}
		expect(tailwindColors.blue[5]).toBe('#3b82f6')
	})
})

describe('sitemap colors', () => {
	it('lists named and Tailwind colors once each', () => {
		const all = sitemapColorHexes()
		expect(new Set(all).size).toBe(all.length)
		expect(all).toContain('#ff0000')
		expect(all).toContain('#3b82f6')
		expect(namedColorHexes().every((value) => hex.test(value))).toBe(true)
		expect(all.length).toBeLessThan(namedColorHexes().length + tailwindColorHexes().length)
	})

	it('builds color, scale and contrast paths that the routes accept as canonical', () => {
		const paths = colorSitemapPaths()
		expect(new Set(paths).size).toBe(paths.length)
		expect(paths).toContain('/color/3b82f6')
		expect(paths).toContain('/scale/3b82f6')
		expect(paths).toContain('/contrast/3b82f6-ffffff')
		expect(paths).not.toContain('/contrast/ffffff-ffffff')
		for (const path of paths) {
			const [, route, param] = path.split('/') as [string, string, string]
			if (route === 'color') expect(parseColorPageParam(param)).toEqual({ hex: `#${param}` })
			if (route === 'scale') expect(parseScalesParam(param)).not.toBeNull()
			if (route === 'contrast') expect(parseContrastParam(param)).not.toBeNull()
		}
	})

	it('round-trips every listed color exactly', () => {
		for (const value of sitemapColorHexes()) expect(toHex(parseColor(value)!)).toBe(value)
	})

	it('keeps the sitemap at a size a new site can get indexed', () => {
		expect(colorSitemapPaths().length).toBeGreaterThan(1000)
		expect(colorSitemapPaths().length).toBeLessThan(1500)
	})
})
