import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'

const pendingToolSyncs = new Set<string>()

export const useToolVisit = () => useState('tool-visit', () => 0)

export function isToolSyncNavigation(to: RouteLocationNormalized) {
	return pendingToolSyncs.delete(to.fullPath)
}

export function toolPageKey(route: RouteLocationNormalized, visit: number) {
	return typeof route.meta.key === 'string' ? `${route.meta.key}:${visit}` : route.path
}

export function useToolUrlSync() {
	const router = useRouter()
	const route = useRoute()
	const pageKey = route.meta.key
	let isActive = true
	onScopeDispose(() => {
		isActive = false
	})

	return (location: RouteLocationRaw) => {
		if (!isActive || route.meta.key !== pageKey) return
		const path = router.resolve(location).fullPath
		if (path === route.fullPath) return
		pendingToolSyncs.add(path)
		return router.replace(location)
	}
}
