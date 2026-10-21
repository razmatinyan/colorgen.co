import {
	colorFamily,
	fixedColorIds,
	parseTokenRef,
	type ColorSystem,
	type Oklch,
	type SystemColorId,
	type TokenRef,
} from './color'

export const maxScaleNameLength = 24

const nameSeparator = ','
const reservedSystemNames = [...fixedColorIds, 'white']

export function toScaleName(input: string) {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^[^a-z]+/, '')
		.slice(0, maxScaleNameLength)
		.replace(/-+$/, '')
}

export function isScaleName(value: string) {
	return value !== '' && toScaleName(value) === value
}

function withSuffix(name: string, taken: Set<string>) {
	let candidate = name
	for (let count = 2; taken.has(candidate); count++) candidate = `${name}-${count}`
	taken.add(candidate)
	return candidate
}

export function resolveScaleNames(
	colors: readonly Oklch[],
	customNames: readonly (string | null)[] = [],
	reserved: readonly string[] = [],
) {
	const taken = new Set<string>(reserved)
	const custom = colors.map((_, index) => {
		const name = customNames[index]
		return name ? withSuffix(name, taken) : null
	})
	return colors.map((color, index) => custom[index] ?? withSuffix(toScaleName(colorFamily(color)), taken))
}

export function resolveExtraNames(extras: readonly Oklch[], customNames: readonly (string | null)[] = []) {
	return resolveScaleNames(extras, customNames, reservedSystemNames)
}

export type SystemScaleNames = Record<SystemColorId, string>

export function systemScaleNames(system: ColorSystem, customNames: readonly (string | null)[] = []): SystemScaleNames {
	const extraNames = resolveExtraNames(
		system.extras.map((scale) => scale.base),
		customNames,
	)
	return {
		...Object.fromEntries(fixedColorIds.map((id) => [id, id])),
		...Object.fromEntries(system.extras.map((scale, index) => [scale.id, extraNames[index]!])),
	} as SystemScaleNames
}

export function scaleNameOf(names: Partial<SystemScaleNames>, id: SystemColorId): string {
	return names[id] ?? id
}

export function scaleLabel(name: string) {
	const words = name.replace(/-/g, ' ')
	return words.charAt(0).toUpperCase() + words.slice(1)
}

export function tokenRefLabel(ref: TokenRef, names: Partial<SystemScaleNames> = {}) {
	const parsed = parseTokenRef(ref)
	if (!parsed) return ref
	if (parsed === 'white') return 'White'
	return `${scaleLabel(scaleNameOf(names, parsed.scale))} ${parsed.step}`
}

export function parseNamesParam(value: string | undefined, count: number): (string | null)[] {
	const parts = value?.split(nameSeparator) ?? []
	return Array.from({ length: count }, (_, index) => {
		const part = parts[index]
		return part && isScaleName(part) ? part : null
	})
}

export function toNamesParam(names: readonly (string | null)[]) {
	const parts = names.map((name) => name ?? '')
	while (parts.length && !parts.at(-1)) parts.pop()
	return parts.join(nameSeparator)
}
