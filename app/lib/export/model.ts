import {
	parseTokenRef,
	systemScales,
	tokenNames,
	toOklch,
	toOklchString,
	type ColorSystem,
	type Oklch,
	type ResolvedTokens,
	type ScaleStep,
	type TokenName,
	type TokenRef,
} from '../color'
import { scaleNameOf, systemScaleNames, type SystemScaleNames } from '../scale-names'

export type ValueFormat = 'oklch' | 'hex'

export interface ExportColor {
	hex: string
	color: Oklch
}

export interface ExportScale {
	name: string
	steps: (ExportColor & { step: ScaleStep })[]
}

export interface ExportTokenValue extends ExportColor {
	ref: TokenRef
	primitive: { scale: string; step: ScaleStep } | null
}

export interface ExportToken {
	name: TokenName
	light: ExportTokenValue
	dark: ExportTokenValue
}

export interface ExportModel {
	scales: ExportScale[]
	tokens: ExportToken[]
}

function tokenValue({ ref, hex }: { ref: TokenRef; hex: string }, names: SystemScaleNames): ExportTokenValue {
	const parsed = parseTokenRef(ref)
	return {
		ref,
		hex,
		color: toOklch(hex),
		primitive: parsed && parsed !== 'white' ? { scale: scaleNameOf(names, parsed.scale), step: parsed.step } : null,
	}
}

export function buildExportModel(
	system: ColorSystem,
	tokens: ResolvedTokens,
	names: SystemScaleNames = systemScaleNames(system),
): ExportModel {
	return {
		scales: systemScales(system).map((scale) => ({
			name: scaleNameOf(names, scale.id),
			steps: scale.swatches.map(({ step, hex, color }) => ({ step, hex, color })),
		})),
		tokens: tokenNames.map((name) => ({
			name,
			light: tokenValue(tokens[name].light, names),
			dark: tokenValue(tokens[name].dark, names),
		})),
	}
}

export function formatValue({ hex, color }: ExportColor, format: ValueFormat) {
	return format === 'hex' ? hex : toOklchString(color)
}

export function scaleVariableLines(scales: readonly ExportScale[], prefix: string, format: ValueFormat) {
	return scales
		.flatMap((scale) => [
			'',
			...scale.steps.map((step) => `  --${prefix}${scale.name}-${step.step}: ${formatValue(step, format)};`),
		])
		.slice(1)
}

export function srgbComponents(hex: string): [number, number, number] {
	const channel = (offset: number) =>
		Math.round((Number.parseInt(hex.slice(offset, offset + 2), 16) / 255) * 10000) / 10000
	return [channel(1), channel(3), channel(5)]
}

export function dtcgColor(hex: string) {
	return { colorSpace: 'srgb', components: srgbComponents(hex), alpha: 1, hex }
}
