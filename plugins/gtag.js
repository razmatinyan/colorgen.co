export default defineNuxtPlugin((nuxtApp) => {
	const nuxtGTAG = ref(null)
	onNuxtReady(async () => {

		const VueGtag = await import('vue-gtag-next')
		nuxtGTAG.value = VueGtag
		
		nuxtApp.vueApp.use(VueGtag.default, {
			property: {
				id: nuxtApp.$config.public.gtagID
			},
			appName: 'colorgen.co',
			isEnabled: true,
			useDebugger: false,
			pageTrackerScreenviewEnabled: true,
		});

		VueGtag.trackRouter(useRouter());
	});

	return {
		provide: {
			nuxtGTAG
		}
	}
});