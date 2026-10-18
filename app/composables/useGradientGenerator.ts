import type { InjectionKey } from 'vue'
import {
	describeColor,
	gradientSpaces,
	maxGradientSteps,
	maxGradientStops,
	minGradientSteps,
	minGradientStops,
	sampleGradient,
	suggestGradients,
	suggestNextStop,
	toHex,
	type GradientSpace,
	type Oklch,
} from '~/lib/color'
import { toCssGradient, type GradientExport } from '~/lib/export'
import { defaultGradientOptions, type GradientOptions, type GradientType } from '~/lib/gradient-url'
import { defaultBrand } from '~/composables/useDesignSystemBuilder'

export interface GradientStop {
	id: number
	color: Oklch
}

interface GradientState extends GradientOptions {
	stops: GradientStop[]
}

export interface GradientStopItem extends GradientStop {
	hex: string
	label: string
	description: string
}

export interface GradientGeneratorInitial {
	stops?: readonly Oklch[] | null
	options?: GradientOptions
}

const previewSamples = 7

function stopLabel(index: number, count: number) {
	if (index === 0) return 'Start'
	if (index === count - 1) return 'End'
	return count === 3 ? 'Middle' : `Stop ${index + 1}`
}

export function useGradientGenerator(initial: GradientGeneratorInitial = {}) {
	let lastId = 0
	const colors = initial.stops?.length ? initial.stops : [defaultBrand, suggestNextStop([defaultBrand])]
	const state = ref<GradientState>({
		...(initial.options ?? defaultGradientOptions),
		stops: colors.map((color) => ({ id: ++lastId, color })),
	})
	const history = useUndoHistory(state)
	const selectedId = ref<number | null>(state.value.stops[0]!.id)

	const stops = computed<GradientStopItem[]>(() =>
		state.value.stops.map((stop, index, all) => ({
			...stop,
			hex: toHex(stop.color),
			label: stopLabel(index, all.length),
			description: describeColor(stop.color),
		})),
	)
	const colorsInOrder = computed(() => state.value.stops.map((stop) => stop.color))
	const gradient = computed<GradientExport>(() => ({
		stops: colorsInOrder.value,
		type: state.value.type,
		angle: state.value.angle,
		space: state.value.space,
	}))
	const css = computed(() => toCssGradient(gradient.value))
	const steps = computed(() =>
		sampleGradient(colorsInOrder.value, state.value.steps, state.value.space).map((color) => ({
			color,
			hex: toHex(color),
		})),
	)
	const blends = computed(() =>
		gradientSpaces.map((space) => ({
			space,
			hexes: sampleGradient(colorsInOrder.value, previewSamples, space).map((color) => toHex(color)),
		})),
	)
	const ideas = computed(() =>
		suggestGradients(colorsInOrder.value[0]!).map((idea) => ({
			...idea,
			hexes: idea.stops.map((stop) => toHex(stop)),
		})),
	)
	const selected = computed(() => stops.value.find((stop) => stop.id === selectedId.value) ?? null)
	const canAdd = computed(() => state.value.stops.length < maxGradientStops)
	const canRemove = computed(() => state.value.stops.length > minGradientStops)

	function findStop(id: number) {
		return state.value.stops.find((stop) => stop.id === id)
	}

	function updateColor(id: number, patch: Partial<Oklch>) {
		const stop = findStop(id)
		if (stop) stop.color = { ...stop.color, ...patch }
	}

	function setOption<K extends keyof GradientOptions>(key: K, value: GradientOptions[K], withSnapshot = true) {
		if (state.value[key] === value) return
		if (withSnapshot) history.snapshot()
		const options: GradientOptions = state.value
		options[key] = value
	}

	function setType(type: GradientType) {
		setOption('type', type)
	}

	function setSpace(space: GradientSpace) {
		setOption('space', space)
	}

	function setAngle(angle: number) {
		setOption('angle', ((Math.round(angle) % 360) + 360) % 360, false)
	}

	function setSteps(count: number) {
		setOption('steps', Math.min(maxGradientSteps, Math.max(minGradientSteps, Math.round(count))))
	}

	function add() {
		if (!canAdd.value) return
		history.snapshot()
		const stop = { id: ++lastId, color: suggestNextStop(colorsInOrder.value) }
		state.value.stops = [...state.value.stops, stop]
		selectedId.value = stop.id
	}

	function remove(id: number) {
		if (!canRemove.value) return
		history.snapshot()
		const index = state.value.stops.findIndex((stop) => stop.id === id)
		state.value.stops = state.value.stops.filter((stop) => stop.id !== id)
		if (selectedId.value === id) selectedId.value = state.value.stops[Math.max(0, index - 1)]?.id ?? null
	}

	function reverse() {
		history.snapshot()
		state.value.stops = [...state.value.stops].reverse()
	}

	function applyIdea(colors: readonly Oklch[]) {
		history.snapshot()
		state.value.stops = colors.map((color) => ({ id: ++lastId, color }))
		selectedId.value = state.value.stops[0]!.id
	}

	function select(offset: number) {
		const count = state.value.stops.length
		const index = state.value.stops.findIndex((stop) => stop.id === selectedId.value)
		const nextIndex = index === -1 ? (offset > 0 ? 0 : count - 1) : (index + offset + count) % count
		selectedId.value = state.value.stops[nextIndex]?.id ?? null
	}

	function toggleOpen(id: number) {
		selectedId.value = selectedId.value === id ? null : id
	}

	return {
		state,
		stops,
		colors: colorsInOrder,
		gradient,
		css,
		steps,
		blends,
		ideas,
		selected,
		selectedId,
		canAdd,
		canRemove,
		...history,
		updateColor,
		setType,
		setSpace,
		setAngle,
		setSteps,
		add,
		remove,
		reverse,
		applyIdea,
		select,
		toggleOpen,
	}
}

export type GradientGenerator = ReturnType<typeof useGradientGenerator>
export const gradientGeneratorKey: InjectionKey<GradientGenerator> = Symbol('gradient-generator')
