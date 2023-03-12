// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    typescript: {
        shim: false
    },
    runtimeConfig: {
        apikey: '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',
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
