import type { Oklch } from './color'
import { parseColorsParam } from './palette-url'

export function parseScalesParam(param: string | undefined): Oklch[] | null {
	const colors = parseColorsParam(param)
	return colors?.length ? colors : null
}
