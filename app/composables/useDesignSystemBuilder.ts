import type { InjectionKey } from 'vue'
import {
	checkReadability,
	checkVision,
	defaultNeutralTint,
	extraColorId,
	extraColorIndex,
	fixReadability,
	generateSystem,
	isStatusKind,
	resolveTokens,
	statusKinds,
	suggestDistinctColor,
	suggestSecondBrand,
	suggestStatusColors,
	systemScales,
	toHex,
	withoutExtraColor,
	type ExtraColorId,
	type FixedColorId,
	type Oklch,
	type StatusKind,
	type SystemColorId,
	type SystemScale,
	type SystemSettings,
	type TokenMode,
	type TokenName,
	type TokenOverrides,
	type TokenRef,
} from '~/lib/color'
import { scaleLabel, scaleNameOf, systemScaleNames, tokenRefLabel } from '~/lib/scale-names'

export interface BuilderColor extends SystemScale {
	name: string
	label: string
	customName: string | null
	hint: string
	hex: string
	edited: boolean
}

export type BuilderState = SystemSettings & {
	extraNames: (string | null)[]
	neutralHue: number | null
	tokens: TokenOverrides
}
export type BrandId = 'brand' | ExtraColorId

const fixedColorHints: Record<FixedColorId, string> = {
	brand: 'Main buttons, links, focus rings',
	neutral: 'Text, borders, backgrounds',
	success: 'Confirmations, positive changes',
	warning: 'Pending states, things to double-check',
	danger: 'Errors, destructive actions',
	info: 'Tips and announcements',
}
const secondColorHint = 'Secondary buttons, highlights, charts'
const extraColorHint = 'Charts and extra accents'

