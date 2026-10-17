import { describe, expect, it } from 'vitest'
import { extractColors, suggestBrandColor } from './extract'
import { createRng } from './random'

type Rgba = [number, number, number, number]

function image(parts: [color: Rgba, pixels: number][]) {
	const data: number[] = []
	for (const [color, pixels] of parts) {
		for (let index = 0; index < pixels; index++) data.push(...color)
	}
	return Uint8ClampedArray.from(data)
}

const red: Rgba = [220, 38, 38, 255]
const blue: Rgba = [31, 108, 176, 255]
const white: Rgba = [255, 255, 255, 255]
const gray: Rgba = [128, 128, 128, 255]
const black: Rgba = [0, 0, 0, 255]
const clear: Rgba = [255, 0, 0, 0]

describe('extractColors', () => {
	it('finds the colors and their shares, largest first', () => {
		const colors = extractColors(image([[red, 700], [blue, 300]]), { count: 4 })
		expect(colors.map(color => color.hex)).toEqual(['#dc2626', '#1f6cb0'])
		expect(colors[0]!.share).toBeCloseTo(0.7, 2)
		expect(colors[1]!.share).toBeCloseTo(0.3, 2)
	})

	it('returns at most the requested count', () => {
		const pixels = image([[red, 300], [blue, 250], [white, 200], [gray, 150], [black, 100]])
		expect(extractColors(pixels, { count: 3 })).toHaveLength(3)
		expect(extractColors(pixels, { count: 5 })).toHaveLength(5)
	})

	it('merges nearly identical colors', () => {
		const colors = extractColors(image([[[31, 108, 176, 255], 500], [[33, 110, 178, 255], 500]]), { count: 4 })
		expect(colors).toHaveLength(1)
		expect(colors[0]!.share).toBeCloseTo(1, 5)
	})

	it('keeps a small vivid accent over another neutral', () => {
		const pixels = image([[white, 500], [gray, 250], [black, 200], [[90, 90, 90, 255], 30], [red, 20]])
		const hexes = extractColors(pixels, { count: 3 }).map(color => color.hex)
		expect(hexes).toContain('#dc2626')
	})

	it('ignores transparent pixels', () => {
		expect(extractColors(image([[clear, 800], [blue, 200]])).map(color => color.hex)).toEqual(['#1f6cb0'])
		expect(extractColors(image([[clear, 100]]))).toEqual([])
		expect(extractColors(new Uint8ClampedArray())).toEqual([])
	})

	it('is deterministic for the same seed', () => {
		const pixels = image([[red, 300], [blue, 250], [white, 200], [gray, 150], [black, 100]])
		expect(extractColors(pixels, { rng: createRng(7) })).toEqual(extractColors(pixels, { rng: createRng(7) }))
	})

	it('samples large images', () => {
		const colors = extractColors(image([[red, 60000], [blue, 40000]]), { maxSamples: 2000 })
		expect(colors[0]!.share).toBeCloseTo(0.6, 1)
	})
})

describe('suggestBrandColor', () => {
	it('prefers a colorful color that covers enough of the image', () => {
		const colors = extractColors(image([[white, 600], [blue, 300], [gray, 100]]))
		expect(suggestBrandColor(colors)!.hex).toBe('#1f6cb0')
	})

	it('returns null for black-and-white images', () => {
		expect(suggestBrandColor(extractColors(image([[white, 500], [black, 500]])))).toBeNull()
		expect(suggestBrandColor([])).toBeNull()
	})
})
