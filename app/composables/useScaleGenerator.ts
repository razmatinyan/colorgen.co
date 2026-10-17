import type { InjectionKey } from 'vue'
import { describeColor, generateScale, nearestStepIndex, scaleSteps, suggestDistinctColor, type Oklch, type ScaleStep, type ScaleSwatch } from '~/lib/color'
import { maxScales, resolveScaleNames } from '~/lib/scale-url'
import { defaultBrand } from '~/composables/useDesignSystemBuilder'

export interface ScaleEntry {
	id: number
	color: Oklch
	name: string | null
}

export interface ScaleItem {
	id: number
	color: Oklch
	name: string
	customName: string | null
	description: string
	hex: string
	swatches: ScaleSwatch[]
	anchorStep: ScaleStep
}

export interface ScaleGeneratorInitial {
	colors?: readonly Oklch[] | null
	names?: readonly (string | null)[]
}

export function useScaleGenerator(initial: ScaleGeneratorInitial = {}) {
	let lastId = 0
	const colors = initial.colors?.length ? initial.colors : [defaultBrand]
	const entries = ref<ScaleEntry[]>(colors.map((color, index) => ({ id: ++lastId, color, name: initial.names?.[index] ?? null })))
	const history = useUndoHistory(entries)
	const selectedId = ref<number | null>(entries.value[0]!.id)

	const names = computed(() => resolveScaleNames(entries.value.map(entry => entry.color), entries.value.map(entry => entry.name)))

	const scales = computed<ScaleItem[]>(() => entries.value.map((entry, index) => {
		const swatches = generateScale(entry.color)
		const anchorIndex = nearestStepIndex(entry.color.l)
		return {
			id: entry.id,
			color: entry.color,
			name: names.value[index]!,
			customName: entry.name,
			description: describeColor(swatches[anchorIndex]!.color),
			hex: swatches[anchorIndex]!.hex,
			swatches,
			anchorStep: scaleSteps[anchorIndex]!,
		}
	}))
	const selected = computed(() => scales.value.find(scale => scale.id === selectedId.value) ?? null)
	const canAdd = computed(() => entries.value.length < maxScales)
	const canRemove = computed(() => entries.value.length > 1)

	function findEntry(id: number) {
		return entries.value.find(entry => entry.id === id)
	}

	function updateColor(id: number, patch: Partial<Oklch>) {
		const entry = findEntry(id)
		if (entry) entry.color = { ...entry.color, ...patch }
	}

	function setName(id: number, name: string | null) {
		const entry = findEntry(id)
		if (!entry || entry.name === name) return
		history.snapshot()
		entry.name = name
	}

	function add() {
		if (!canAdd.value) return
		history.snapshot()
		const entry = { id: ++lastId, color: suggestDistinctColor(entries.value.map(item => item.color)), name: null }
		entries.value = [...entries.value, entry]
		selectedId.value = entry.id
	}

	function remove(id: number) {
		if (!canRemove.value) return
		history.snapshot()
		const index = entries.value.findIndex(entry => entry.id === id)
		entries.value = entries.value.filter(entry => entry.id !== id)
		if (selectedId.value === id) selectedId.value = entries.value[Math.max(0, index - 1)]?.id ?? null
	}

	function select(offset: number) {
		const count = entries.value.length
		const index = entries.value.findIndex(entry => entry.id === selectedId.value)
		const nextIndex = index === -1 ? (offset > 0 ? 0 : count - 1) : (index + offset + count) % count
		selectedId.value = entries.value[nextIndex]?.id ?? null
	}

	function toggleOpen(id: number) {
		selectedId.value = selectedId.value === id ? null : id
	}

	return {
		entries,
		scales,
		selected,
		selectedId,
		canAdd,
		canRemove,
		...history,
		updateColor,
		setName,
		add,
		remove,
		select,
		toggleOpen,
	}
}

export type ScaleGenerator = ReturnType<typeof useScaleGenerator>
export const scaleGeneratorKey: InjectionKey<ScaleGenerator> = Symbol('scale-generator')
