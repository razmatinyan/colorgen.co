import { describe, expect, it } from 'vitest'
import { defaultNeutralTint, parseColor, toHex } from './color'
import { parseBuilderQuery, toBuilderQuery } from './builder-url'

describe('parseBuilderQuery', () => {
	it('falls back to defaults for an empty query', () => {
		expect(parseBuilderQuery({})).toEqual({ neutralTint: defaultNeutralTint, status: {} })
	})

	it('reads the neutral tint as a percentage', () => {
		expect(parseBuilderQuery({ tint: '0' }).neutralTint).toBe(0)
		expect(parseBuilderQuery({ tint: '65' }).neutralTint).toBeCloseTo(0.65)
		expect(parseBuilderQuery({ tint: '100' }).neutralTint).toBe(1)
	})

	it.each(['101', '-5', '4.5', 'abc', '', '1000'])('ignores tint %j', (tint) => {
		expect(parseBuilderQuery({ tint }).neutralTint).toBe(defaultNeutralTint)
	})

	it('reads edited status colors and ignores malformed ones', () => {
		const { status } = parseBuilderQuery({ danger: 'b91c1c', success: 'F0A', warning: 'nope', info: '#2563eb' })
		expect(Object.keys(status)).toEqual(['success', 'danger'])
		expect(toHex(status.danger!)).toBe('#b91c1c')
		expect(toHex(status.success!)).toBe('#ff00aa')
	})

	it('uses the first value of repeated keys', () => {
		const { status, neutralTint } = parseBuilderQuery({ tint: ['40', '80'], info: ['2563eb', null] })
		expect(neutralTint).toBeCloseTo(0.4)
		expect(toHex(status.info!)).toBe('#2563eb')
	})

	it('ignores unknown keys and non-string values', () => {
		expect(parseBuilderQuery({ brand: '000000', tint: 40, danger: null })).toEqual({ neutralTint: defaultNeutralTint, status: {} })
	})
})

describe('toBuilderQuery', () => {
	it('omits default values', () => {
		expect(toBuilderQuery({ neutralTint: defaultNeutralTint, status: {} })).toEqual({})
	})

	it('writes the tint as a whole percentage and status colors as hex', () => {
		expect(toBuilderQuery({ neutralTint: 0.456, status: { warning: parseColor('#d97706')! } }))
			.toEqual({ tint: '46', warning: 'd97706' })
	})

	it('round-trips with parseBuilderQuery', () => {
		const query = { tint: '12', success: '15803d', info: '0369a1' }
		expect(toBuilderQuery(parseBuilderQuery(query))).toEqual(query)
	})
})
