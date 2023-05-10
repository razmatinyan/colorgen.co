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
			'/contact',
		],
		exclude: [
			'/saved'
		]
	},
	robots: {
		siteUrl: 'https://colorgen.co/',
		indexable: true,
		disallow: ['/saved', '/saved/**'],
	},
	routeRules: {
		'/saved/': { index: false },
	},
	app: {
		head: {
			htmlAttrs: {
				lang: 'en'
			},
			title: 'Color Palette Generator - Create Stunning Color Schemes Online | colorgen.co',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1.0',
			meta: [
				{
					name: "description",
					content: "Our Color Palette Generator makes it easy to create stunning color schemes for your designs. With endless combinations of colors to choose from, you can experiment with random palettes or select your own colors to achieve the perfect look. Whether you're a designer or simply want to add some color to your project, our online tool is the perfect solution. Try our Color Palette Generator today and start creating eye-catching designs in no time!"
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
	css: ["material-icons/iconfont/outlined.css", "vuetify/styles/main.css", "~/assets/reset.css", "~/assets/fonts.css", "~/assets/main.css", "~/assets/media.css"],
	alias: {
		"assets": "/<rootDir>/assets"
	},
	build: {
		transpile: ["vuetify"],
	},
})
