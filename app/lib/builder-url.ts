import { defaultNeutralTint, statusKinds, type Oklch, type StatusKind, type SystemSettings } from './color'
import { parseHexPart, toHexPart } from './palette-url'

export type BuilderQuery = Record<string, unknown>
export type BuilderOptions = Pick<SystemSettings, 'neutralTint' | 'status'>

function firstString(value: unknown) {
	const first = Array.isArray(value) ? value[0] : value
	return typeof first === 'string' ? first : undefined
}

function parseTint(value: string | undefined) {
	if (!value || !/^\d{1,3}$/.test(value)) return defaultNeutralTint
	const percent = Number(value)
	return percent <= 100 ? percent / 100 : defaultNeutralTint
}

export function parseBuilderQuery(query: BuilderQuery): BuilderOptions {
	const status: Partial<Record<StatusKind, Oklch>> = {}
	for (const kind of statusKinds) {
		const color = parseHexPart(firstString(query[kind]))
		if (color) status[kind] = color
	}
	return { neutralTint: parseTint(firstString(query.tint)), status }
}

export function toBuilderQuery({ neutralTint, status }: BuilderOptions): Record<string, string> {
	const query: Record<string, string> = {}
	const tintPercent = Math.round(neutralTint * 100)
	if (tintPercent !== Math.round(defaultNeutralTint * 100)) query.tint = String(tintPercent)
	for (const kind of statusKinds) {
		const color = status[kind]
		if (color) query[kind] = toHexPart(color)
	}
	return query
}
