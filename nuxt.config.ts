// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    typescript: {
        shim: false
    },
    imports: {
        dirs: [
          'utils/**'
        ]
    },
    app: {
        head: {
            title: 'Generate Your Color Palette! | colorgen.co',
            charset: 'utf-8',
            viewport: 'user-scalable=0, initial-scale=1.0, maximum-scale=1.0, width=device-width',
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/cg-only.svg' }
            ],
        },
    },
    css: ["~/assets/reset.css", "~/assets/fonts.css", "~/assets/main.css"],
    alias: {
        "assets": "/<rootDir>/assets"
    }
})
