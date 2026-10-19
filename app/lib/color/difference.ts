import { toOklch } from './parse'
import type { ColorInput } from './types'

function toOklabComponents(input: ColorInput) {
	const { l, c, h } = toOklch(input)
	const radians = (h * Math.PI) / 180
	return [l, c * Math.cos(radians), c * Math.sin(radians)] as const
}

export function colorDifference(a: ColorInput, b: ColorInput) {
	const [l1, a1, b1] = toOklabComponents(a)
	const [l2, a2, b2] = toOklabComponents(b)
	return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}
