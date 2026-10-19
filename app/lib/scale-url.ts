import { colorFamily, type Oklch } from './color'
import { parseColorsParam } from './palette-url'

export const maxScaleNameLength = 24

const nameSeparator = ','

export function parseScalesParam(param: string | undefined): Oklch[] | null {
	const colors = parseColorsParam(param)
	return colors?.length ? colors : null
}

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

export function resolveScaleNames(colors: readonly Oklch[], customNames: readonly (string | null)[] = []) {
	const taken = new Set<string>()
	const custom = colors.map((_, index) => {
		const name = customNames[index]
		return name ? withSuffix(name, taken) : null
	})
	return colors.map((color, index) => custom[index] ?? withSuffix(toScaleName(colorFamily(color)), taken))
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
