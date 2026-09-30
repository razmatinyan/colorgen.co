import { getPaletteSync } from 'colorthief'

export default defineNuxtPlugin(() => ({
  provide: {
    extractPalette(image: HTMLImageElement, colorCount = 8) {
      return getPaletteSync(image, { colorCount })
    },
  },
}))
