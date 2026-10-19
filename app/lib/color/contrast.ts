import { converter, wcagContrast } from 'culori'
import { toHex } from './format'
import type { ColorInput } from './types'

const toRgb = converter('rgb')

export function wcagRatio(a: ColorInput, b: ColorInput) {
	return wcagContrast(toHex(a), toHex(b))
}

export type WcagLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail'

export function wcagLevel(ratio: number): WcagLevel {
	if (ratio >= 7) return 'AAA'
	if (ratio >= 4.5) return 'AA'
	if (ratio >= 3) return 'AA Large'
	return 'Fail'
}

const APCA = {
	exponent: 2.4,
	coefficients: [0.2126729, 0.7151522, 0.072175] as const,
	normBg: 0.56,
	normText: 0.57,
	revText: 0.62,
	revBg: 0.65,
	blackThreshold: 0.022,
	blackClamp: 1.414,
	scale: 1.14,
	offset: 0.027,
	deltaYMin: 0.0005,
	lowClip: 0.1,
}

function apcaLuminance(input: ColorInput) {
	const { r, g, b } = toRgb(toHex(input))!
	const [kr, kg, kb] = APCA.coefficients
	return kr * r ** APCA.exponent + kg * g ** APCA.exponent + kb * b ** APCA.exponent
}

function softClampBlack(y: number) {
	return y > APCA.blackThreshold ? y : y + (APCA.blackThreshold - y) ** APCA.blackClamp
}

export function apcaContrast(text: ColorInput, background: ColorInput) {
	const textY = softClampBlack(apcaLuminance(text))
	const backgroundY = softClampBlack(apcaLuminance(background))
	if (Math.abs(backgroundY - textY) < APCA.deltaYMin) return 0

	if (backgroundY > textY) {
		const sapc = (backgroundY ** APCA.normBg - textY ** APCA.normText) * APCA.scale
		return sapc < APCA.lowClip ? 0 : (sapc - APCA.offset) * 100
	}
	const sapc = (backgroundY ** APCA.revBg - textY ** APCA.revText) * APCA.scale
	return sapc > -APCA.lowClip ? 0 : (sapc + APCA.offset) * 100
}

export const lightText = '#ffffff'
export const darkText = '#111114'

export function readableTextColor(background: ColorInput) {
	return Math.abs(apcaContrast(lightText, background)) >= Math.abs(apcaContrast(darkText, background))
		? lightText
		: darkText
}
