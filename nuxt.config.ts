import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2026-09-30',
	devtools: { enabled: false },
	runtimeConfig: {
		public: {
			BASE_URL: 'https://colorgen.co',
			gtagID: process.env.GTAG_ID
		}
	},
	vite: {
		plugins: [
			tailwindcss(),
		],
	},
	modules: [
		'@nuxt/icon',
		'shadcn-nuxt',
		'@nuxtjs/sitemap',
		'@nuxtjs/robots',
		'@nuxtjs/color-mode',
		'@nuxt/fonts',
	],
	colorMode: {
		classSuffix: '',
		preference: 'system',
		fallback: 'light',
		storageKey: 'colorgen-color-mode',
	},
	fonts: {
		families: [
			{ name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
		],
	},
	shadcn: {
		prefix: '',
		componentDir: '@/components/ui',
	},
	icon: {
		mode: 'svg',
		clientBundle: {
			scan: true,
		},
	},
	site: {
		url: 'https://colorgen.co',
		name: 'ColorGen',
		indexable: true,
	},
	sitemap: {
		zeroRuntime: true,
		xsl: false,
		urls: [
			'/palette/326789-78a6c8-e9eef2-e65c4f',
			'/palette/0295a9-12adc1-fdd037-f5f5f5',
			'/palette/1c1c1e-ba8f6c-9f9d99-fafaf8-23262b',
			'/palette/143449-d6f863-fe6122-f5f7f8-0c1828',
			'/palette/41436a-974063-f54768-ff9677',
			'/palette/2e424d-5b8291-98dad9-eaebed',
		],
		exclude: [
			'/saved',
			'/saved/**',
			'/prototype/**',
		]
	},
	robots: {
		disallow: ['/saved', '/saved/*', '/prototype/*'],
	},
	routeRules: {
		'/saved': { robots: false },
		'/saved/**': { robots: false },
		'/prototype/**': { robots: false },
	},
	app: {
		head: {
			htmlAttrs: {
				lang: 'en'
			},
			title: 'ColorGen - Create Stunning Color Palettes | colorgen.co',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1.0',
			meta: [
				{
					name: "description",
					content: "Our Color Palette Generator makes easy to create stunning color schemes for your designs. With endless combinations of colors, you can experiment with random palettes or select your own color to achieve the perfect look."
				},
				{
					name: "keywords",
					content: "Color Palette, Palette, Generator, Design, Color combination, Color Schemes, Colorgen"
				},
				{
					property: "og:image",
					content: "/og-image.jpg"
				},
				{
					property: "og:site_name",
					content: "Colorgen"
				},
				{
					property: "og:type",
					content: "website"
				},
				{
					name: "google-site-verification",
					content: "_nkR76E889L8-Gs_AQOTLSCNwkS4PKh40ZgsIoL028w"
				},
			],
			link: [
				{ rel: 'icon', type: 'image/svg+xml', href: '/cg-only.svg' },
			],
		},
	},
	css: ['~/assets/css/tailwind.css'],
})
