export default defineNuxtPlugin((nuxtApp) => {
	const router = useRouter()
	const visit = useToolVisit()

	router.afterEach((to, from, failure) => {
		const isToolSync = isToolSyncNavigation(to)
		if (failure || isToolSync || nuxtApp.isHydrating || to.fullPath === from.fullPath) return
		if (typeof to.meta.key === 'string' && to.meta.key === from.meta.key) visit.value++
	})
})
