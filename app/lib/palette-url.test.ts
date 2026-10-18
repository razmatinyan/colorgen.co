import { describe, expect, it } from 'vitest'
import { toHex } from './color'
import { parseColorsParam, parseHexPart, toColorsParam, toHexPart } from './palette-url'

describe('parseColorsParam', () => {
	it('parses dash-separated hex colors', () => {
		const colors = parseColorsParam('326789-78a6c8-e9eef2-e65c4f')!
		expect(colors.map((color) => toHex(color))).toEqual(['#326789', '#78a6c8', '#e9eef2', '#e65c4f'])
	})

	it('accepts short and uppercase hex', () => {
		expect(parseColorsParam('F00-0f0')!.map((color) => toHex(color))).toEqual(['#ff0000', '#00ff00'])
	})

	it.each([undefined, '', 'red-blue', '326789-zzz', '326789--e65c4f', 'rgb(1,2,3)', '12345'])('rejects %j', (param) => {
		expect(parseColorsParam(param)).toBeNull()
	})
})

describe('toColorsParam', () => {
	it('round-trips with parseColorsParam', () => {
		const param = '1f6cb0-25aea7-f68443-f4e19c-222933'
		expect(toColorsParam(parseColorsParam(param)!)).toBe(param)
	})
})

describe('parseHexPart', () => {
	it('parses a bare hex color', () => {
		expect(toHex(parseHexPart('1F6CB0')!)).toBe('#1f6cb0')
	})

	it.each([undefined, '', '#1f6cb0', 'red', '1f6cb', '1f6cb0aa'])('rejects %j', (part) => {
		expect(parseHexPart(part)).toBeNull()
	})
})

describe('toHexPart', () => {
	it('writes lowercase hex without the hash', () => {
		expect(toHexPart(parseHexPart('ABCDEF')!)).toBe('abcdef')
	})
})
