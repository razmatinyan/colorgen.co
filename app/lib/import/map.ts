import {
	colorDifference,
	defaultNeutralTint,
	estimateNeutral,
	extraColorId,
	fitNeutralScale,
	fitScaleBase,
	generateSystem,
	parseColor,
	resolveTokens,
	scaleRef,
	statusKinds,
	suggestStatusColor,
	systemScales,
	tokenModes,
	tokenNames,
	toHex,
	type Oklch,
	type ScaleStep,
	type StatusKind,
	type SystemColorId,
	type SystemSettings,
	type TokenMode,
	type TokenName,
	type TokenOverrides,
	type TokenRef,
} from '../color'
import { isScaleName, resolveExtraNames } from '../scale-names'
import type { RecognizedColor, RecognizedImport, RecognizedScale } from './recognize'

export interface ImportedSystem extends SystemSettings {
	neutralHue: number | null
	tokens: TokenOverrides
	extraNames: (string | null)[]
}

export interface ImportPick {
	id: SystemColorId
	source: string | null
}

export type TokenMatch = 'same' | 'close' | 'changed'

export interface TokenComparison {
	name: TokenName
	mode: TokenMode
	source: string
	imported: string
	result: string
	ref: TokenRef
	difference: number
	match: TokenMatch
}

export interface ImportResult {
	system: ImportedSystem
	picks: ImportPick[]
	comparisons: TokenComparison[]
	missingTokens: number
	hasDarkMode: boolean
}

export const sameColorDifference = 0.01
export const closeColorDifference = 0.04

const colorfulChroma = 0.05
const colorfulSecondaryChroma = 0.06
const colorfulAccentChroma = 0.08
const distinctBrandDifference = 0.05
const editedStatusDifference = 0.01
const brandSteps: ScaleStep[] = [400, 500, 600, 700]

const brandScaleNames = ['brand', 'primary', 'brand-1', 'brand1', 'main']
const secondBrandNames = ['secondary', 'brand-2', 'brand2', 'accent']
const neutralScaleNames = ['neutral', 'gray', 'grey', 'slate', 'zinc', 'stone', 'sand', 'mauve', 'olive', 'sage']
const statusScaleNames: Record<StatusKind, string[]> = {
	danger: ['danger', 'error', 'destructive', 'red', 'rose'],
	success: ['success', 'green', 'emerald'],
	warning: ['warning', 'amber', 'yellow', 'orange'],
	info: ['info', 'blue', 'sky', 'cyan'],
}
const statusOwnNames = [...statusKinds, 'error', 'destructive']
const statusTokens: Record<StatusKind, TokenName> = {
	danger: 'destructive',
	success: 'success',
	warning: 'warning',
	info: 'info',
}
const neutralTokens: TokenName[] = [
	'background',
	'foreground',
	'card',
	'popover',
	'muted',
	'muted-foreground',
	'border',
	'input',
	'secondary',
	'accent',
	'sidebar',
	'sidebar-accent',
	'sidebar-border',
]

interface Pick {
	color: Oklch
	source: string
	scale?: string
}

function scaleColors(scale: RecognizedScale) {
	return Object.values(scale.steps).filter((step): step is RecognizedColor => step !== undefined)
}

function mostColorfulStep(scale: RecognizedScale): RecognizedColor | null {
	const preferred = brandSteps.map((step) => scale.steps[step]).filter((step) => step !== undefined)
	const candidates = preferred.length ? preferred : scaleColors(scale)
	return candidates.reduce<RecognizedColor | null>(
		(best, step) => (!best || step.color.c > best.color.c ? step : best),
		null,
	)
}

function findScale(recognized: RecognizedImport, names: readonly string[]) {
	for (const name of names) {
		const scale = recognized.scales.find((candidate) => candidate.name === name)
		if (scale) return scale
	}
	return null
}

function findLoose(recognized: RecognizedImport, names: readonly string[]) {
	for (const name of names) {
		const color = recognized.loose.find((candidate) => candidate.name === name)
		if (color) return color
	}
	return null
}

function tokenColor(recognized: RecognizedImport, name: TokenName) {
	return recognized.tokens[name]?.light ?? recognized.tokens[name]?.dark ?? null
}

function stepColors(scale: RecognizedScale): Partial<Record<ScaleStep, Oklch>> {
	return Object.fromEntries(Object.entries(scale.steps).map(([step, value]) => [step, value!.color]))
}