export function useDesignSystemBuilder(initial: Partial<BuilderState> = {}) {
	const initialExtras = [...(initial.extras ?? [])]
	const settings = ref<BuilderState>({
		brand: initial.brand ?? defaultBrand,
		extras: initialExtras,
		extraNames: initialExtras.map((_, index) => initial.extraNames?.[index] ?? null),
		neutralTint: initial.neutralTint ?? defaultNeutralTint,
		neutralHue: initial.neutralHue ?? null,
		status: initial.status ?? {},
		tokens: initial.tokens ?? {},
	})
	const history = useUndoHistory(settings)
	const selectedId = ref<SystemColorId | null>('brand')

	const system = computed(() => generateSystem(settings.value))
	const suggestedStatus = computed(() => suggestStatusColors(settings.value.brand))
	const tokens = computed(() => resolveTokens(system.value, settings.value.tokens))
	const readability = computed(() => checkReadability(tokens.value))
	const failingReadability = computed(() => readability.value.filter((result) => !result.passes))
	const visionWarnings = computed(() => checkVision(tokens.value))
	const scaleNames = computed(() => systemScaleNames(system.value, settings.value.extraNames))

	function colorHint(id: SystemColorId) {
		const index = extraColorIndex(id)
		if (index === null) return fixedColorHints[id as FixedColorId]
		return index === 0 ? secondColorHint : extraColorHint
	}

	const colors = computed<BuilderColor[]>(() =>
		systemScales(system.value).map((scale) => {
			const index = extraColorIndex(scale.id)
			const name = scaleNameOf(scaleNames.value, scale.id)
			return {
				...scale,
				name,
				label: scaleLabel(name),
				customName: index === null ? null : (settings.value.extraNames[index] ?? null),
				hint: colorHint(scale.id),
				hex: toHex(scale.base),
				edited: isStatusKind(scale.id) && !!settings.value.status[scale.id],
			}
		}),
	)
	const selected = computed(() => colors.value.find((color) => color.id === selectedId.value) ?? null)
	const brandHex = computed(() => toHex(settings.value.brand))

	function refLabel(tokenRef: TokenRef) {
		return tokenRefLabel(tokenRef, scaleNames.value)
	}

	function updateBrand(id: BrandId, patch: Partial<Oklch>) {
		const index = extraColorIndex(id)
		if (index === null) {
			settings.value.brand = { ...settings.value.brand, ...patch }
			return
		}
		const current = settings.value.extras[index]
		if (!current) return
		settings.value.extras = settings.value.extras.map((color, position) =>
			position === index ? { ...current, ...patch } : color,
		)
	}

	function suggestExtraColor() {
		const { brand, extras } = settings.value
		if (!extras.length) return suggestSecondBrand(brand)
		return suggestDistinctColor([brand, ...extras, ...statusKinds.map((kind) => system.value[kind].base)])
	}

	function addColor() {
		history.snapshot()
		settings.value.extras = [...settings.value.extras, suggestExtraColor()]
		settings.value.extraNames = [...settings.value.extraNames, null]
		selectedId.value = extraColorId(settings.value.extras.length - 1)
	}

	function removeColor(id: ExtraColorId) {
		const index = extraColorIndex(id)
		if (index === null || index >= settings.value.extras.length) return
		history.snapshot()
		settings.value.extras = settings.value.extras.filter((_, position) => position !== index)
		settings.value.extraNames = settings.value.extraNames.filter((_, position) => position !== index)
		settings.value.tokens = withoutExtraColor(settings.value.tokens, index)
		const selectedIndex = selectedId.value ? extraColorIndex(selectedId.value) : null
		if (selectedIndex === index) selectedId.value = null
		else if (selectedIndex !== null && selectedIndex > index) selectedId.value = extraColorId(selectedIndex - 1)
	}

	function setColorName(id: ExtraColorId, name: string | null) {
		const index = extraColorIndex(id)
		if (index === null || (settings.value.extraNames[index] ?? null) === name) return
		history.snapshot()
		settings.value.extraNames = settings.value.extras.map((_, position) =>
			position === index ? name : (settings.value.extraNames[position] ?? null),
		)
	}

	function setNeutralTint(tint: number) {
		settings.value.neutralTint = tint
	}

	function setNeutralHue(hue: number | null) {
		settings.value.neutralHue = hue
	}

	function followBrandHue() {
		if (settings.value.neutralHue === null) return
		history.snapshot()
		settings.value.neutralHue = null
	}

	function load(state: BuilderState) {
		history.snapshot()
		settings.value = state
		selectedId.value = 'brand'
	}

	function updateStatus(kind: StatusKind, patch: Partial<Oklch>) {
		const current = settings.value.status[kind] ?? suggestedStatus.value[kind]
		settings.value.status = { ...settings.value.status, [kind]: { ...current, ...patch } }
	}

	function resetStatus(kind: StatusKind) {
		if (!settings.value.status[kind]) return
		history.snapshot()
		const { [kind]: _reset, ...rest } = settings.value.status
		settings.value.status = rest
	}

	function setToken(name: TokenName, mode: TokenMode, tokenRef: TokenRef) {
		if (tokens.value[name][mode].ref === tokenRef) return
		history.snapshot()
		settings.value.tokens = { ...settings.value.tokens, [name]: { ...settings.value.tokens[name], [mode]: tokenRef } }
	}

	function resetToken(name: TokenName, mode: TokenMode) {
		const current = settings.value.tokens[name]
		if (!current?.[mode]) return
		history.snapshot()
		const { [mode]: _reset, ...rest } = current
		const { [name]: _token, ...others } = settings.value.tokens
		settings.value.tokens = Object.keys(rest).length ? { ...others, [name]: rest } : others
	}

	function fixPair(pairId: string, mode: TokenMode) {
		history.snapshot()
		settings.value.tokens = fixReadability(system.value, settings.value.tokens, { pairId, mode })
	}

	function fixAll() {
		history.snapshot()
		settings.value.tokens = fixReadability(system.value, settings.value.tokens)
	}

	function select(offset: number) {
		const count = colors.value.length
		const index = colors.value.findIndex((color) => color.id === selectedId.value)
		const nextIndex = index === -1 ? (offset > 0 ? 0 : count - 1) : (index + offset + count) % count
		selectedId.value = colors.value[nextIndex]?.id ?? null
	}

	function toggleOpen(id: SystemColorId) {
		selectedId.value = selectedId.value === id ? null : id
	}

	return {
		settings,
		system,
		tokens,
		readability,
		failingReadability,
		visionWarnings,
		scaleNames,
		colors,
		selected,
		selectedId,
		brandHex,
		...history,
		refLabel,
		updateBrand,
		addColor,
		removeColor,
		setColorName,
		setNeutralTint,
		setNeutralHue,
		followBrandHue,
		load,
		updateStatus,
		resetStatus,
		setToken,
		resetToken,
		fixPair,
		fixAll,
		select,
		toggleOpen,
	}
}

export type DesignSystemBuilder = ReturnType<typeof useDesignSystemBuilder>
export const designSystemBuilderKey: InjectionKey<DesignSystemBuilder> = Symbol('design-system-builder')

export const defaultBrand: Oklch = { l: 0.55, c: 0.17, h: 258 }
