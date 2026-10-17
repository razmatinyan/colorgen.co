import { apcaContrast, wcagRatio } from './contrast'
import { toGamutOklch, toHex } from './format'
import { normalize, toOklch } from './parse'
import type { ColorInput, Oklch } from './types'

export const wcagCriteria = [
	{ id: 'body-aa', label: 'Body text', level: 'AA', criterion: '1.4.3', minRatio: 4.5 },
	{ id: 'large-aa', label: 'Large text', level: 'AA', criterion: '1.4.3', minRatio: 3 },
	{ id: 'ui-aa', label: 'Icons and borders', level: 'AA', criterion: '1.4.11', minRatio: 3 },
	{ id: 'body-aaa', label: 'Body text', level: 'AAA', criterion: '1.4.6', minRatio: 7 },
	{ id: 'large-aaa', label: 'Large text', level: 'AAA', criterion: '1.4.6', minRatio: 4.5 },
] as const

export type WcagCriterion = typeof wcagCriteria[number]
export type WcagCriterionId = WcagCriterion['id']

export const apcaUsages = [
	{ id: 'fluent', minLc: 90, label: 'Ideal for body text' },
	{ id: 'body', minLc: 75, label: 'Body text' },
	{ id: 'content', minLc: 60, label: 'Content text 16px and up' },
	{ id: 'large', minLc: 45, label: 'Large text and headings' },
	{ id: 'spot', minLc: 30, label: 'Placeholders and disabled text' },
	{ id: 'non-text', minLc: 15, label: 'Dividers and decoration only' },
	{ id: 'invisible', minLc: 0, label: 'Not readable' },
] as const

export type ApcaUsage = typeof apcaUsages[number]

export function apcaUsage(lc: number): ApcaUsage {
	const magnitude = Math.abs(lc)
	return apcaUsages.find(usage => magnitude >= usage.minLc) ?? apcaUsages.at(-1)!
}

export interface ContrastCheck {
	ratio: number
	lc: number
	usage: ApcaUsage
	criteria: (WcagCriterion & { passes: boolean })[]
}

export function checkContrast(text: ColorInput, background: ColorInput): ContrastCheck {
	const ratio = wcagRatio(text, background)
	const lc = apcaContrast(text, background)
	return {
		ratio,
		lc,
		usage: apcaUsage(lc),
		criteria: wcagCriteria.map(criterion => ({ ...criterion, passes: ratio >= criterion.minRatio })),
	}
}

export interface ContrastFix {
	color: Oklch
	hex: string
	ratio: number
}

const searchSteps = 32
const nudgeStep = 0.002

function withLightness(color: Oklch, l: number) {
	return normalize(toGamutOklch({ ...color, l }))
}

function passes(color: Oklch, against: string, minRatio: number) {
	return wcagRatio(toHex(color), against) >= minRatio
}

function searchTowards(color: Oklch, against: string, minRatio: number, limit: 0 | 1): Oklch | null {
	if (!passes(withLightness(color, limit), against, minRatio)) return null
	let near = color.l
	let far: number = limit
	for (let step = 0; step < searchSteps; step++) {
		const middle = (near + far) / 2
		if (passes(withLightness(color, middle), against, minRatio)) far = middle
		else near = middle
	}
	let l = far
	while (!passes(withLightness(color, l), against, minRatio) && l !== limit) {
		l = limit === 0 ? Math.max(0, l - nudgeStep) : Math.min(1, l + nudgeStep)
	}
	return withLightness(color, l)
}

export function findContrastFix(colorInput: ColorInput, againstInput: ColorInput, minRatio: number): ContrastFix | null {
	const color = toOklch(colorInput)
	const against = toHex(againstInput)
	const candidates = [searchTowards(color, against, minRatio, 0), searchTowards(color, against, minRatio, 1)]
		.filter((candidate): candidate is Oklch => candidate !== null)
		.sort((a, b) => Math.abs(a.l - color.l) - Math.abs(b.l - color.l))
	const best = candidates[0]
	if (!best) return null
	const hex = toHex(best)
	return { color: best, hex, ratio: wcagRatio(hex, against) }
}
