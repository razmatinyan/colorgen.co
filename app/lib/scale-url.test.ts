import { describe, expect, it } from 'vitest'
import { parseColor, toHex } from './color'
import {
	isScaleName,
	maxScales,
	parseNamesParam,
	parseScalesParam,
	resolveScaleNames,
	toNamesParam,
	toScaleName,
} from './scale-url'

const blue = parseColor('#1f6cb0')!
const orange = parseColor('#ffa500')!
const gray = parseColor('#808080')!

describe('parseScalesParam', () => {
	it('parses one or more colors', () => {
		expect(parseScalesParam('1f6cb0')!.map((color) => toHex(color))).toEqual(['#1f6cb0'])
		expect(parseScalesParam('1f6cb0-f68443')!.map((color) => toHex(color))).toEqual(['#1f6cb0', '#f68443'])
	})

	it(`rejects more than ${maxScales} colors`, () => {
		expect(parseScalesParam(Array.from({ length: maxScales + 1 }, () => '1f6cb0').join('-'))).toBeNull()
	})

	it.each([undefined, '', 'blue', '1f6cb0--f68443'])('rejects %j', (param) => {
		expect(parseScalesParam(param)).toBeNull()
	})
})

describe('toScaleName', () => {
	it.each([
		['Brand', 'brand'],
		['  Sky Blue ', 'sky-blue'],
		['primary_500', 'primary-500'],
		['2nd accent', 'nd-accent'],
		['--x--', 'x'],
		['!!!', ''],
		['a'.repeat(40), 'a'.repeat(24)],
	])('turns %j into %j', (input, name) => {
		expect(toScaleName(input)).toBe(name)
	})

	it('accepts only clean names', () => {
		expect(isScaleName('brand-2')).toBe(true)
		expect(isScaleName('Brand')).toBe(false)
		expect(isScaleName('')).toBe(false)
		expect(isScaleName('brand-')).toBe(false)
	})
})

describe('resolveScaleNames', () => {
	it('names scales after their color family', () => {
		expect(resolveScaleNames([blue, orange, gray])).toEqual(['blue', 'orange', 'gray'])
	})

	it('numbers repeated names', () => {
		expect(resolveScaleNames([blue, blue, blue])).toEqual(['blue', 'blue-2', 'blue-3'])
	})

	it('keeps custom names and moves defaults out of their way', () => {
		expect(resolveScaleNames([blue, orange], [null, 'blue'])).toEqual(['blue-2', 'blue'])
		expect(resolveScaleNames([blue, orange], ['brand', 'brand'])).toEqual(['brand', 'brand-2'])
	})
})

describe('names param', () => {
	it('parses positional names and drops invalid ones', () => {
		expect(parseNamesParam('brand,,Accent,ok', 3)).toEqual(['brand', null, null])
		expect(parseNamesParam(undefined, 2)).toEqual([null, null])
	})

	it('omits trailing defaults', () => {
		expect(toNamesParam([null, null])).toBe('')
		expect(toNamesParam(['brand', null])).toBe('brand')
		expect(toNamesParam([null, 'accent', null])).toBe(',accent')
	})

	it('round-trips', () => {
		const names = ['brand', null, 'accent']
		expect(parseNamesParam(toNamesParam(names), 3)).toEqual(names)
	})
})
