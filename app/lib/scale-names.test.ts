import { describe, expect, it } from 'vitest'
import { generateSystem, parseColor } from './color'
import {
	isScaleName,
	parseNamesParam,
	resolveExtraNames,
	resolveScaleNames,
	scaleLabel,
	systemScaleNames,
	toNamesParam,
	toScaleName,
	tokenRefLabel,
} from './scale-names'

const blue = parseColor('#1f6cb0')!
const orange = parseColor('#ffa500')!
const gray = parseColor('#808080')!
const purple = parseColor('#8b5cf6')!

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

describe('resolveExtraNames', () => {
	it('keeps the names the system already uses free', () => {
		expect(resolveExtraNames([blue, purple], ['brand', 'neutral'])).toEqual(['brand-2', 'neutral-2'])
		expect(resolveExtraNames([purple, purple])).toEqual(['violet', 'violet-2'])
	})
})

describe('systemScaleNames', () => {
	it('names fixed scales by id and extra colors by family or custom name', () => {
		const system = generateSystem({ brand: blue, extras: [purple, orange], neutralTint: 0.3, status: {} })
		const names = systemScaleNames(system, [null, 'accent'])
		expect(names).toMatchObject({ brand: 'brand', neutral: 'neutral', danger: 'danger', brand2: 'violet' })
		expect(names.brand3).toBe('accent')
	})
})

describe('labels', () => {
	it('turns scale names into sentence case labels', () => {
		expect(scaleLabel('blue-2')).toBe('Blue 2')
		expect(scaleLabel('brand')).toBe('Brand')
	})

	it('labels token refs with the scale names', () => {
		expect(tokenRefLabel('white')).toBe('White')
		expect(tokenRefLabel('neutral.950')).toBe('Neutral 950')
		expect(tokenRefLabel('brand2.400', { brand2: 'purple' })).toBe('Purple 400')
	})
})
