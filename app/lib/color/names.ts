import { toOklch } from './parse'
import type { ColorInput } from './types'

const hueNames: readonly [maxHue: number, name: string][] = [
	[15, 'rose'],
	[50, 'red'],
	[80, 'orange'],
	[115, 'yellow'],
	[160, 'green'],
	[205, 'teal'],
	[240, 'sky blue'],
	[275, 'blue'],
	[305, 'violet'],
	[345, 'purple'],
	[360, 'rose'],
]

const achromaticChroma = 0.025

function hueName(hue: number) {
	return hueNames.find(([maxHue]) => hue < maxHue)?.[1] ?? 'rose'
}

function grayName(lightness: number) {
	if (lightness > 0.97) return 'white'
	if (lightness < 0.15) return 'black'
	if (lightness > 0.75) return 'light gray'
	if (lightness < 0.4) return 'dark gray'
	return 'gray'
}

function shadeWords(lightness: number, chroma: number) {
	const words: string[] = []
	if (lightness > 0.9 && chroma < 0.08) words.push('pale')
	else if (lightness > 0.8 && chroma < 0.15) words.push('light')
	else if (lightness < 0.28) words.push('deep')
	else if (lightness < 0.4) words.push('dark')
	if (chroma < 0.06) words.push('muted')
	return words
}

function capitalize(text: string) {
	return text.charAt(0).toUpperCase() + text.slice(1)
}

export function describeColor(input: ColorInput) {
	const { l, c, h } = toOklch(input)
	if (c < achromaticChroma) return capitalize(grayName(l))
	return capitalize([...shadeWords(l, c), hueName(h)].join(' '))
}

export function colorFamily(input: ColorInput) {
	const { c, h } = toOklch(input)
	return c < achromaticChroma ? 'gray' : hueName(h)
}