function fromScale(scale: RecognizedScale | null): Pick | null {
	const step = scale && mostColorfulStep(scale)
	return step && scale ? { color: step.color, source: `${scale.name} scale`, scale: scale.name } : null
}

function fromColor(color: RecognizedColor | null): Pick | null {
	return color ? { color: color.color, source: color.source } : null
}

function pickBrand(recognized: RecognizedImport): Pick | null {
	const excluded = new Set([...neutralScaleNames, ...Object.values(statusScaleNames).flat()])
	const colorfulScale = (scales: RecognizedScale[]) =>
		fromScale(
			scales.reduce<RecognizedScale | null>((best, scale) => {
				const chroma = mostColorfulStep(scale)?.color.c ?? 0
				return chroma >= colorfulChroma && chroma > (best ? mostColorfulStep(best)!.color.c : 0) ? scale : best
			}, null),
		)
	const colorfulLoose = recognized.loose
		.filter((color) => color.color.c >= colorfulChroma)
		.reduce<RecognizedColor | null>((best, color) => (!best || color.color.c > best.color.c ? color : best), null)
	return (
		fromColor(tokenColor(recognized, 'primary')) ??
		fromScale(findScale(recognized, brandScaleNames)) ??
		fromColor(findLoose(recognized, brandScaleNames)) ??
		colorfulScale(recognized.scales.filter((scale) => !excluded.has(scale.name))) ??
		colorfulScale(recognized.scales) ??
		fromColor(colorfulLoose)
	)
}

function pickSecondBrand(recognized: RecognizedImport, brand: Pick): Pick | null {
	const colorful = (pick: Pick | null, minChroma: number) => (pick && pick.color.c >= minChroma ? pick : null)
	const candidate =
		colorful(fromColor(tokenColor(recognized, 'secondary')), colorfulSecondaryChroma) ??
		colorful(fromScale(findScale(recognized, secondBrandNames)), colorfulSecondaryChroma) ??
		colorful(fromColor(findLoose(recognized, secondBrandNames)), colorfulSecondaryChroma) ??
		colorful(fromColor(tokenColor(recognized, 'accent')), colorfulAccentChroma)
	return candidate && colorDifference(candidate.color, brand.color) >= distinctBrandDifference ? candidate : null
}

function pickNeutral(recognized: RecognizedImport, brand: Oklch) {
	const scale = findScale(recognized, neutralScaleNames)
	const tokenGrays = neutralTokens.flatMap((name) =>
		tokenModes.flatMap((mode) => {
			const color = recognized.tokens[name]?.[mode]
			return color ? [color.color] : []
		}),
	)
	const estimate = scale ? fitNeutralScale(stepColors(scale), brand) : estimateNeutral(tokenGrays, brand)
	if (!estimate) return { tint: defaultNeutralTint, hue: null, source: null }
	return {
		tint: Math.round(estimate.tint * 100) / 100,
		hue: estimate.hue,
		source: scale ? `${scale.name} scale` : 'your surface and border colors',
	}
}

function pickStatus(
	recognized: RecognizedImport,
	kind: StatusKind,
	brand: Oklch,
	usedScales: ReadonlySet<string>,
): Pick | null {
	const token = tokenColor(recognized, statusTokens[kind])
	if (token) return { color: token.color, source: token.source }
	const scale = statusScaleNames[kind]
		.map((name) => recognized.scales.find((candidate) => candidate.name === name))
		.find((candidate) => candidate && !usedScales.has(candidate.name))
	if (!scale) return null
	const target = suggestStatusColor(kind, brand).l
	const step = scaleColors(scale).reduce<RecognizedColor | null>(
		(best, candidate) =>
			!best || Math.abs(candidate.color.l - target) < Math.abs(best.color.l - target) ? candidate : best,
		null,
	)
	return step ? { color: step.color, source: step.source, scale: scale.name } : null
}

interface ExtraPick extends Pick {
	name: string | null
}

function pickExtras(
	recognized: RecognizedImport,
	picked: readonly Oklch[],
	second: Pick | null,
	usedScales: ReadonlySet<string>,
): ExtraPick[] {
	const excluded = new Set([...usedScales, ...brandScaleNames, ...neutralScaleNames, ...statusOwnNames])
	const extras: ExtraPick[] = second ? [{ ...second, name: null }] : []
	for (const scale of recognized.scales) {
		if (excluded.has(scale.name) || (mostColorfulStep(scale)?.color.c ?? 0) < colorfulChroma) continue
		const base = fitScaleBase(stepColors(scale))
		if (!base) continue
		const name = isScaleName(scale.name) ? scale.name : null
		const twin = extras.find((extra) => colorDifference(extra.color, base) < distinctBrandDifference)
		if (twin) {
			twin.name ??= name
			continue
		}
		if (picked.some((color) => colorDifference(color, base) < distinctBrandDifference)) continue
		extras.push({ color: base, source: `${scale.name} scale`, scale: scale.name, name })
	}
	return extras
}

