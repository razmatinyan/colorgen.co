import { describe, expect, it } from 'vitest'
import { colorDifference } from './difference'

describe('colorDifference', () => {
	it('is zero for the same color in any notation', () => {
		expect(colorDifference('#1f6cb0', 'rgb(31 108 176)')).toBeLessThan(1e-6)
		expect(colorDifference('#808080', 'grey')).toBeLessThan(1e-6)
	})

	it('is one between black and white', () => {
		expect(colorDifference('#000000', '#ffffff')).toBeCloseTo(1, 3)
	})

	it('is symmetric and grows with the visible change', () => {
		const near = colorDifference('#1f6cb0', '#2070b4')
		const far = colorDifference('#1f6cb0', '#b01f6c')
		expect(colorDifference('#2070b4', '#1f6cb0')).toBeCloseTo(near)
		expect(near).toBeLessThan(0.02)
		expect(far).toBeGreaterThan(0.2)
	})

	it('treats hue as irrelevant for grays', () => {
		expect(colorDifference({ l: 0.5, c: 0, h: 0 }, { l: 0.5, c: 0, h: 200 })).toBe(0)
	})
})
