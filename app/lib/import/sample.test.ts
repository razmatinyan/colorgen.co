import { describe, expect, it } from 'vitest'
import { toHex } from '../color'
import { readImport } from '.'
import { importSample } from './sample'

describe('importSample', () => {
	it('imports as a full light and dark system with its own neutral hue', () => {
		const reading = readImport([{ text: importSample }])
		expect(reading.formats).toEqual(['css'])
		expect(reading.hasDarkMode).toBe(true)
		expect(reading.missingReferences + reading.unreadable).toBe(0)
		const { system, comparisons } = reading.result!
		expect(toHex(system.brand)).toBe('#5048e5')
		expect(system.neutralHue).not.toBeNull()
		expect(comparisons.length).toBeGreaterThan(30)
	})
})
