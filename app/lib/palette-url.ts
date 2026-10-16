import { parseColor, toHex, type Oklch } from './color'

const hexPart = /^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function parseColorsParam(param: string | undefined): Oklch[] | null {
	if (!param) return null
	const parts = param.split('-')
	if (!parts.every(part => hexPart.test(part))) return null
	return parts.map(part => parseColor(part)!)
}

export function toColorsParam(colors: readonly Oklch[]) {
	return colors.map(color => toHex(color).slice(1)).join('-')
}
