import { generateNeutralScale } from './neutral'
import { generateScale, nearestStepIndex, scaleSteps, type ScaleStep, type ScaleSwatch } from './scale'
import { statusKinds, suggestStatusColors, type StatusKind } from './status'
import type { Oklch } from './types'

export const systemColorIds = ['brand', 'neutral', ...statusKinds] as const
export type SystemColorId = typeof systemColorIds[number]

export interface SystemSettings {
	brand: Oklch
	neutralTint: number
	status: Partial<Record<StatusKind, Oklch>>
}

export interface SystemScale {
	id: SystemColorId
	base: Oklch
	anchorStep: ScaleStep | null
	swatches: ScaleSwatch[]
}

export type ColorSystem = Record<SystemColorId, SystemScale>

const neutralBaseIndex = scaleSteps.indexOf(500)

function anchoredScale(id: SystemColorId, base: Oklch): SystemScale {
	return { id, base, anchorStep: scaleSteps[nearestStepIndex(base.l)]!, swatches: generateScale(base) }
}

export function generateSystem({ brand, neutralTint, status }: SystemSettings): ColorSystem {
	const suggested = suggestStatusColors(brand)
	const neutralSwatches = generateNeutralScale(brand, neutralTint)
	return {
		brand: anchoredScale('brand', brand),
		neutral: { id: 'neutral', base: neutralSwatches[neutralBaseIndex]!.color, anchorStep: null, swatches: neutralSwatches },
		...Object.fromEntries(statusKinds.map(kind => [kind, anchoredScale(kind, status[kind] ?? suggested[kind])])) as Record<StatusKind, SystemScale>,
	}
}
