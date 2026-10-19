import { converter, formatHex } from 'culori'
import { toHex } from './format'
import { toOklch, wrapHue } from './parse'
import type { ColorInput, Oklch } from './types'

export interface Hsv {
	h: number
	s: number
	v: number
}

const toHsvColor = converter('hsv')
const toRgbColor = converter('rgb')

const clampUnit = (value: number) => Math.min(1, Math.max(0, value))

export function toHsv(input: ColorInput, previous?: Hsv): Hsv {
	const { h, s, v } = toHsvColor(toHex(input))!
	const brightness = clampUnit(v)
	const saturation = clampUnit(s)
	const hasHue = h !== undefined && saturation > 0 && brightness > 0
	return {
		h: hasHue ? wrapHue(h) : (previous?.h ?? 0),
		s: brightness > 0 ? saturation : (previous?.s ?? 0),
		v: brightness,
	}
}

export function hsvToHex({ h, s, v }: Hsv) {
	return formatHex(toRgbColor({ mode: 'hsv', h: wrapHue(h), s: clampUnit(s), v: clampUnit(v) }))
}

export function fromHsv(hsv: Hsv): Oklch {
	return toOklch(hsvToHex(hsv))
}

export function pureHue(h: number) {
	return hsvToHex({ h, s: 1, v: 1 })
}
