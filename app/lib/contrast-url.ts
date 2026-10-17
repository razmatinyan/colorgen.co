import type { Oklch } from './color'
import { parseColorsParam, toColorsParam } from './palette-url'

export interface ContrastPair {
	text: Oklch
	background: Oklch
}

export function parseContrastParam(param: string | undefined): ContrastPair | null {
	const colors = parseColorsParam(param)
	if (!colors || colors.length !== 2) return null
	return { text: colors[0]!, background: colors[1]! }
}

export function toContrastParam({ text, background }: ContrastPair) {
	return toColorsParam([text, background])
}