function toMatch(difference: number): TokenMatch {
	if (difference < sameColorDifference) return 'same'
	return difference < closeColorDifference ? 'close' : 'changed'
}

function matchTokens(settings: SystemSettings, recognized: RecognizedImport) {
	const system = generateSystem(settings)
	const candidates = [
		{ ref: 'white' as TokenRef, hex: '#ffffff' },
		...systemScales(system).flatMap((scale) =>
			scale.swatches.map((swatch) => ({ ref: scaleRef(scale.id, swatch.step) as TokenRef, hex: swatch.hex })),
		),
	].map((candidate) => ({ ...candidate, color: parseColor(candidate.hex)! }))

	let overrides: TokenOverrides = {}
	const comparisons: TokenComparison[] = []
	let missingTokens = 0

	for (const name of tokenNames) {
		for (const mode of tokenModes) {
			const imported = recognized.tokens[name]?.[mode]
			if (!imported) {
				missingTokens++
				continue
			}
			const current = resolveTokens(system, overrides)[name][mode]
			const currentDifference = colorDifference(imported.color, current.hex)
			const nearest = candidates
				.map((candidate) => ({ ...candidate, difference: colorDifference(imported.color, candidate.color) }))
				.reduce((best, candidate) => (candidate.difference < best.difference ? candidate : best))
			const usesNearest = nearest.difference + 1e-6 < currentDifference
			if (usesNearest) overrides = { ...overrides, [name]: { ...overrides[name], [mode]: nearest.ref } }
			const difference = usesNearest ? nearest.difference : currentDifference
			comparisons.push({
				name,
				mode,
				source: imported.source,
				imported: toHex(imported.color),
				result: usesNearest ? nearest.hex : current.hex,
				ref: usesNearest ? nearest.ref : current.ref,
				difference,
				match: toMatch(difference),
			})
		}
	}
	return { overrides, comparisons, missingTokens }
}

function snapToHex<T extends { color: Oklch }>(pick: T): T {
	return { ...pick, color: parseColor(toHex(pick.color))! }
}

export function mapImport(recognized: RecognizedImport): ImportResult | null {
	const picked = pickBrand(recognized)
	if (!picked) return null
	const brand = snapToHex(picked)
	const pickedSecond = pickSecondBrand(recognized, brand)
	const second = pickedSecond && snapToHex(pickedSecond)
	const neutral = pickNeutral(recognized, brand.color)
	const usedScales = new Set([brand.scale, second?.scale].filter((name): name is string => !!name))

	const status: SystemSettings['status'] = {}
	const statusPicks: ImportPick[] = statusKinds.map((kind) => {
		const found = pickStatus(recognized, kind, brand.color, usedScales)
		const pick = found && snapToHex(found)
		if (found?.scale) usedScales.add(found.scale)
		if (pick && colorDifference(pick.color, suggestStatusColor(kind, brand.color)) >= editedStatusDifference) {
			status[kind] = pick.color
		}
		return { id: kind, source: pick?.source ?? null }
	})

	const extras = pickExtras(recognized, [brand.color], second, usedScales).map(snapToHex)
	const automaticNames = resolveExtraNames(extras.map((extra) => extra.color))
	const extraNames = extras.map((extra, index) =>
		extra.name && extra.name !== automaticNames[index] ? extra.name : null,
	)

	const settings: SystemSettings = {
		brand: brand.color,
		extras: extras.map((extra) => extra.color),
		neutralTint: neutral.tint,
		neutralHue: neutral.hue,
		status,
	}
	const { overrides, comparisons, missingTokens } = matchTokens(settings, recognized)

	return {
		system: { ...settings, neutralHue: neutral.hue, tokens: overrides, extraNames },
		picks: [
			{ id: 'brand', source: brand.source },
			...extras.map((extra, index) => ({ id: extraColorId(index), source: extra.source })),
			{ id: 'neutral', source: neutral.source },
			...statusPicks,
		],
		comparisons,
		missingTokens,
		hasDarkMode: tokenNames.some((name) => recognized.tokens[name]?.dark),
	}
}
