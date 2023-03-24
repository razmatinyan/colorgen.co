import chroma from 'chroma-js'

export default defineNuxtPlugin(() => {
    return {
        provide: {
            chroma
        }
    }
})