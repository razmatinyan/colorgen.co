import { describe, expect, it } from 'vitest'
import { conversionFormats, convertColor, cssColorNames, isInP3 } from './convert'
import { parseColor } from './parse'

function valuesOf(input: string) {
	return Object.fromEntries(convertColor(input).values.map((value) => [value.id, value.value]))
}

describe('convertColor', () => {
	it('lists every format in order', () => {
		expect(convertColor('#1f6cb0').values.map((value) => value.id)).toEqual(
			conversionFormats.map((format) => format.id),
		)
	})

	it('converts an sRGB color to every format', () => {
		const values = valuesOf('#1f6cb0')
		expect(values.hex).toBe('#1f6cb0')
		expect(values.rgb).toBe('rgb(31 108 176)')
		expect(values.hsl).toBe('hsl(208.1 70% 40.6%)')
		expect(values.hwb).toMatch(/^hwb\(208\.\d \d+(\.\d)?% \d+(\.\d)?%\)$/)
		expect(values.oklch).toBe('oklch(52.07% 0.1295 249.87)')
		expect(values.oklab).toMatch(/^oklab\(52\.\d+% -0\.\d+ -0\.\d+\)$/)
		expect(values.lab).toMatch(/^lab\(4\d(\.\d+)?% -?\d+(\.\d+)? -\d+(\.\d+)?\)$/)
		expect(values.lch).toMatch(/^lch\(4\d(\.\d+)?% \d+(\.\d+)? \d+(\.\d+)?\)$/)
		expect(values.p3).toMatch(/^color\(display-p3 0\.\d+ 0\.\d+ 0\.\d+\)$/)
		expect(convertColor('#1f6cb0').values.every((value) => !value.isMapped)).toBe(true)
	})

	it('round-trips every format back to the same hex', () => {
		for (const input of ['#1f6cb0', '#f68443', '#000000', '#ffffff', '#808080', '#00ff00']) {
			for (const value of convertColor(input).values) {
				expect(convertColor(value.value).hex).toBe(input)
			}
		}
	})

	it('writes black, white and grays without stray signs or hues', () => {
		expect(valuesOf('#000000')).toMatchObject({
			rgb: 'rgb(0 0 0)',
			hsl: 'hsl(0 0% 0%)',
			oklch: 'oklch(0% 0 0)',
			lch: 'lch(0% 0 0)',
		})
		expect(valuesOf('#ffffff')).toMatchObject({
			rgb: 'rgb(255 255 255)',
			hwb: 'hwb(0 100% 0%)',
			p3: 'color(display-p3 1 1 1)',
		})
		expect(valuesOf('#808080').oklch).toMatch(/ 0 0\)$/)
	})

	it('keeps colors outside sRGB exact and marks mapped formats', () => {
		const conversion = convertColor('oklch(0.7 0.3 150)')
		expect(conversion.inSrgb).toBe(false)
		expect(conversion.inP3).toBe(false)
		expect(conversion.hex).toMatch(/^#[0-9a-f]{6}$/)
		const byId = Object.fromEntries(conversion.values.map((value) => [value.id, value]))
		expect(byId.oklch!.value).toBe('oklch(70% 0.3 150)')
		expect(byId.oklch!.isMapped).toBe(false)
		expect(byId.hex!.isMapped).toBe(true)
		expect(byId.p3!.isMapped).toBe(true)
	})

	it('keeps Display P3 colors exact in P3', () => {
		const conversion = convertColor('color(display-p3 0 1 0)')
		expect(conversion.inSrgb).toBe(false)
		expect(conversion.inP3).toBe(true)
		expect(conversion.values.find((value) => value.id === 'p3')!.value).toBe('color(display-p3 0 1 0)')
	})

	it('accepts named colors and bare hex, rejects invalid input', () => {
		expect(convertColor('rebeccapurple').hex).toBe('#663399')
		expect(convertColor(parseColor('1f6cb0')!).hex).toBe('#1f6cb0')
		expect(() => convertColor('not a color')).toThrow()
	})
})

describe('cssColorNames', () => {
	it('finds exact CSS names', () => {
		expect(cssColorNames('#ff0000')).toEqual(['red'])
		expect(cssColorNames('#00ffff')).toEqual(['aqua', 'cyan'])
		expect(cssColorNames('#1f6cb0')).toEqual([])
	})
})

describe('isInP3', () => {
	it('contains sRGB and rejects colors beyond P3', () => {
		expect(isInP3('#ff0000')).toBe(true)
		expect(isInP3('oklch(0.7 0.3 150)')).toBe(false)
	})
})
