import { generateNeutralScale } from './neutral'
import { generateScale, nearestStepIndex, scaleSteps, type ScaleStep, type ScaleSwatch } from './scale'
import { statusKinds, suggestStatusColors, type StatusKind } from './status'
import type { Oklch } from './types'

export const systemColorIds = ['brand', 'brand2', 'neutral', ...statusKinds] as const
export type SystemColorId = typeof systemColorIds[number]

export interface SystemSettings {
	brand: Oklch
	brand2: Oklch | null
	neutralTint: number
	status: Partial<Record<StatusKind, Oklch>>
}

export interface SystemScale {
	id: SystemColorId
	base: Oklch
	anchorStep: ScaleStep | null
	swatches: ScaleSwatch[]
}

export type ColorSystem = Record<Exclude<SystemColorId, 'brand2'>, SystemScale> & { brand2: SystemScale | null }

const neutralBaseIndex = scaleSteps.indexOf(500)

function anchoredScale(id: SystemColorId, base: Oklch): SystemScale {
	return { id, base, anchorStep: scaleSteps[nearestStepIndex(base.l)]!, swatches: generateScale(base) }
}

export function generateSystem({ brand, brand2, neutralTint, status }: SystemSettings): ColorSystem {
	const suggested = suggestStatusColors(brand)
	const neutralSwatches = generateNeutralScale(brand, neutralTint)
	return {
		brand: anchoredScale('brand', brand),
		brand2: brand2 ? anchoredScale('brand2', brand2) : null,
		neutral: { id: 'neutral', base: neutralSwatches[neutralBaseIndex]!.color, anchorStep: null, swatches: neutralSwatches },
		...Object.fromEntries(statusKinds.map(kind => [kind, anchoredScale(kind, status[kind] ?? suggested[kind])])) as Record<StatusKind, SystemScale>,
	}
}

export function systemScales(system: ColorSystem): SystemScale[] {
	return systemColorIds.map(id => system[id]).filter((scale): scale is SystemScale => scale !== null)
}
