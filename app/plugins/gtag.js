export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()
	const gtagId = config.public.gtagID

	if (!gtagId) return

	const serializedId = JSON.stringify(String(gtagId)).replaceAll('<', '\\u003c')

	useHead({
		script: [
			{
				src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(String(gtagId))}`,
				async: true,
			},
			{
				innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${serializedId});`,
			},
		],
	})

	if (import.meta.client) {
		const router = useRouter()

		router.afterEach((to) => {
			window.gtag?.('config', String(gtagId), { page_path: to.fullPath })
		})
	}
})
