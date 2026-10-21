import { generateNeutralScale } from './neutral'
import { generateScale, nearestStepIndex, scaleSteps, type ScaleStep, type ScaleSwatch } from './scale'
import { statusKinds, suggestStatusColors, type StatusKind } from './status'
import type { Oklch } from './types'

export const fixedColorIds = ['brand', 'neutral', ...statusKinds] as const
export type FixedColorId = (typeof fixedColorIds)[number]
export type ExtraColorId = `brand${number}`
export type SystemColorId = FixedColorId | ExtraColorId

const extraColorIdPattern = /^brand([2-9]|[1-9]\d+)$/

export function extraColorId(index: number): ExtraColorId {
	return `brand${index + 2}`
}

export function extraColorIndex(id: string): number | null {
	const match = extraColorIdPattern.exec(id)
	return match ? Number(match[1]) - 2 : null
}

export function isSystemColorId(value: string): value is SystemColorId {
	return (fixedColorIds as readonly string[]).includes(value) || extraColorIndex(value) !== null
}

export interface SystemSettings {
	brand: Oklch
	extras: Oklch[]
	neutralTint: number
	neutralHue?: number | null
	status: Partial<Record<StatusKind, Oklch>>
}

export interface SystemScale {
	id: SystemColorId
	base: Oklch
	anchorStep: ScaleStep | null
	swatches: ScaleSwatch[]
}

export type ColorSystem = Record<FixedColorId, SystemScale> & { extras: SystemScale[] }

const neutralBaseIndex = scaleSteps.indexOf(500)

function anchoredScale(id: SystemColorId, base: Oklch): SystemScale {
	return { id, base, anchorStep: scaleSteps[nearestStepIndex(base.l)]!, swatches: generateScale(base) }
}

export function generateSystem({ brand, extras, neutralTint, neutralHue = null, status }: SystemSettings): ColorSystem {
	const suggested = suggestStatusColors(brand)
	const neutralSwatches = generateNeutralScale(brand, neutralTint, neutralHue)
	return {
		brand: anchoredScale('brand', brand),
		extras: extras.map((color, index) => anchoredScale(extraColorId(index), color)),
		neutral: {
			id: 'neutral',
			base: neutralSwatches[neutralBaseIndex]!.color,
			anchorStep: null,
			swatches: neutralSwatches,
		},
		...(Object.fromEntries(
			statusKinds.map((kind) => [kind, anchoredScale(kind, status[kind] ?? suggested[kind])]),
		) as Record<StatusKind, SystemScale>),
	}
}

export function systemScale(system: ColorSystem, id: SystemColorId): SystemScale | null {
	const index = extraColorIndex(id)
	if (index !== null) return system.extras[index] ?? null
	return system[id as FixedColorId]
}

export function systemScales(system: ColorSystem): SystemScale[] {
	return [system.brand, ...system.extras, system.neutral, ...statusKinds.map((kind) => system[kind])]
}
