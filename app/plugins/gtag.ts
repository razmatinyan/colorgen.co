declare global {
	interface Window {
		gtag?: (command: 'config', targetId: string, params?: Record<string, unknown>) => void
	}
}

export default defineNuxtPlugin(() => {
	const gtagId = useRuntimeConfig().public.gtagId

	if (typeof gtagId !== 'string' || !gtagId) return

	const serializedId = JSON.stringify(gtagId).replaceAll('<', '\u003c')

	useHead({
		script: [
			{
				src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`,
				async: true,
			},
			{
				innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${serializedId});`,
			},
		],
	})

	if (import.meta.client) {
		useRouter().afterEach((to) => {
			window.gtag?.('config', gtagId, { page_path: to.fullPath })
		})
	}
})
