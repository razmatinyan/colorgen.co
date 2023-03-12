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
    css: ["~/assets/reset.css", "~/assets/fonts.css", "~/assets/main.css"],
    alias: {
        assets: "/<rootDir>/assets"
    }
})
