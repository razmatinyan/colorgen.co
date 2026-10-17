import { describe, expect, it } from 'vitest'
import { generateSystem, parseColor, resolveTokens, tokenNames, type SystemSettings } from '../color'
import { buildExportModel, dtcgColor, srgbComponents, toCssVariables, toDesignTokens, toFigmaTokens, toTailwindCss } from '.'

const settings: SystemSettings = { brand: parseColor('#1f6cb0')!, brand2: parseColor('#8b5cf6')!, neutralTint: 0.3, status: {} }
const system = generateSystem(settings)
const tokens = resolveTokens(system)
const model = buildExportModel(system, tokens)
const singleBrandModel = buildExportModel(generateSystem({ ...settings, brand2: null }), resolveTokens(generateSystem({ ...settings, brand2: null })))

function block(css: string, selector: string) {
	const start = css.indexOf(`${selector} {`)
	return css.slice(start, css.indexOf('\n}', start))
}

function declarations(css: string) {
	return Object.fromEntries([...css.matchAll(/--([\w-]+): ([^;]+);/g)].map(match => [match[1], match[2]]))
}

describe('buildExportModel', () => {
	it('lists every scale with 11 steps, naming the second brand brand-2', () => {
		expect(model.scales.map(scale => scale.name)).toEqual(['brand', 'brand-2', 'neutral', 'success', 'warning', 'danger', 'info'])
		for (const scale of model.scales) expect(scale.steps).toHaveLength(11)
		expect(singleBrandModel.scales.map(scale => scale.name)).not.toContain('brand-2')
	})

	it('lists every token with its light and dark value', () => {
		expect(model.tokens.map(token => token.name)).toEqual([...tokenNames])
		const primary = model.tokens.find(token => token.name === 'primary')!
		expect(primary.light.hex).toBe(tokens.primary.light.hex)
		expect(primary.light.primitive).toEqual({ scale: 'brand', step: 600 })
		expect(model.tokens.find(token => token.name === 'background')!.light.primitive).toBeNull()
	})
})

describe('srgbComponents', () => {
	it('converts hex to 0–1 channels', () => {
		expect(srgbComponents('#ffffff')).toEqual([1, 1, 1])
		expect(srgbComponents('#000000')).toEqual([0, 0, 0])
		expect(srgbComponents('#1f6cb0')).toEqual([0.1216, 0.4235, 0.6902])
	})

	it('builds a DTCG color object', () => {
		expect(dtcgColor('#ff0000')).toEqual({ colorSpace: 'srgb', components: [1, 0, 0], alpha: 1, hex: '#ff0000' })
	})
})

describe('toTailwindCss', () => {
	const css = toTailwindCss(model)

	it('adds every scale step as a Tailwind color', () => {
		const theme = declarations(block(css, '@theme'))
		expect(Object.keys(theme)).toHaveLength(7 * 11)
		expect(theme['color-brand-600']).toMatch(/^oklch\(/)
		expect(theme['color-brand-2-500']).toBeDefined()
	})

	it('writes every token for light and dark', () => {
		const light = declarations(block(css, ':root'))
		const dark = declarations(block(css, '.dark'))
		for (const name of tokenNames) {
			expect(light[name]).toBeDefined()
			expect(dark[name]).toBeDefined()
		}
	})

	it('maps every token to a Tailwind color', () => {
		const inline = declarations(block(css, '@theme inline'))
		expect(inline['color-primary']).toBe('var(--primary)')
		expect(Object.keys(inline)).toHaveLength(tokenNames.length)
	})

	it('can write hex values', () => {
		const light = declarations(block(toTailwindCss(model, 'hex'), ':root'))
		expect(light.primary).toBe('#1f6cb0')
		expect(light.background).toBe('#ffffff')
	})
})

describe('toCssVariables', () => {
	const css = toCssVariables(model, 'hex')

	it('defines scales once and points tokens at them', () => {
		const root = declarations(block(css, ':root'))
		expect(root['brand-600']).toBe('#1f6cb0')
		expect(root.primary).toBe('var(--brand-600)')
		expect(root.background).toBe('#ffffff')
	})

	it('only overrides tokens in dark mode', () => {
		const dark = declarations(block(css, '.dark'))
		expect(Object.keys(dark)).toEqual([...tokenNames])
		expect(dark.background).toBe('var(--neutral-950)')
	})

	it('references only variables that exist', () => {
		const defined = new Set(Object.keys(declarations(css)))
		for (const match of css.matchAll(/var\(--([\w-]+)\)/g)) expect(defined.has(match[1]!)).toBe(true)
	})
})

describe('toDesignTokens', () => {
	const tree = JSON.parse(toDesignTokens(model))

	it('has primitives and a group per mode', () => {
		expect(Object.keys(tree)).toEqual(['color', 'light', 'dark'])
		expect(tree.color.brand['600']).toEqual({ $type: 'color', $value: dtcgColor('#1f6cb0') })
		expect(tree.color.white.$value.hex).toBe('#ffffff')
	})

	it('aliases every semantic token to a primitive that exists', () => {
		for (const mode of ['light', 'dark']) {
			for (const name of tokenNames) {
				const token = tree[mode][name]
				expect(token.$type).toBe('color')
				const path = token.$value.match(/^\{(.+)\}$/)[1].split('.')
				expect(path.reduce((node: Record<string, unknown>, key: string) => node[key] as Record<string, unknown>, tree)).toHaveProperty('$value')
			}
		}
	})
})

describe('toFigmaTokens', () => {
	it('writes one mode with plain color values', () => {
		const light = JSON.parse(toFigmaTokens(model, 'light'))
		const dark = JSON.parse(toFigmaTokens(model, 'dark'))
		expect(Object.keys(light)).toEqual(['color', 'theme'])
		expect(light.theme.primary.$value).toEqual(dtcgColor(tokens.primary.light.hex))
		expect(dark.theme.primary.$value).toEqual(dtcgColor(tokens.primary.dark.hex))
		expect(Object.keys(light.theme)).toEqual([...tokenNames])
		expect(light.color).toEqual(dark.color)
	})
})

describe('toJson', () => {
	it('keeps number arrays on one line and stays valid JSON', () => {
		const json = toDesignTokens(model)
		expect(json).toContain('"components": [0.1216, 0.4235, 0.6902]')
		expect(() => JSON.parse(json)).not.toThrow()
		expect(toFigmaTokens(model, 'light')).not.toMatch(/^\s*-?[\d.]+,?$/m)
	})
})
