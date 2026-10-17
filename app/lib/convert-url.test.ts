import { describe, expect, it } from 'vitest'
import { isInGamut, parseColor, toHex } from './color'
import { parseConvertRoute, parseExactOklch, toConvertTarget } from './convert-url'

const wideGreen = parseColor('oklch(0.7 0.3 150)')!

describe('toConvertTarget', () => {
	it('uses only the hex for sRGB colors', () => {
		expect(toConvertTarget(parseColor('#1f6cb0')!)).toEqual({ param: '1f6cb0', query: {} })
	})

	it('adds the exact OKLCH for colors outside sRGB', () => {
		const target = toConvertTarget(wideGreen)
		expect(target.param).toBe(toHex(wideGreen).slice(1))
		expect(target.query).toEqual({ oklch: '0.7,0.3,150' })
	})
})

describe('parseConvertRoute', () => {
	it('reads the hex path', () => {
		expect(toHex(parseConvertRoute('1f6cb0', undefined)!)).toBe('#1f6cb0')
		expect(toHex(parseConvertRoute('F00', undefined)!)).toBe('#ff0000')
	})

	it('restores an exact color outside sRGB', () => {
		const { param, query } = toConvertTarget(wideGreen)
		const color = parseConvertRoute(param, query.oklch)!
		expect(isInGamut(color)).toBe(false)
		expect(color.c).toBeCloseTo(0.3, 4)
	})

	it.each([undefined, '', 'blue', '1f6cb0-ffffff', '12345'])('rejects the path %j', (param) => {
		expect(parseConvertRoute(param, undefined)).toBeNull()
	})
})

describe('parseExactOklch', () => {
	const pathColor = parseColor(toHex(wideGreen))!

	it.each(['0.7,0.3', '0.7,0.3,150,1', 'a,b,c', '1.2,0.3,150', '0.7,0.9,150', '0.7,0.3,360', '0.7,-0.1,150'])('ignores %j', (value) => {
		expect(parseExactOklch(value, pathColor)).toBeNull()
	})

	it('ignores an exact color that does not match the path', () => {
		expect(parseExactOklch('0.7,0.3,150', parseColor('#1f6cb0')!)).toBeNull()
	})
})
