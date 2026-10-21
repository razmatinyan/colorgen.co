import type { InjectionKey } from 'vue'
import {
	checkReadability,
	checkVision,
	defaultNeutralTint,
	fixReadability,
	generateSystem,
	isStatusKind,
	parseTokenRef,
	resolveTokens,
	suggestSecondBrand,
	suggestStatusColors,
	systemScales,
	toHex,
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

export interface BuilderColor extends SystemScale {
	label: string
	hint: string
	hex: string
	edited: boolean
}

export type BuilderState = SystemSettings & { neutralHue: number | null; tokens: TokenOverrides }
export type BrandId = 'brand' | 'brand2'

export const colorDetails: Record<SystemColorId, { label: string; hint: string }> = {
	brand: { label: 'Brand', hint: 'Main buttons, links, focus rings' },
	brand2: { label: 'Second brand', hint: 'Secondary buttons, highlights, charts' },
	neutral: { label: 'Neutral', hint: 'Text, borders, backgrounds' },
	success: { label: 'Success', hint: 'Confirmations, positive changes' },
	warning: { label: 'Warning', hint: 'Pending states, things to double-check' },
	danger: { label: 'Danger', hint: 'Errors, destructive actions' },
	info: { label: 'Info', hint: 'Tips and announcements' },
}

export const defaultBrand: Oklch = { l: 0.55, c: 0.17, h: 258 }

export function tokenRefLabel(tokenRef: TokenRef) {
	const parsed = parseTokenRef(tokenRef)
	if (!parsed) return tokenRef
	return parsed === 'white' ? 'White' : `${colorDetails[parsed.scale].label} ${parsed.step}`
}

function withoutSecondBrandRefs(tokens: TokenOverrides): TokenOverrides {
	return Object.fromEntries(
		Object.entries(tokens)
			.map(([name, modes]) => [
				name,
				Object.fromEntries(Object.entries(modes ?? {}).filter(([, ref]) => !ref.startsWith('brand2.'))),
			])
			.filter(([, modes]) => Object.keys(modes as object).length > 0),
	)
}

export function useDesignSystemBuilder(initial: Partial<BuilderState> = {}) {
	const settings = ref<BuilderState>({
		brand: initial.brand ?? defaultBrand,
		brand2: initial.brand2 ?? null,
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

	const colors = computed<BuilderColor[]>(() =>
		systemScales(system.value).map((scale) => ({
			...scale,
			...colorDetails[scale.id],
			hex: toHex(scale.base),
			edited: isStatusKind(scale.id) && !!settings.value.status[scale.id],
		})),
	)
	const selected = computed(() => colors.value.find((color) => color.id === selectedId.value) ?? null)
	const brandHex = computed(() => toHex(settings.value.brand))

	function updateBrand(id: BrandId, patch: Partial<Oklch>) {
		const current = settings.value[id]
		if (current) settings.value[id] = { ...current, ...patch }
	}

	function addSecondBrand() {
		if (settings.value.brand2) return
		history.snapshot()
		settings.value.brand2 = suggestSecondBrand(settings.value.brand)
		selectedId.value = 'brand2'
	}

	function removeSecondBrand() {
		if (!settings.value.brand2) return
		history.snapshot()
		settings.value.brand2 = null
		settings.value.tokens = withoutSecondBrandRefs(settings.value.tokens)
		if (selectedId.value === 'brand2') selectedId.value = 'brand'
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
		colors,
		selected,
		selectedId,
		brandHex,
		...history,
		updateBrand,
		addSecondBrand,
		removeSecondBrand,
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
