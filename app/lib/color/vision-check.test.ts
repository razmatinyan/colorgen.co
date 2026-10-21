import { describe, expect, it } from 'vitest'
import { parseColor } from './parse'
import { generateSystem, type SystemSettings } from './system'
import { resolveTokens, tokenNames, type ResolvedTokens } from './tokens'
import { checkVision, describeVisionWarning, visionTokenGroups, type VisionWarning } from './vision-check'

const settings: SystemSettings = {
	brand: parseColor('#1f6cb0')!,
	extras: [],
	neutralTint: 0.3,
	status: {},
}

function withStatus(status: SystemSettings['status']): ResolvedTokens {
	return resolveTokens(generateSystem({ ...settings, status }))
}

const warning = (overrides: Partial<VisionWarning>): VisionWarning => ({
	id: 'success/destructive',
	group: 'status',
	labels: ['Success', 'Danger'],
	types: ['deuteranopia'],
	modes: ['light'],
	worst: {
		type: 'deuteranopia',
		mode: 'light',
		colors: ['#16a34a', '#dc2626'],
		simulated: ['#888888', '#888888'],
	},
	difference: 0.03,
	...overrides,
})

describe('visionTokenGroups', () => {
	it('only reference known tokens', () => {
		for (const group of visionTokenGroups) {
			for (const { token } of group.tokens) expect(tokenNames).toContain(token)
		}
	})
})

describe('checkVision', () => {
	it('warns when success and danger look alike for green-blind users', () => {
		const warnings = checkVision(withStatus({ success: parseColor('#16a34a')!, danger: parseColor('#dc2626')! }))
		const pair = warnings.find((item) => item.id === 'success/destructive')
		expect(pair).toBeDefined()
		expect(pair!.types).toContain('deuteranopia')
		expect(pair!.labels).toEqual(['Success', 'Danger'])
		expect(pair!.worst.simulated).toHaveLength(2)
	})

	it('does not warn when status colors differ in lightness', () => {
		const warnings = checkVision(withStatus({ success: parseColor('#86efac')!, danger: parseColor('#991b1b')! }))
		expect(warnings.find((item) => item.id === 'success/destructive')).toBeUndefined()
	})

	it('lists each pair once, with types and modes in a fixed order', () => {
		const warnings = checkVision(withStatus({}))
		expect(new Set(warnings.map((item) => item.id)).size).toBe(warnings.length)
		for (const item of warnings) {
			expect(item.types.length).toBeGreaterThan(0)
			expect(item.modes.length).toBeGreaterThan(0)
			expect(item.modes).toEqual((['light', 'dark'] as const).filter((mode) => item.modes.includes(mode)))
			expect(item.types).not.toContain('achromatopsia')
		}
	})

	it('keeps single-brand chart colors apart', () => {
		expect(checkVision(withStatus({})).filter((item) => item.group === 'charts')).toEqual([])
	})
})

describe('describeVisionWarning', () => {
	it('names one group of users', () => {
		expect(describeVisionWarning(warning({}))).toBe('Success and Danger look alike for green-blind users')
	})

	it('joins several groups of users', () => {
		expect(describeVisionWarning(warning({ types: ['protanopia', 'deuteranopia'] }))).toBe(
			'Success and Danger look alike for red- and green-blind users',
		)
		expect(describeVisionWarning(warning({ types: ['protanopia', 'deuteranopia', 'tritanopia'] }))).toBe(
			'Success and Danger look alike for red-, green- and blue-blind users',
		)
	})
})
