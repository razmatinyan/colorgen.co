import {
	isTokenName,
	parseColor,
	scaleSteps,
	tokenModes,
	type Oklch,
	type ScaleStep,
	type TokenMode,
	type TokenName,
} from '../color'
import { stripNamespaces } from './names'
import type { ImportedColor } from './types'
import { compositeOver } from './value'

export interface RecognizedColor {
	color: Oklch
	source: string
}

export interface RecognizedScale {
	name: string
	steps: Partial<Record<ScaleStep, RecognizedColor>>
}

export interface RecognizedLooseColor extends RecognizedColor {
	name: string
}

export type RecognizedTokens = Partial<Record<TokenName, Partial<Record<TokenMode, RecognizedColor>>>>

export interface RecognizedImport {
	tokens: RecognizedTokens
	scales: RecognizedScale[]
	loose: RecognizedLooseColor[]
}

const tokenAliases: Record<string, TokenName> = {
	danger: 'destructive',
	error: 'destructive',
	'danger-foreground': 'destructive-foreground',
	'error-foreground': 'destructive-foreground',
}

const defaultBackgrounds: Record<TokenMode, Oklch> = {
	light: parseColor('#ffffff')!,
	dark: parseColor('#0a0a0a')!,
}

const scaleStepPattern = /^(.+)-(\d{2,3})$/

function toTokenName(name: string): { token: TokenName; isAlias: boolean } | null {
	const expanded = name.replace(/^on-(.+)$/, '$1-foreground').replace(/-fg$/, '-foreground')
	if (isTokenName(expanded)) return { token: expanded, isAlias: expanded !== name }
	const alias = tokenAliases[expanded]
	return alias ? { token: alias, isAlias: true } : null
}

function toScaleStep(name: string) {
	const match = scaleStepPattern.exec(name)
	if (!match) return null
	const step = Number(match[2]) as ScaleStep
	return scaleSteps.includes(step) ? { scale: match[1]!, step } : null
}

export function recognizeImport(colors: readonly ImportedColor[]): RecognizedImport {
	const named = colors.map((color) => ({ ...color, name: stripNamespaces(color.name) }))

	const backgrounds = { ...defaultBackgrounds }
	for (const mode of tokenModes) {
		const background = named.findLast((color) => color.name === 'background' && color.mode === mode)
		if (background && background.alpha >= 1) backgrounds[mode] = background.color
	}
	const flatten = (color: ImportedColor) => ({
		color: compositeOver(color, backgrounds[color.mode]),
		source: color.source,
	})

	const tokens: RecognizedTokens = {}
	const aliasOnly = new Set<string>()
	const scales = new Map<string, RecognizedScale>()
	const loose = new Map<string, RecognizedLooseColor>()

	for (const color of named) {
		const token = toTokenName(color.name)
		if (token) {
			const key = `${token.token}.${color.mode}`
			const existing = tokens[token.token]?.[color.mode]
			if (existing && token.isAlias && !aliasOnly.has(key)) continue
			if (token.isAlias) aliasOnly.add(key)
			else aliasOnly.delete(key)
			tokens[token.token] = { ...tokens[token.token], [color.mode]: flatten(color) }
			continue
		}
		const scaleStep = toScaleStep(color.name)
		if (scaleStep) {
			const scale = scales.get(scaleStep.scale) ?? { name: scaleStep.scale, steps: {} }
			if (color.mode === 'light' || !scale.steps[scaleStep.step]) scale.steps[scaleStep.step] = flatten(color)
			scales.set(scaleStep.scale, scale)
			continue
		}
		if (color.mode === 'light' || !loose.has(color.name)) loose.set(color.name, { name: color.name, ...flatten(color) })
	}

	return { tokens, scales: [...scales.values()], loose: [...loose.values()] }
}
