import { describe, expect, it } from 'vitest'
import { parseColor, sampleGradient } from '../color'
import {
	toCssGradient,
	toFallbackGradient,
	toGradientCss,
	toNumberedVariables,
	toTailwindGradient,
	type GradientExport,
} from './gradient'

const blue = parseColor('#1f6cb0')!
const yellow = parseColor('#facc15')!
const white = parseColor('#ffffff')!
const linear: GradientExport = { stops: [blue, yellow], type: 'linear', angle: 90, space: 'oklch' }

describe('toCssGradient', () => {
	it('writes the interpolation space and angle', () => {
		expect(toCssGradient(linear)).toBe('linear-gradient(90deg in oklch, #1f6cb0, #facc15)')
	})

	it('leaves sRGB as the CSS default', () => {
		expect(toCssGradient({ ...linear, space: 'srgb' })).toBe('linear-gradient(90deg, #1f6cb0, #facc15)')
	})

	it('writes radial and conic gradients', () => {
		expect(toCssGradient({ ...linear, type: 'radial', space: 'oklab' })).toBe(
			'radial-gradient(circle in oklab, #1f6cb0, #facc15)',
		)
		expect(toCssGradient({ ...linear, type: 'conic', angle: 45 })).toBe(
			'conic-gradient(from 45deg in oklch, #1f6cb0, #facc15)',
		)
	})

	it('can write OKLCH stops', () => {
		expect(toCssGradient(linear, 'oklch')).toMatch(/^linear-gradient\(90deg in oklch, oklch\(.+\), oklch\(.+\)\)$/)
	})
})

describe('toFallbackGradient', () => {
	it('approximates the blend with evenly placed sRGB stops', () => {
		const fallback = toFallbackGradient(linear)
		expect(fallback.startsWith('linear-gradient(90deg, #1f6cb0 0%, ')).toBe(true)
		expect(fallback.endsWith('#facc15 100%)')).toBe(true)
		expect(fallback.match(/#[0-9a-f]{6}/g)).toHaveLength(9)
		expect(fallback).not.toContain(' in ')
	})

	it('adds samples for every segment', () => {
		expect(toFallbackGradient({ ...linear, stops: [blue, white, yellow] }).match(/#[0-9a-f]{6}/g)).toHaveLength(17)
	})
})

describe('toGradientCss', () => {
	it('puts the fallback first so modern browsers use the exact blend', () => {
		const css = toGradientCss(linear)
		const lines = css.trim().split('\n')
		expect(lines[0]).toBe('.gradient {')
		expect(lines[1]).toContain('linear-gradient(90deg, #1f6cb0 0%')
		expect(lines[2]).toBe('  background: linear-gradient(90deg in oklch, #1f6cb0, #facc15);')
		expect(lines[3]).toBe('}')
	})

	it('needs no fallback for sRGB', () => {
		expect(toGradientCss({ ...linear, space: 'srgb' })).toBe(
			'.gradient {\n  background: linear-gradient(90deg, #1f6cb0, #facc15);\n}\n',
		)
	})
})

describe('toTailwindGradient', () => {
	it('uses gradient utilities for up to three colors', () => {
		expect(toTailwindGradient(linear)).toBe('bg-linear-90/oklch from-[#1f6cb0] to-[#facc15]')
		expect(toTailwindGradient({ ...linear, stops: [blue, white, yellow], type: 'radial', space: 'srgb' })).toBe(
			'bg-radial/srgb from-[#1f6cb0] via-[#ffffff] to-[#facc15]',
		)
		expect(toTailwindGradient({ ...linear, type: 'conic', angle: 180 })).toBe(
			'bg-conic-180/oklch from-[#1f6cb0] to-[#facc15]',
		)
	})

	it('falls back to an arbitrary value for more colors', () => {
		expect(toTailwindGradient({ ...linear, stops: [blue, white, yellow, blue] })).toBe(
			'bg-[linear-gradient(90deg_in_oklch,_#1f6cb0,_#ffffff,_#facc15,_#1f6cb0)]',
		)
	})
})

describe('toNumberedVariables', () => {
	it('numbers every step', () => {
		const steps = sampleGradient([blue, yellow], 3, 'oklch')
		const css = toNumberedVariables(steps)
		expect(css.split('\n')[0]).toBe(':root {')
		expect(css).toContain('  --gradient-1: #1f6cb0;')
		expect(css).toContain('  --gradient-3: #facc15;')
	})

	it('takes hex strings and a custom name', () => {
		expect(toNumberedVariables(['#1f6cb0'], 'hex', 'image')).toBe(':root {\n  --image-1: #1f6cb0;\n}\n')
	})
})
