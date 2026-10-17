import {
	defaultNeutralTint,
	isTokenMode,
	isTokenName,
	isTokenRef,
	statusKinds,
	tokenModes,
	tokenNames,
	type Oklch,
	type StatusKind,
	type SystemSettings,
	type TokenOverrides,
} from './color'
import { parseColorsParam, parseHexPart, toHexPart } from './palette-url'

export type BuilderQuery = Record<string, unknown>
export type BuilderOptions = Pick<SystemSettings, 'neutralTint' | 'status'> & { tokens: TokenOverrides }
export type BuilderBrands = Pick<SystemSettings, 'brand' | 'brand2'>

const maxBrands = 2
const tokenSeparator = ','
const refSeparator = '~'

export function parseBrandsParam(param: string | undefined): BuilderBrands | null {
	const colors = parseColorsParam(param)
	if (!colors || colors.length > maxBrands) return null
	return { brand: colors[0]!, brand2: colors[1] ?? null }
}

export function toBrandsParam({ brand, brand2 }: BuilderBrands) {
	return [brand, brand2].filter((color): color is Oklch => color !== null).map(toHexPart).join('-')
}

function firstString(value: unknown) {
	const first = Array.isArray(value) ? value[0] : value
	return typeof first === 'string' ? first : undefined
}

function parseTint(value: string | undefined) {
	if (!value || !/^\d{1,3}$/.test(value)) return defaultNeutralTint
	const percent = Number(value)
	return percent <= 100 ? percent / 100 : defaultNeutralTint
}

export function parseTokensParam(value: string | undefined): TokenOverrides {
	const tokens: TokenOverrides = {}
	for (const entry of value?.split(tokenSeparator) ?? []) {
		const [key, ref, ...rest] = entry.split(refSeparator)
		const [name, mode, ...extra] = key?.split('.') ?? []
		if (rest.length || extra.length || !name || !mode || !ref) continue
		if (!isTokenName(name) || !isTokenMode(mode) || !isTokenRef(ref)) continue
		tokens[name] = { ...tokens[name], [mode]: ref }
	}
	return tokens
}

export function toTokensParam(tokens: TokenOverrides) {
	return tokenNames.flatMap(name => tokenModes.flatMap((mode) => {
		const ref = tokens[name]?.[mode]
		return ref ? [`${name}.${mode}${refSeparator}${ref}`] : []
	})).join(tokenSeparator)
}

export function parseBuilderQuery(query: BuilderQuery): BuilderOptions {
	const status: Partial<Record<StatusKind, Oklch>> = {}
	for (const kind of statusKinds) {
		const color = parseHexPart(firstString(query[kind]))
		if (color) status[kind] = color
	}
	return {
		neutralTint: parseTint(firstString(query.tint)),
		status,
		tokens: parseTokensParam(firstString(query.tokens)),
	}
}

export function toBuilderQuery({ neutralTint, status, tokens }: BuilderOptions): Record<string, string> {
	const query: Record<string, string> = {}
	const tintPercent = Math.round(neutralTint * 100)
	if (tintPercent !== Math.round(defaultNeutralTint * 100)) query.tint = String(tintPercent)
	for (const kind of statusKinds) {
		const color = status[kind]
		if (color) query[kind] = toHexPart(color)
	}
	const tokensParam = toTokensParam(tokens)
	if (tokensParam) query.tokens = tokensParam
	return query
}
