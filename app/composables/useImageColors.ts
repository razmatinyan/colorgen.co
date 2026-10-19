import type { InjectionKey } from 'vue'
import {
	defaultExtractCount,
	describeColor,
	extractColors,
	maxExtractCount,
	minExtractCount,
	suggestBrandColor,
} from '~/lib/color'

export interface ImageColorItem {
	hex: string
	name: string
	share: number
}

const maxSide = 200
const paletteSize = 5

function drawSample(context: CanvasRenderingContext2D, width: number, height: number) {
	const sky = context.createLinearGradient(0, 0, 0, height * 0.7)
	sky.addColorStop(0, '#1e3a8a')
	sky.addColorStop(0.6, '#c2410c')
	sky.addColorStop(1, '#fb923c')
	context.fillStyle = sky
	context.fillRect(0, 0, width, height)
	context.fillStyle = '#fde047'
	context.beginPath()
	context.arc(width * 0.68, height * 0.52, height * 0.12, 0, Math.PI * 2)
	context.fill()
	context.fillStyle = '#166534'
	context.beginPath()
	context.moveTo(0, height * 0.7)
	context.quadraticCurveTo(width * 0.3, height * 0.5, width * 0.62, height * 0.72)
	context.lineTo(width, height * 0.66)
	context.lineTo(width, height)
	context.lineTo(0, height)
	context.fill()
	context.fillStyle = '#052e16'
	context.fillRect(0, height * 0.86, width, height * 0.14)
}

async function readPixels(source: CanvasImageSource, width: number, height: number) {
	const scale = Math.min(1, maxSide / Math.max(width, height))
	const canvas = document.createElement('canvas')
	canvas.width = Math.max(1, Math.round(width * scale))
	canvas.height = Math.max(1, Math.round(height * scale))
	const context = canvas.getContext('2d', { willReadFrequently: true })!
	context.drawImage(source, 0, 0, canvas.width, canvas.height)
	return context.getImageData(0, 0, canvas.width, canvas.height).data
}

export function useImageColors() {
	const imageUrl = ref<string | null>(null)
	const imageName = ref<string | null>(null)
	const pixels = shallowRef<Uint8ClampedArray | null>(null)
	const count = ref(defaultExtractCount)
	const isLoading = ref(false)
	const { showToast } = useAppToast()

	const extracted = computed(() => (pixels.value ? extractColors(pixels.value, { count: count.value }) : []))
	const colors = computed<ImageColorItem[]>(() =>
		extracted.value.map(({ hex, color, share }) => ({ hex, name: describeColor(color), share })),
	)
	const suggestedBrand = computed(() => suggestBrandColor(extracted.value))
	const brand = computed(
		() => colors.value.find((color) => color.hex === (suggestedBrand.value ?? extracted.value[0])?.hex) ?? null,
	)
	const isColorful = computed(() => suggestedBrand.value !== null)
	const bare = (hex: string) => hex.slice(1)
	const builderPath = computed(() => (brand.value ? `/builder/${bare(brand.value.hex)}` : '/builder'))
	const palettePath = computed(() => {
		if (!brand.value) return '/palette'
		const others = colors.value.filter((color) => color.hex !== brand.value!.hex)
		return `/palette/${[brand.value, ...others]
			.slice(0, paletteSize)
			.map((color) => bare(color.hex))
			.join('-')}`
	})
	const scalePath = computed(() => `/scale/${colors.value.map((color) => bare(color.hex)).join('-')}`)

	function replaceImage(url: string, name: string) {
		if (imageUrl.value?.startsWith('blob:')) URL.revokeObjectURL(imageUrl.value)
		imageUrl.value = url
		imageName.value = name
	}

	async function loadFile(file: File) {
		if (!file.type.startsWith('image/')) {
			showToast("That file isn't an image", 'error', { description: 'Use a JPG, PNG, WebP, GIF or AVIF file.' })
			return
		}
		isLoading.value = true
		try {
			const bitmap = await createImageBitmap(file)
			pixels.value = await readPixels(bitmap, bitmap.width, bitmap.height)
			bitmap.close()
			replaceImage(URL.createObjectURL(file), file.name)
		} catch {
			showToast("Couldn't read this image", 'error', { description: 'Try another file or format.' })
		} finally {
			isLoading.value = false
		}
	}

	async function loadSample() {
		const canvas = document.createElement('canvas')
		canvas.width = 640
		canvas.height = 420
		drawSample(canvas.getContext('2d')!, canvas.width, canvas.height)
		pixels.value = await readPixels(canvas, canvas.width, canvas.height)
		replaceImage(canvas.toDataURL('image/png'), 'Sample: sunset')
	}

	function clear() {
		if (imageUrl.value?.startsWith('blob:')) URL.revokeObjectURL(imageUrl.value)
		imageUrl.value = null
		imageName.value = null
		pixels.value = null
	}

	function setCount(value: number) {
		count.value = Math.min(maxExtractCount, Math.max(minExtractCount, Math.round(value)))
	}

	onScopeDispose(() => {
		if (imageUrl.value?.startsWith('blob:')) URL.revokeObjectURL(imageUrl.value)
	})

	return {
		imageUrl,
		imageName,
		count,
		isLoading,
		colors,
		brand,
		isColorful,
		builderPath,
		palettePath,
		scalePath,
		hasImage: computed(() => pixels.value !== null),
		loadFile,
		loadSample,
		clear,
		setCount,
	}
}

export type ImageColors = ReturnType<typeof useImageColors>
export const imageColorsKey: InjectionKey<ImageColors> = Symbol('image-colors')
