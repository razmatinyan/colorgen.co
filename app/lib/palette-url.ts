import { parseColor, toHex, type Oklch } from './color'

const hexPart = /^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function parseHexPart(part: string | undefined): Oklch | null {
	return part && hexPart.test(part) ? parseColor(part) : null
}

export function toHexPart(color: Oklch) {
	return toHex(color).slice(1)
}

export function parseColorsParam(param: string | undefined): Oklch[] | null {
	if (!param) return null
	const colors = param.split('-').map(parseHexPart)
	return colors.every(color => color !== null) ? colors : null
}

export function toColorsParam(colors: readonly Oklch[]) {
	return colors.map(toHexPart).join('-')
}
