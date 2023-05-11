import svgLoader from 'vite-svg-loader'

// TODO: Add rel canonical to all pages using useHead composable. 

export default defineNuxtConfig({
	typescript: {
		shim: false
	},
	imports: {
		dirs: [
		  'utils/**'
		]
	},
	runtimeConfig: {
		public: {
			BASE_URL: 'colorgen.co',
			gtagID: process.env.GTAG_ID
		}
	},
	vite: {
		plugins: [
			svgLoader(),
		],
	},
	modules: [
		'nuxt-simple-sitemap',
		'nuxt-simple-robots',
	],
	sitemap: {
		siteUrl: 'https://colorgen.co/',
		include: [
			'/',
			'/gradient',
			'/palette',
			'/image-colors',
			'/contact',
		],
		exclude: [
			'/saved'
		]
	},
	robots: {
		siteUrl: 'https://colorgen.co/',
		indexable: true,
		disallow: ['/saved', '/saved/*'],
	},
	routeRules: {
		'/saved/': { index: false },
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
					hid: "og:image",
					property: "og:image",
					content: "/og-image.jpg"
				},
				{
					hid: "og:site_name",
					property: "og:site_name",
					content: "Colorgen"
				},
				{
					hid: "og:type",
					property: "og:type",
					content: "website"
				},
			],
			link: [
				{ rel: 'icon', type: 'image/x-icon', href: '/cg-only.svg' },
			],
		},
	},
	css: ["material-icons/iconfont/outlined.css", "~/assets/vuetify_main.css", "~/assets/reset.css", "~/assets/fonts.css", "~/assets/main.css", "~/assets/media.css"],
	alias: {
		"assets": "/<rootDir>/assets"
	},
	build: {
		transpile: ["vuetify"],
	},
})
