import { describe, expect, it } from 'vitest'
import { toHex } from './color'
import { parseScalesParam } from './scale-url'

describe('parseScalesParam', () => {
	it('parses one or more colors', () => {
		expect(parseScalesParam('1f6cb0')!.map((color) => toHex(color))).toEqual(['#1f6cb0'])
		expect(parseScalesParam('1f6cb0-f68443')!.map((color) => toHex(color))).toEqual(['#1f6cb0', '#f68443'])
	})

	it('accepts any number of colors', () => {
		expect(parseScalesParam(Array.from({ length: 40 }, () => '1f6cb0').join('-'))).toHaveLength(40)
	})

	it.each([undefined, '', 'blue', '1f6cb0--f68443'])('rejects %j', (param) => {
		expect(parseScalesParam(param)).toBeNull()
	})
})
