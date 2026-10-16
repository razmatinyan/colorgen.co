import type { InjectionKey } from 'vue'
import { generatePalette, paletteRoles, scaleHexes, scaleSteps, toHex, type Oklch, type PaletteRole } from '~/lib/color'

export interface PaletteColor extends Oklch {
	id: PaletteRole
	role: string
	hint: string
	locked: boolean
}

const roleDetails: Record<PaletteRole, { label: string, hint: string, initial: Oklch }> = {
	primary: { label: 'Primary', hint: 'Buttons, toggles, active items', initial: { l: 0.52, c: 0.13, h: 250 } },
	secondary: { label: 'Secondary', hint: 'Secondary buttons, positive numbers', initial: { l: 0.68, c: 0.11, h: 190 } },
	accent: { label: 'Accent', hint: 'Badges and alerts', initial: { l: 0.73, c: 0.16, h: 48 } },
	highlight: { label: 'Highlight', hint: 'Avatars and soft accents', initial: { l: 0.91, c: 0.09, h: 95 } },
	neutral: { label: 'Neutral', hint: 'Text, borders, backgrounds', initial: { l: 0.28, c: 0.02, h: 255 } },
}

const oklchOf = ({ l, c, h }: Oklch): Oklch => ({ l, c, h })

export function usePaletteGenerator(initialColors: readonly Oklch[] | null = null) {
	const colors = ref<PaletteColor[]>(paletteRoles.map((role, index) => ({
		id: role,
		role: roleDetails[role].label,
		hint: roleDetails[role].hint,
		...roleDetails[role].initial,
		...(initialColors?.[index] && oklchOf(initialColors[index])),
		locked: false,
	})))
	const selectedId = ref<PaletteRole | null>('primary')
	const history = useUndoHistory(colors)

	const selected = computed(() => colors.value.find(color => color.id === selectedId.value) ?? null)
	const hexes = computed(() => colors.value.map(color => toHex(color)))

	function generate() {
		history.snapshot()
		const next = generatePalette({ locked: colors.value.map(color => (color.locked ? oklchOf(color) : null)) })
		colors.value = colors.value.map((color, index) => ({ ...color, ...oklchOf(next[index]!) }))
	}

	function findColor(id: PaletteRole) {
		return colors.value.find(color => color.id === id)
	}

	function toggleLock(id: PaletteRole) {
		const color = findColor(id)
		if (color) color.locked = !color.locked
	}

	function update(id: PaletteRole, patch: Partial<Oklch>) {
		const color = findColor(id)
		if (color) Object.assign(color, patch)
	}

	function select(offset: number) {
		const count = colors.value.length
		const index = colors.value.findIndex(color => color.id === selectedId.value)
		const nextIndex = index === -1 ? (offset > 0 ? 0 : count - 1) : (index + offset + count) % count
		selectedId.value = colors.value[nextIndex]?.id ?? null
	}

	function toggleOpen(id: PaletteRole) {
		selectedId.value = selectedId.value === id ? null : id
	}

	function cssExport() {
		const lines = colors.value.flatMap(color =>
			scaleHexes(color).map((hex, index) => `  --${color.id}-${scaleSteps[index]}: ${hex};`),
		)
		return `:root {\n${lines.join('\n')}\n}`
	}

	return {
		colors,
		selected,
		selectedId,
		hexes,
		...history,
		generate,
		toggleLock,
		update,
		select,
		toggleOpen,
		cssExport,
	}
}

export type PaletteGenerator = ReturnType<typeof usePaletteGenerator>
export const paletteGeneratorKey: InjectionKey<PaletteGenerator> = Symbol('palette-generator')
