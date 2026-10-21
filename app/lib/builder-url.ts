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
import { parseNamesParam, toNamesParam } from './scale-names'

export type BuilderQuery = Record<string, unknown>
export type BuilderOptions = Pick<SystemSettings, 'neutralTint' | 'status'> & {
	neutralHue: number | null
	tokens: TokenOverrides
	extraNames: (string | null)[]
}
export type BuilderBrands = Pick<SystemSettings, 'brand' | 'extras'>

const tokenSeparator = ','
const refSeparator = '~'
const neutralHueKey = 'neutral-hue'

export function parseBrandsParam(param: string | undefined): BuilderBrands | null {
	const colors = parseColorsParam(param)
	if (!colors?.length) return null
	return { brand: colors[0]!, extras: colors.slice(1) }
}

export function toBrandsParam({ brand, extras }: BuilderBrands) {
	return [brand, ...extras].map(toHexPart).join('-')
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

function parseHue(value: string | undefined) {
	if (!value || !/^\d{1,3}$/.test(value)) return null
	const hue = Number(value)
	return hue < 360 ? hue : null
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
	return tokenNames
		.flatMap((name) =>
			tokenModes.flatMap((mode) => {
				const ref = tokens[name]?.[mode]
				return ref ? [`${name}.${mode}${refSeparator}${ref}`] : []
			}),
		)
		.join(tokenSeparator)
}

export function parseBuilderQuery(query: BuilderQuery, extraCount = 0): BuilderOptions {
	const status: Partial<Record<StatusKind, Oklch>> = {}
	for (const kind of statusKinds) {
		const color = parseHexPart(firstString(query[kind]))
		if (color) status[kind] = color
	}
	return {
		neutralTint: parseTint(firstString(query.tint)),
		neutralHue: parseHue(firstString(query[neutralHueKey])),
		status,
		tokens: parseTokensParam(firstString(query.tokens)),
		extraNames: parseNamesParam(firstString(query.names), extraCount),
	}
}

export function toBuilderQuery({
	neutralTint,
	neutralHue,
	status,
	tokens,
	extraNames,
}: BuilderOptions): Record<string, string> {
	const query: Record<string, string> = {}
	const tintPercent = Math.round(neutralTint * 100)
	if (tintPercent !== Math.round(defaultNeutralTint * 100)) query.tint = String(tintPercent)
	if (neutralHue !== null) query[neutralHueKey] = String(Math.round(neutralHue) % 360)
	for (const kind of statusKinds) {
		const color = status[kind]
		if (color) query[kind] = toHexPart(color)
	}
	const tokensParam = toTokensParam(tokens)
	if (tokensParam) query.tokens = tokensParam
	const namesParam = toNamesParam(extraNames)
	if (namesParam) query.names = namesParam
	return query
}
