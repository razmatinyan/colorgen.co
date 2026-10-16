import type { Ref } from 'vue'

export function useUndoHistory<T>(source: Ref<T>, capacity = 50) {
	const past = shallowRef<T[]>([])
	const future = shallowRef<T[]>([])

	const copy = () => structuredClone(toRaw(source.value))

	function snapshot() {
		past.value = [...past.value, copy()].slice(-capacity)
		future.value = []
	}

	function undo() {
		const previous = past.value.at(-1)
		if (previous === undefined) return
		future.value = [...future.value, copy()]
		past.value = past.value.slice(0, -1)
		source.value = previous
	}

	function redo() {
		const next = future.value.at(-1)
		if (next === undefined) return
		past.value = [...past.value, copy()]
		future.value = future.value.slice(0, -1)
		source.value = next
	}

	return {
		snapshot,
		undo,
		redo,
		canUndo: computed(() => past.value.length > 0),
		canRedo: computed(() => future.value.length > 0),
	}
}
