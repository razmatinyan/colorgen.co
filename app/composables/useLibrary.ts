import { createSharedComposable, useLocalStorage } from '@vueuse/core'
import { clearRecents, emptyLibrary, parseLibrary, upsertRecent, type LibraryData, type RecentItem, type RecentKind } from '~/lib/library'

const storageKey = 'colorgen-library'

export const useLibrary = createSharedComposable(() => {
	const library = useLocalStorage<LibraryData>(storageKey, emptyLibrary(), {
		serializer: { read: parseLibrary, write: value => JSON.stringify(value) },
		initOnMounted: true,
	})

	return {
		recents: computed(() => library.value.recents),
		rememberRecent: (entry: RecentItem) => {
			library.value = upsertRecent(library.value, entry)
		},
		clearRecents: () => {
			library.value = clearRecents(library.value)
		},
	}
})

export type RecentSnapshot = Pick<RecentItem, 'title' | 'colors'>

export function useRecentTracking(kind: RecentKind, snapshot: () => RecentSnapshot | null) {
	const route = useRoute()
	const { rememberRecent } = useLibrary()

	onMounted(() => {
		const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
		watch(() => route.fullPath, (path) => {
			const current = snapshot()
			if (current) rememberRecent({ id, kind, path, visitedAt: Date.now(), ...current })
		}, { immediate: true })
	})
}
