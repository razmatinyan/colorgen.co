import { describe, expect, it } from 'vitest'
import { defaultNeutralTint, parseColor, toHex } from './color'
import { parseBrandsParam, parseBuilderQuery, parseTokensParam, toBrandsParam, toBuilderQuery, toTokensParam } from './builder-url'

describe('parseBuilderQuery', () => {
	it('falls back to defaults for an empty query', () => {
		expect(parseBuilderQuery({})).toEqual({ neutralTint: defaultNeutralTint, status: {}, tokens: {} })
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
		expect(parseBuilderQuery({ brand: '000000', tint: 40, danger: null })).toEqual({ neutralTint: defaultNeutralTint, status: {}, tokens: {} })
	})
})

describe('toBuilderQuery', () => {
	it('omits default values', () => {
		expect(toBuilderQuery({ neutralTint: defaultNeutralTint, status: {}, tokens: {} })).toEqual({})
	})

	it('writes the tint as a whole percentage and status colors as hex', () => {
		expect(toBuilderQuery({ neutralTint: 0.456, status: { warning: parseColor('#d97706')! }, tokens: { ring: { dark: 'white' } } }))
			.toEqual({ tint: '46', warning: 'd97706', tokens: 'ring.dark~white' })
	})

	it('round-trips with parseBuilderQuery', () => {
		const query = { tint: '12', success: '15803d', info: '0369a1', tokens: 'primary.light~brand.700,primary.dark~brand.300,muted-foreground.light~neutral.700' }
		expect(toBuilderQuery(parseBuilderQuery(query))).toEqual(query)
	})
})

describe('parseBrandsParam', () => {
	it('reads one or two brand colors', () => {
		expect(toHex(parseBrandsParam('1f6cb0')!.brand)).toBe('#1f6cb0')
		expect(parseBrandsParam('1f6cb0')!.brand2).toBeNull()
		expect(toHex(parseBrandsParam('1f6cb0-8b5cf6')!.brand2!)).toBe('#8b5cf6')
	})

	it.each([undefined, '', 'zzz', '1f6cb0-8b5cf6-f59e0b', '1f6cb0-'])('rejects %j', (param) => {
		expect(parseBrandsParam(param)).toBeNull()
	})

	it('round-trips with toBrandsParam', () => {
		expect(toBrandsParam(parseBrandsParam('1f6cb0-8b5cf6')!)).toBe('1f6cb0-8b5cf6')
		expect(toBrandsParam(parseBrandsParam('1f6cb0')!)).toBe('1f6cb0')
	})
})

describe('parseTokensParam', () => {
	it('reads token overrides per mode', () => {
		expect(parseTokensParam('primary.dark~brand.400,primary.light~white,ring.light~brand2.600')).toEqual({
			primary: { dark: 'brand.400', light: 'white' },
			ring: { light: 'brand2.600' },
		})
	})

	it.each([
		'nope.dark~brand.400',
		'primary.dim~brand.400',
		'primary.dark~brand.450',
		'primary.dark~black',
		'primary.dark',
		'primary~brand.400',
		'primary.dark~brand.400~x',
	])('ignores the malformed entry %j', (param) => {
		expect(parseTokensParam(param)).toEqual({})
	})

	it('writes overrides in token order', () => {
		expect(toTokensParam({ ring: { light: 'white' }, background: { dark: 'neutral.900' } })).toBe('background.dark~neutral.900,ring.light~white')
		expect(toTokensParam({})).toBe('')
	})
})
