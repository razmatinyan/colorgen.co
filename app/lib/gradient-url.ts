import {
	isGradientSpace,
	maxGradientSteps,
	maxGradientStops,
	minGradientSteps,
	minGradientStops,
	type GradientSpace,
	type Oklch,
} from './color'
import { parseColorsParam } from './palette-url'

export const gradientTypes = ['linear', 'radial', 'conic'] as const
export type GradientType = (typeof gradientTypes)[number]

export interface GradientOptions {
	type: GradientType
	angle: number
	space: GradientSpace
	steps: number
}

export const defaultGradientOptions: GradientOptions = { type: 'linear', angle: 90, space: 'oklch', steps: 5 }

type QueryValue = string | null | undefined | (string | null)[]

function first(value: QueryValue) {
	const single = Array.isArray(value) ? value[0] : value
	return typeof single === 'string' ? single : undefined
}

function parseInteger(value: string | undefined, min: number, max: number) {
	if (!value || !/^\d+$/.test(value)) return null
	const number = Number(value)
	return number >= min && number <= max ? number : null
}

export function isGradientType(value: string): value is GradientType {
	return (gradientTypes as readonly string[]).includes(value)
}

export function parseGradientParam(param: string | undefined): Oklch[] | null {
	const colors = parseColorsParam(param)
	if (!colors || colors.length < minGradientStops || colors.length > maxGradientStops) return null
	return colors
}

export function parseGradientQuery(query: Record<string, QueryValue>): GradientOptions {
	const type = first(query.type)
	const space = first(query.space)
	return {
		type: type && isGradientType(type) ? type : defaultGradientOptions.type,
		angle: parseInteger(first(query.angle), 0, 359) ?? defaultGradientOptions.angle,
		space: space && isGradientSpace(space) ? space : defaultGradientOptions.space,
		steps: parseInteger(first(query.steps), minGradientSteps, maxGradientSteps) ?? defaultGradientOptions.steps,
	}
}

export function toGradientQuery(options: GradientOptions): Record<string, string> {
	const query: Record<string, string> = {}
	if (options.type !== defaultGradientOptions.type) query.type = options.type
	if (options.type !== 'radial' && options.angle !== defaultGradientOptions.angle) query.angle = String(options.angle)
	if (options.space !== defaultGradientOptions.space) query.space = options.space
	if (options.steps !== defaultGradientOptions.steps) query.steps = String(options.steps)
	return query
}
