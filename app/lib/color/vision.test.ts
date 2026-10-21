import { describe, expect, it } from 'vitest'
import { wcagRatio } from './contrast'
import { colorDifference } from './difference'
import { toOklch } from './parse'
import {
	confusableDifference,
	dichromacies,
	findConfusablePairs,
	isVisionType,
	simulateVision,
	visionInfo,
	visionTypes,
} from './vision'

describe('visionTypes', () => {
	it('has a label and description for every type', () => {
		for (const type of visionTypes) {
			expect(visionInfo[type].label).not.toBe('')
			expect(visionInfo[type].description).not.toBe('')
		}
	})

	it('recognizes valid types only', () => {
		expect(isVisionType('deuteranopia')).toBe(true)
		expect(isVisionType('normal')).toBe(true)
		expect(isVisionType('colorblind')).toBe(false)
	})
})

describe('simulateVision', () => {
	it('returns the normalized hex for normal vision', () => {
		expect(simulateVision('#1F6CB0', 'normal')).toBe('#1f6cb0')
		expect(simulateVision({ l: 0.5, c: 0, h: 0 }, 'normal')).toBe(simulateVision('oklch(0.5 0 0)', 'normal'))
	})

	it('keeps black, white and grays unchanged', () => {
		for (const type of visionTypes) {
			for (const gray of ['#000000', '#ffffff', '#808080', '#404040']) {
				expect(colorDifference(simulateVision(gray, type), gray)).toBeLessThan(0.01)
			}
		}
	})

	it('removes all hue for achromatopsia and keeps the luminance', () => {
		for (const color of ['#e11d48', '#16a34a', '#facc15', '#2563eb']) {
			const simulated = simulateVision(color, 'achromatopsia')
			expect(toOklch(simulated).c).toBeLessThan(0.002)
			expect(wcagRatio(simulated, '#000000')).toBeCloseTo(wcagRatio(color, '#000000'), 1)
		}
	})

	it('makes red darker for red-blind vision', () => {
		const simulated = simulateVision('#ff0000', 'protanopia')
		expect(wcagRatio(simulated, '#000000')).toBeLessThan(wcagRatio('#ff0000', '#000000'))
		expect(simulated).toMatch(/^#[0-9a-f]{6}$/)
	})

	it('turns red and green into similar colors for green-blind vision', () => {
		const normal = colorDifference('#dc2626', '#16a34a')
		const simulated = colorDifference(
			simulateVision('#dc2626', 'deuteranopia'),
			simulateVision('#16a34a', 'deuteranopia'),
		)
		expect(normal).toBeGreaterThan(0.3)
		expect(simulated).toBeLessThan(confusableDifference)
	})

	it('accepts out-of-gamut input and always returns sRGB hex', () => {
		for (const type of visionTypes) {
			expect(simulateVision({ l: 0.7, c: 0.4, h: 145 }, type)).toMatch(/^#[0-9a-f]{6}$/)
		}
	})

	it('throws for invalid strings', () => {
		expect(() => simulateVision('not a color', 'protanopia')).toThrow()
	})
})

describe('findConfusablePairs', () => {
	const colors = [
		{ id: 'success', label: 'Success', hex: '#16a34a' },
		{ id: 'danger', label: 'Danger', hex: '#dc2626' },
		{ id: 'info', label: 'Info', hex: '#0284c7' },
	]

	it('finds red and green for green-blind vision', () => {
		const pairs = findConfusablePairs(colors, 'deuteranopia')
		expect(pairs.map((pair) => `${pair.a.id}/${pair.b.id}`)).toEqual(['success/danger'])
		expect(pairs[0]!.simulated).toHaveLength(2)
		expect(pairs[0]!.difference).toBeLessThan(confusableDifference)
	})

	it('finds green and blue for blue-blind vision', () => {
		const pairs = findConfusablePairs(colors, 'tritanopia')
		expect(pairs.map((pair) => `${pair.a.id}/${pair.b.id}`)).toEqual(['success/info'])
	})

	it('keeps blue and orange apart for every type', () => {
		for (const type of dichromacies) {
			expect(
				findConfusablePairs(
					[
						{ id: 'a', label: 'Blue', hex: '#1f6cb0' },
						{ id: 'b', label: 'Orange', hex: '#f68443' },
					],
					type,
				),
			).toEqual([])
		}
	})

	it('ignores colors that already look alike in normal vision', () => {
		const similar = [
			{ id: 'a', label: 'A', hex: '#2563eb' },
			{ id: 'b', label: 'B', hex: '#2766ee' },
		]
		expect(findConfusablePairs(similar, 'deuteranopia')).toEqual([])
	})

	it('returns nothing for fewer than two colors', () => {
		expect(findConfusablePairs([], 'protanopia')).toEqual([])
		expect(findConfusablePairs([colors[0]!], 'protanopia')).toEqual([])
	})
})
