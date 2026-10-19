import tailwindcss from '@tailwindcss/vite'
import { colorSitemapPaths } from './app/lib/sitemap-colors'

export default defineNuxtConfig({
	compatibilityDate: '2026-09-30',
	devtools: { enabled: false },
	runtimeConfig: {
		public: {
			gtagId: process.env.GTAG_ID,
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
	modules: [
		'@nuxt/icon',
		'shadcn-nuxt',
		'@nuxtjs/sitemap',
		'@nuxtjs/robots',
		'@nuxtjs/color-mode',
		'@nuxt/fonts',
		'nuxt-og-image',
	],
	colorMode: {
		classSuffix: '',
		preference: 'system',
		fallback: 'light',
		storageKey: 'sygen-color-mode',
	},
	fonts: {
		families: [{ name: 'Inter', provider: 'google', weights: [400, 500, 600, 700], global: true }],
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
		url: 'https://sygenn.vercel.app',
		name: 'Sygen',
		indexable: true,
	},
	sitemap: {
		zeroRuntime: true,
		xsl: false,
		urls: [
			'/builder',
			'/palette',
			'/scale',
			'/contrast',
			'/convert',
			'/gradient',
			'/palette/326789-78a6c8-e9eef2-e65c4f',
			'/palette/0295a9-12adc1-fdd037-f5f5f5',
			'/palette/1c1c1e-ba8f6c-9f9d99-fafaf8-23262b',
			'/palette/143449-d6f863-fe6122-f5f7f8-0c1828',
			'/palette/41436a-974063-f54768-ff9677',
			'/palette/2e424d-5b8291-98dad9-eaebed',
			...colorSitemapPaths(),
		],
		exclude: ['/saved', '/saved/**'],
	},
	robots: {
		disallow: ['/saved', '/saved/*'],
	},
	routeRules: {
		'/saved': { robots: false },
		'/saved/**': { robots: false },
	},
	app: {
		head: {
			htmlAttrs: {
				lang: 'en',
			},
			title: 'Sygen: Turn your brand color into a complete design system',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1.0',
			meta: [
				{
					name: 'description',
					content:
						'Brand, neutral and status color scales, light and dark tokens that pass WCAG, and exports for Tailwind, shadcn, CSS and Figma, from one brand color.',
				},
				{
					name: 'keywords',
					content:
						'Design system colors, Color scales, Design tokens, Tailwind colors, shadcn theme, Color palette, Sygen',
				},
				{
					property: 'og:site_name',
					content: 'Sygen',
				},
				{
					property: 'og:type',
					content: 'website',
				},
			],
			link: [
				{ rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
				{ rel: 'icon', type: 'image/svg+xml', href: '/logo-dark-sm.svg' },
				{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
			],
		},
	},
	ogImage: {
		defaults: { width: 1200, height: 630 },
	},
	css: ['~/assets/css/tailwind.css', 'vue-sonner/style.css'],
})
