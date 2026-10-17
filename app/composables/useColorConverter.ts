import type { InjectionKey } from 'vue'
import { convertColor, describeColor, type Oklch } from '~/lib/color'
import { defaultBrand } from '~/composables/useDesignSystemBuilder'

export function useColorConverter(initial: Oklch | null = null) {
	const color = ref<Oklch>(initial ?? defaultBrand)
	const history = useUndoHistory(color)

	const conversion = computed(() => convertColor(color.value))
	const description = computed(() => describeColor(conversion.value.hex))

	function set(next: Oklch) {
		history.snapshot()
		color.value = next
	}

	function update(patch: Partial<Oklch>) {
		color.value = { ...color.value, ...patch }
	}

	return {
		color,
		conversion,
		description,
		...history,
		set,
		update,
	}
}

export type ColorConverter = ReturnType<typeof useColorConverter>
export const colorConverterKey: InjectionKey<ColorConverter> = Symbol('color-converter')
