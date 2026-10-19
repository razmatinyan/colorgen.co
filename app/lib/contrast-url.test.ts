import { describe, expect, it } from 'vitest'
import { toHex } from './color'
import { parseContrastParam, toContrastParam } from './contrast-url'

describe('parseContrastParam', () => {
	it('reads text then background', () => {
		const pair = parseContrastParam('1f6cb0-ffffff')!
		expect(toHex(pair.text)).toBe('#1f6cb0')
		expect(toHex(pair.background)).toBe('#ffffff')
	})

	it.each([undefined, '', '1f6cb0', '1f6cb0-ffffff-000000', 'blue-white', '1f6cb0--ffffff'])('rejects %j', (param) => {
		expect(parseContrastParam(param)).toBeNull()
	})

	it('round-trips', () => {
		expect(toContrastParam(parseContrastParam('1F6CB0-fff')!)).toBe('1f6cb0-ffffff')
	})
})
