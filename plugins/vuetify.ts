import { createVuetify } from 'vuetify';
import { VApp } from 'vuetify/components/VApp';
import { VColorPicker } from 'vuetify/components/VColorPicker';
import { VTooltip } from 'vuetify/components/VTooltip';
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin(nuxt => {
    const vuetify = createVuetify({
        ssr: true,
        components: {
            VApp,
            VColorPicker,
            VTooltip
        },
        directives
    });
    nuxt.vueApp.use(vuetify);
})