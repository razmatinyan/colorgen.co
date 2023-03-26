export default defineEventHandler((event) => {
    const palette = event.context.params?.palette
    return palette
})