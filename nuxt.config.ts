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
            charset: 'utf-8',
            viewport: 'user-scalable=0, initial-scale=1.0, maximum-scale=1.0, width=device-width',
        }
    },
    css: ["~/assets/reset.css", "~/assets/fonts.css", "~/assets/main.css"],
    alias: {
        assets: "/<rootDir>/assets"
    }
})
