import type { InjectionKey } from 'vue'
import {
	defaultNeutralTint,
	generateSystem,
	isStatusKind,
	suggestStatusColors,
	systemColorIds,
	toHex,
	type Oklch,
	type StatusKind,
	type SystemColorId,
	type SystemScale,
	type SystemSettings,
} from '~/lib/color'

export interface BuilderColor extends SystemScale {
	label: string
	hint: string
	hex: string
	edited: boolean
}

const colorDetails: Record<SystemColorId, { label: string, hint: string }> = {
	brand: { label: 'Brand', hint: 'Main buttons, links, focus rings' },
	neutral: { label: 'Neutral', hint: 'Text, borders, backgrounds' },
	success: { label: 'Success', hint: 'Confirmations, positive changes' },
	warning: { label: 'Warning', hint: 'Pending states, things to double-check' },
	danger: { label: 'Danger', hint: 'Errors, destructive actions' },
	info: { label: 'Info', hint: 'Tips and announcements' },
}

export const defaultBrand: Oklch = { l: 0.55, c: 0.17, h: 258 }

export function useDesignSystemBuilder(initial: Partial<SystemSettings> = {}) {
	const settings = ref<SystemSettings>({ brand: defaultBrand, neutralTint: defaultNeutralTint, status: {}, ...initial })
	const history = useUndoHistory(settings)
	const selectedId = ref<SystemColorId | null>('brand')

	const system = computed(() => generateSystem(settings.value))
	const suggestedStatus = computed(() => suggestStatusColors(settings.value.brand))

	const colors = computed<BuilderColor[]>(() => systemColorIds.map(id => ({
		...system.value[id],
		...colorDetails[id],
		hex: toHex(system.value[id].base),
		edited: isStatusKind(id) && !!settings.value.status[id],
	})))
	const selected = computed(() => colors.value.find(color => color.id === selectedId.value) ?? null)
	const brandHex = computed(() => toHex(settings.value.brand))

	function updateBrand(patch: Partial<Oklch>) {
		settings.value.brand = { ...settings.value.brand, ...patch }
	}

	function setNeutralTint(tint: number) {
		settings.value.neutralTint = tint
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

	function select(offset: number) {
		const count = colors.value.length
		const index = colors.value.findIndex(color => color.id === selectedId.value)
		const nextIndex = index === -1 ? (offset > 0 ? 0 : count - 1) : (index + offset + count) % count
		selectedId.value = colors.value[nextIndex]?.id ?? null
	}

	function toggleOpen(id: SystemColorId) {
		selectedId.value = selectedId.value === id ? null : id
	}

	return {
		settings,
		system,
		colors,
		selected,
		selectedId,
		brandHex,
		...history,
		updateBrand,
		setNeutralTint,
		updateStatus,
		resetStatus,
		select,
		toggleOpen,
	}
}

export type DesignSystemBuilder = ReturnType<typeof useDesignSystemBuilder>
export const designSystemBuilderKey: InjectionKey<DesignSystemBuilder> = Symbol('design-system-builder')
