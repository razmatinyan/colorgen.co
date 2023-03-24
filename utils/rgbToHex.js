export const rgbToHex = (rgbColor) => {
    const { $chroma } = useNuxtApp();
    return $chroma(rgbColor).hex();
}