import { describe, expect, it } from 'vitest'
import { toHex } from './color'
import { defaultGradientOptions, parseGradientParam, parseGradientQuery, toGradientQuery } from './gradient-url'

describe('parseGradientParam', () => {
	it('reads two to five bare hex colors', () => {
		expect(parseGradientParam('1f6cb0-facc15')!.map(toHex)).toEqual(['#1f6cb0', '#facc15'])
		expect(parseGradientParam('000-fff-f00-0f0-00f')).toHaveLength(5)
	})

	it('rejects one color, too many colors and invalid input', () => {
		expect(parseGradientParam(undefined)).toBeNull()
		expect(parseGradientParam('1f6cb0')).toBeNull()
		expect(parseGradientParam('000-111-222-333-444-555')).toBeNull()
		expect(parseGradientParam('1f6cb0-')).toBeNull()
		expect(parseGradientParam('1f6cb0-zzzzzz')).toBeNull()
	})
})

describe('parseGradientQuery', () => {
	it('falls back to the defaults', () => {
		expect(parseGradientQuery({})).toEqual(defaultGradientOptions)
	})

	it('reads valid options', () => {
		expect(parseGradientQuery({ type: 'conic', angle: '45', space: 'srgb', steps: '9' })).toEqual({ type: 'conic', angle: 45, space: 'srgb', steps: 9 })
	})

	it('ignores malformed and out-of-range values', () => {
		expect(parseGradientQuery({ type: 'diamond', angle: '360', space: 'hsl', steps: '1' })).toEqual(defaultGradientOptions)
		expect(parseGradientQuery({ angle: '-5', steps: '13' })).toEqual(defaultGradientOptions)
		expect(parseGradientQuery({ angle: '4.5' }).angle).toBe(90)
	})

	it('uses the first value of repeated keys', () => {
		expect(parseGradientQuery({ type: ['radial', 'conic'] }).type).toBe('radial')
	})
})

describe('toGradientQuery', () => {
	it('omits defaults', () => {
		expect(toGradientQuery(defaultGradientOptions)).toEqual({})
	})

	it('omits the angle for radial gradients', () => {
		expect(toGradientQuery({ ...defaultGradientOptions, type: 'radial', angle: 30 })).toEqual({ type: 'radial' })
	})

	it('round-trips', () => {
		const options = { type: 'conic', angle: 0, space: 'oklab', steps: 12 } as const
		expect(parseGradientQuery(toGradientQuery(options))).toEqual(options)
	})
})
