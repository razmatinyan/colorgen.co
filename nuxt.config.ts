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
            title: 'Color Palette Generator - Create Stunning Color Schemes Online | colorgen.co',
            charset: 'utf-8',
            viewport: 'user-scalable=0, initial-scale=1.0, maximum-scale=1.0, width=device-width',
            meta: [
                {
                    name: "description",
                    content: "Our Color Palette Generator makes it easy to create stunning color schemes for your designs. With endless combinations of colors to choose from, you can experiment with random palettes or select your own colors to achieve the perfect look. Whether you're a designer or simply want to add some color to your project, our online tool is the perfect solution. Try our Color Palette Generator today and start creating eye-catching designs in no time!"
                },
                {
                    name: "keywords",
                    content: "color palette generator, create color schemes, random color palettes, online color tool, color combination tool, design tool, ColorGen"
                }
            ],
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
