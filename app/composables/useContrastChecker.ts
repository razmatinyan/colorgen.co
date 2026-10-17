import type { InjectionKey } from 'vue'
import { checkContrast, describeColor, findContrastFix, toHex, wcagCriteria, type ContrastFix, type Oklch, type WcagCriterionId } from '~/lib/color'
import type { ContrastPair } from '~/lib/contrast-url'
import { defaultBrand } from '~/composables/useDesignSystemBuilder'

export type ContrastColorId = keyof ContrastPair

export interface ContrastColor {
	id: ContrastColorId
	label: string
	hint: string
	color: Oklch
	hex: string
	description: string
}

const colorDetails: Record<ContrastColorId, { label: string, hint: string }> = {
	text: { label: 'Text', hint: 'Text, icons or borders' },
	background: { label: 'Background', hint: 'What the text sits on' },
}

const contrastColorIds: readonly ContrastColorId[] = ['text', 'background']
const white: Oklch = { l: 1, c: 0, h: 0 }

export function useContrastChecker(initial: Partial<ContrastPair> = {}) {
	const pair = ref<ContrastPair>({
		text: initial.text ?? defaultBrand,
		background: initial.background ?? white,
	})
	const history = useUndoHistory(pair)
	const selectedId = ref<ContrastColorId | null>('text')
	const targetId = ref<WcagCriterionId>('body-aa')

	const hexes = computed(() => ({ text: toHex(pair.value.text), background: toHex(pair.value.background) }))
	const colors = computed<ContrastColor[]>(() => contrastColorIds.map(id => ({
		id,
		...colorDetails[id],
		color: pair.value[id],
		hex: hexes.value[id],
		description: describeColor(hexes.value[id]),
	})))
	const selected = computed(() => colors.value.find(color => color.id === selectedId.value) ?? null)

	const check = computed(() => checkContrast(hexes.value.text, hexes.value.background))
	const target = computed(() => wcagCriteria.find(criterion => criterion.id === targetId.value)!)
	const passesTarget = computed(() => check.value.ratio >= target.value.minRatio)
	const fixes = computed<Record<ContrastColorId, ContrastFix | null>>(() => ({
		text: findContrastFix(pair.value.text, hexes.value.background, target.value.minRatio),
		background: findContrastFix(pair.value.background, hexes.value.text, target.value.minRatio),
	}))

	const brandColor = computed(() => (pair.value.text.c >= pair.value.background.c ? pair.value.text : pair.value.background))

	function update(id: ContrastColorId, patch: Partial<Oklch>) {
		pair.value[id] = { ...pair.value[id], ...patch }
	}

	function set(id: ContrastColorId, color: Oklch) {
		history.snapshot()
		pair.value[id] = color
	}

	function applyFix(id: ContrastColorId) {
		const fix = fixes.value[id]
		if (fix && fix.hex !== hexes.value[id]) set(id, fix.color)
	}

	function swap() {
		history.snapshot()
		pair.value = { text: pair.value.background, background: pair.value.text }
	}

	function select(offset: number) {
		const index = contrastColorIds.indexOf(selectedId.value as ContrastColorId)
		const count = contrastColorIds.length
		const nextIndex = index === -1 ? (offset > 0 ? 0 : count - 1) : (index + offset + count) % count
		selectedId.value = contrastColorIds[nextIndex] ?? null
	}

	function toggleOpen(id: ContrastColorId) {
		selectedId.value = selectedId.value === id ? null : id
	}

	return {
		pair,
		hexes,
		colors,
		selected,
		selectedId,
		targetId,
		target,
		check,
		passesTarget,
		fixes,
		brandColor,
		...history,
		update,
		set,
		applyFix,
		swap,
		select,
		toggleOpen,
	}
}

export type ContrastChecker = ReturnType<typeof useContrastChecker>
export const contrastCheckerKey: InjectionKey<ContrastChecker> = Symbol('contrast-checker')
