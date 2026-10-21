import { converter, formatHex } from 'culori'
import { colorDifference } from './difference'
import { toHex } from './format'
import type { ColorInput } from './types'

export const visionTypes = ['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'] as const
export type VisionType = (typeof visionTypes)[number]
export type ColorBlindVision = Exclude<VisionType, 'normal'>

export interface VisionInfo {
	label: string
	people: string
	description: string
}

export const visionInfo: Record<VisionType, VisionInfo> = {
	normal: {
		label: 'Normal vision',
		people: 'people with typical color vision',
		description: 'Colors as most people see them',
	},
	protanopia: {
		label: 'Red-blind',
		people: 'red-blind users',
		description: 'Protanopia: reds look darker and blend with greens',
	},
	deuteranopia: {
		label: 'Green-blind',
		people: 'green-blind users',
		description: 'Deuteranopia: greens and reds blend, the most common type',
	},
	tritanopia: {
		label: 'Blue-blind',
		people: 'blue-blind users',
		description: 'Tritanopia: blues blend with greens, yellows with pinks',
	},
	achromatopsia: {
		label: 'No color',
		people: 'users who see no color',
		description: 'Achromatopsia: only lightness, no hue',
	},
}

export const dichromacies = ['protanopia', 'deuteranopia', 'tritanopia'] as const satisfies readonly ColorBlindVision[]

type Matrix = readonly [
	readonly [number, number, number],
	readonly [number, number, number],
	readonly [number, number, number],
]

const machadoMatrices: Record<(typeof dichromacies)[number], Matrix> = {
	protanopia: [
		[0.152286, 1.052583, -0.204868],
		[0.114503, 0.786281, 0.099216],
		[-0.003882, -0.048116, 1.051998],
	],
	deuteranopia: [
		[0.367322, 0.860646, -0.227968],
		[0.280085, 0.672501, 0.047413],
		[-0.01182, 0.04294, 0.968881],
	],
	tritanopia: [
		[1.255528, -0.076749, -0.178779],
		[-0.078411, 0.930809, 0.147602],
		[0.004733, 0.691367, 0.3039],
	],
}

const luminanceWeights = [0.2126729, 0.7151522, 0.072175] as const

const toLinearRgb = converter('lrgb')
const clampUnit = (value: number) => Math.min(1, Math.max(0, value))

export function isVisionType(value: string): value is VisionType {
	return (visionTypes as readonly string[]).includes(value)
}

export function simulateVision(color: ColorInput, type: VisionType): string {
	const hex = toHex(color)
	if (type === 'normal') return hex
	const { r, g, b } = toLinearRgb(hex)!
	const channels = [r, g, b] as const
	if (type === 'achromatopsia') {
		const luminance = luminanceWeights.reduce((sum, weight, index) => sum + weight * channels[index]!, 0)
		return formatHex({ mode: 'lrgb', r: luminance, g: luminance, b: luminance })
	}
	const [red, green, blue] = machadoMatrices[type].map((row) =>
		clampUnit(row.reduce((sum, weight, index) => sum + weight * channels[index]!, 0)),
	)
	return formatHex({ mode: 'lrgb', r: red!, g: green!, b: blue! })
}

export const confusableDifference = 0.08
export const distinctDifference = 0.12

export interface VisionColor {
	id: string
	label: string
	hex: string
}

export interface ConfusablePair {
	a: VisionColor
	b: VisionColor
	type: ColorBlindVision
	difference: number
	simulated: readonly [string, string]
}

export function findConfusablePairs(
	colors: readonly VisionColor[],
	type: ColorBlindVision,
	threshold = confusableDifference,
): ConfusablePair[] {
	const simulated = colors.map((color) => simulateVision(color.hex, type))
	const pairs: ConfusablePair[] = []
	for (let first = 0; first < colors.length; first++) {
		for (let second = first + 1; second < colors.length; second++) {
			const a = colors[first]!
			const b = colors[second]!
			if (colorDifference(a.hex, b.hex) < distinctDifference) continue
			const difference = colorDifference(simulated[first]!, simulated[second]!)
			if (difference < threshold) {
				pairs.push({ a, b, type, difference, simulated: [simulated[first]!, simulated[second]!] })
			}
		}
	}
	return pairs
}
