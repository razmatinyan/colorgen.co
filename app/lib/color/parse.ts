import { converter, parse } from 'culori'
import type { ColorInput, Oklch } from './types'

const toOklchColor = converter('oklch')
const bareHex = /^(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export function parseColor(input: string): Oklch | null {
	const value = input.trim()
	if (!value) return null
	const parsed = parse(bareHex.test(value) ? `#${value}` : value)
	if (!parsed) return null
	const { l, c, h } = toOklchColor(parsed)
	return normalize({ l, c, h: h ?? 0 })
}

export function toOklch(input: ColorInput): Oklch {
	if (typeof input !== 'string') return input
	const color = parseColor(input)
	if (!color) throw new Error(`Invalid color: "${input}"`)
	return color
}

export function normalize({ l, c, h }: Oklch): Oklch {
	return {
		l: Math.min(1, Math.max(0, l)),
		c: Math.max(0, c),
		h: c < 1e-4 ? 0 : wrapHue(h),
	}
}

export function wrapHue(h: number) {
	return ((h % 360) + 360) % 360
}

export function hueDifference(from: number, to: number) {
	return ((((to - from) % 360) + 540) % 360) - 180
}
