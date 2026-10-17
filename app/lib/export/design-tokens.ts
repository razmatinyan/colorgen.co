import { tokenModes, type TokenMode } from '../color'
import { dtcgColor, type ExportModel, type ExportScale, type ExportTokenValue } from './model'

type TokenTree = { [key: string]: TokenTree | { $type: 'color', $value: unknown } }

const colorToken = ($value: unknown) => ({ $type: 'color' as const, $value })

const numberArray = /\[\s*(-?[\d.]+(?:,\s*-?[\d.]+)*)\s*\]/g

export function toJson(value: unknown) {
	const json = JSON.stringify(value, null, 2).replace(numberArray, (_, items: string) => `[${items.split(/,\s*/).join(', ')}]`)
	return `${json}\n`
}

function scalePrimitives(scales: readonly ExportScale[]): TokenTree {
	return Object.fromEntries(scales.map(scale => [
		scale.name,
		Object.fromEntries(scale.steps.map(step => [String(step.step), colorToken(dtcgColor(step.hex))])),
	]))
}

function primitives(model: ExportModel): TokenTree {
	return { white: colorToken(dtcgColor('#ffffff')), ...scalePrimitives(model.scales) }
}

function alias(value: ExportTokenValue) {
	return value.primitive ? `{color.${value.primitive.scale}.${value.primitive.step}}` : '{color.white}'
}

function semantic(model: ExportModel, mode: TokenMode, valueOf: (value: ExportTokenValue) => unknown): TokenTree {
	return Object.fromEntries(model.tokens.map(token => [token.name, colorToken(valueOf(token[mode]))]))
}

export function toDesignTokens(model: ExportModel) {
	const tree: TokenTree = { color: primitives(model) }
	for (const mode of tokenModes) tree[mode] = semantic(model, mode, alias)
	return toJson(tree)
}

export function toFigmaTokens(model: ExportModel, mode: TokenMode) {
	const tree: TokenTree = {
		color: primitives(model),
		theme: semantic(model, mode, value => dtcgColor(value.hex)),
	}
	return toJson(tree)
}

export function toScaleDesignTokens(scales: readonly ExportScale[]) {
	return toJson({ color: scalePrimitives(scales) })
}
