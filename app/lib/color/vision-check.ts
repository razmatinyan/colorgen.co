import { tokenModes, type ResolvedTokens, type TokenMode, type TokenName } from './tokens'
import { dichromacies, findConfusablePairs, visionInfo, type ColorBlindVision, type VisionColor } from './vision'

export interface VisionTokenGroup {
	id: 'status' | 'charts'
	tokens: readonly { token: TokenName; label: string }[]
}

export const visionTokenGroups: readonly VisionTokenGroup[] = [
	{
		id: 'status',
		tokens: [
			{ token: 'success', label: 'Success' },
			{ token: 'warning', label: 'Warning' },
			{ token: 'destructive', label: 'Danger' },
			{ token: 'info', label: 'Info' },
		],
	},
	{
		id: 'charts',
		tokens: [
			{ token: 'chart-1', label: 'Chart 1' },
			{ token: 'chart-2', label: 'Chart 2' },
			{ token: 'chart-3', label: 'Chart 3' },
			{ token: 'chart-4', label: 'Chart 4' },
			{ token: 'chart-5', label: 'Chart 5' },
		],
	},
]

export interface VisionWarning {
	id: string
	group: VisionTokenGroup['id']
	labels: readonly [string, string]
	types: ColorBlindVision[]
	modes: TokenMode[]
	worst: { type: ColorBlindVision; mode: TokenMode; colors: [string, string]; simulated: [string, string] }
	difference: number
}

export function checkVision(tokens: ResolvedTokens): VisionWarning[] {
	const warnings = new Map<string, VisionWarning>()
	for (const group of visionTokenGroups) {
		for (const mode of tokenModes) {
			const colors: VisionColor[] = group.tokens.map(({ token, label }) => ({
				id: token,
				label,
				hex: tokens[token][mode].hex,
			}))
			for (const type of dichromacies) {
				for (const pair of findConfusablePairs(colors, type)) {
					const id = `${pair.a.id}/${pair.b.id}`
					const warning = warnings.get(id) ?? {
						id,
						group: group.id,
						labels: [pair.a.label, pair.b.label] as const,
						types: [],
						modes: [],
						worst: { type, mode, colors: [pair.a.hex, pair.b.hex], simulated: [...pair.simulated] },
						difference: pair.difference,
					}
					if (!warning.types.includes(type)) warning.types.push(type)
					if (!warning.modes.includes(mode)) warning.modes.push(mode)
					if (pair.difference < warning.difference) {
						warning.difference = pair.difference
						warning.worst = { type, mode, colors: [pair.a.hex, pair.b.hex], simulated: [...pair.simulated] }
					}
					warnings.set(id, warning)
				}
			}
		}
	}
	return [...warnings.values()].map((warning) => ({
		...warning,
		types: dichromacies.filter((type) => warning.types.includes(type)),
		modes: tokenModes.filter((mode) => warning.modes.includes(mode)),
	}))
}

export function describeVisionWarning(warning: VisionWarning): string {
	const names = warning.types.map((type) => visionInfo[type].label.toLowerCase().replace(/-blind$/, ''))
	const people =
		names.length === 1
			? `${names[0]}-blind users`
			: `${names.slice(0, -1).join('-, ')}- and ${names.at(-1)}-blind users`
	return `${warning.labels[0]} and ${warning.labels[1]} look alike for ${people}`
}
