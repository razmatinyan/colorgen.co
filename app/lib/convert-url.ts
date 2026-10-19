import { isInGamut, normalize, toHex, type Oklch } from './color'
import { parseHexPart, toHexPart } from './palette-url'

const exactSeparator = ','
const maxChroma = 0.5

export interface ConvertTarget {
	param: string
	query: Record<string, string>
}

function round(value: number, digits: number) {
	return String(Number(value.toFixed(digits)) + 0)
}

export function parseExactOklch(value: string | undefined, pathColor: Oklch): Oklch | null {
	const parts = value?.split(exactSeparator) ?? []
	if (parts.length !== 3 || parts.some((part) => !/^-?\d+(?:\.\d+)?$/.test(part))) return null
	const [l, c, h] = parts.map(Number) as [number, number, number]
	if (l < 0 || l > 1 || c < 0 || c > maxChroma || h < 0 || h >= 360) return null
	const exact = normalize({ l, c, h })
	return toHex(exact) === toHex(pathColor) ? exact : null
}

export function parseConvertRoute(param: string | undefined, exact: string | undefined): Oklch | null {
	const pathColor = parseHexPart(param)
	if (!pathColor) return null
	return parseExactOklch(exact, pathColor) ?? pathColor
}

export function toConvertTarget(color: Oklch): ConvertTarget {
	const param = toHexPart(color)
	if (isInGamut(color)) return { param, query: {} }
	return { param, query: { oklch: [round(color.l, 4), round(color.c, 4), round(color.h, 2)].join(exactSeparator) } }
}
