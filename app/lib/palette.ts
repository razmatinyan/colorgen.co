/**
 * Palette generator state and color helpers for /palette.
 * The color math here is interim and untested; Phase 1 moves it into the tested
 * engine in app/lib/color/ and this module keeps only the generator state.
 */
import { clampChroma, converter, formatHex, formatHsl, formatRgb, parse, wcagContrast } from 'culori'
import { computed, ref, toRaw, type InjectionKey } from 'vue'

export type Harmony = 'analogous' | 'complementary' | 'split' | 'triadic' | 'tetradic' | 'mono'

export interface PaletteColor {
	id: string
	role: string
	/** Plain-language explanation of where the color is used. */
	hint: string
	l: number
	c: number
	h: number
	locked: boolean
}

/** Generation styles, described in plain words for the UI. */
export const harmonies: { value: Harmony, label: string, description: string }[] = [
	{ value: 'analogous', label: 'Analogous', description: 'Neighboring hues. Calm and cohesive.' },
	{ value: 'complementary', label: 'Complementary', description: 'Opposite hues. Strong contrast.' },
	{ value: 'split', label: 'Split complementary', description: 'One hue plus two near its opposite.' },
	{ value: 'triadic', label: 'Triadic', description: 'Three evenly spaced hues. Vibrant.' },
	{ value: 'tetradic', label: 'Tetradic', description: 'Four hues. Rich, needs balance.' },
	{ value: 'mono', label: 'Monochrome', description: 'One hue in different strengths.' },
]

const hueOffsets: Record<Harmony, number[]> = {
	analogous: [0, 30, -30, 60, 0],
	complementary: [0, 180, 180, 0, 0],
	split: [0, 150, 210, 0, 0],
	triadic: [0, 120, 240, 0, 0],
	tetradic: [0, 90, 180, 270, 0],
	mono: [0, 0, 0, 0, 0],
}

/** Lightness/chroma ranges per role so generated palettes stay usable as UI colors. */
const roleRanges = [
	{ role: 'Primary', l: [0.48, 0.6], c: [0.12, 0.19] },
	{ role: 'Secondary', l: [0.6, 0.72], c: [0.09, 0.15] },
	{ role: 'Accent', l: [0.68, 0.79], c: [0.13, 0.2] },
	{ role: 'Highlight', l: [0.87, 0.94], c: [0.06, 0.12] },
	{ role: 'Neutral', l: [0.24, 0.32], c: [0.01, 0.03] },
] as const

export const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
const scaleLightness = [0.975, 0.94, 0.885, 0.805, 0.715, 0.625, 0.535, 0.45, 0.37, 0.29, 0.21]

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const wrapHue = (h: number) => ((h % 360) + 360) % 360

function inGamut(color: { l: number, c: number, h: number }) {
	return clampChroma({ mode: 'oklch', ...color }, 'oklch')
}

export function toHex(color: { l: number, c: number, h: number }) {
	return formatHex(inGamut(color))
}

export function toCss(color: { l: number, c: number, h: number }) {
	const { l, c, h } = inGamut(color) as { l: number, c: number, h?: number }
	return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${(h ?? 0).toFixed(1)})`
}

export function formats(color: PaletteColor) {
	const mapped = inGamut(color)
	return [
		{ label: 'HEX', value: formatHex(mapped).toUpperCase() },
		{ label: 'RGB', value: formatRgb(mapped) },
		{ label: 'HSL', value: formatHsl(mapped) },
		{ label: 'OKLCH', value: toCss(color) },
	]
}

export function scaleOf(color: { l: number, c: number, h: number }) {
	return scaleLightness.map((l) => {
		// Taper chroma toward the extremes so tints and shades don't look neon or muddy.
		const taper = 1 - Math.abs(l - 0.6) ** 2 * 2.2
		return toHex({ l, c: color.c * Math.max(0.25, taper), h: color.h })
	})
}

export function contrast(a: string, b: string) {
	return wcagContrast(a, b)
}

export function readableOn(hex: string) {
	return contrast(hex, '#ffffff') >= contrast(hex, '#111114') ? '#ffffff' : '#111114'
}

const initial: Omit<PaletteColor, 'id' | 'locked'>[] = [
	{ role: 'Primary', hint: 'Buttons, toggles, active items', l: 0.52, c: 0.13, h: 250 },
	{ role: 'Secondary', hint: 'Secondary buttons, positive numbers', l: 0.68, c: 0.11, h: 190 },
	{ role: 'Accent', hint: 'Badges and alerts', l: 0.73, c: 0.16, h: 48 },
	{ role: 'Highlight', hint: 'Avatars and soft accents', l: 0.91, c: 0.09, h: 95 },
	{ role: 'Neutral', hint: 'Text, borders, backgrounds', l: 0.28, c: 0.02, h: 255 },
]

type Oklch = Pick<PaletteColor, 'l' | 'c' | 'h'>

const toOklch = converter('oklch')

/**
 * Parses a `/palette/<colors>` route param ("1f6cb0-25aea7-f68443", no `#`).
 * Returns null unless every part is a valid 3- or 6-digit hex color.
 */
export function parseColorsParam(param: string | undefined): Oklch[] | null {
	if (!param) return null
	const parts = param.toLowerCase().split('-')
	if (!parts.every(part => /^(?:[0-9a-f]{3}|[0-9a-f]{6})$/.test(part))) return null
	return parts.map((part) => {
		const { l, c, h } = toOklch(parse(`#${part}`))!
		return { l, c, h: h ?? 0 }
	})
}

/** Serializes colors to the `/palette/<colors>` route param. */
export function toColorsParam(colors: Oklch[]) {
	return colors.map(color => toHex(color).slice(1)).join('-')
}

/**
 * @param initialColors Colors from the URL. Fills roles in order; roles without a
 * color keep their defaults, extra colors are ignored.
 */
export function usePaletteGenerator(initialColors: Oklch[] | null = null) {
	const colors = ref<PaletteColor[]>(initial.map((color, index) => ({
		...color,
		...initialColors?.[index],
		id: `c${index}`,
		locked: false,
	})))
	/** The expanded color in the sidebar; null when all are collapsed. */
	const selectedId = ref<string | null>(colors.value[0]!.id)
	const harmony = ref<Harmony>('analogous')
	const history = ref<PaletteColor[][]>([])
	const future = ref<PaletteColor[][]>([])

	const selected = computed(() => colors.value.find(color => color.id === selectedId.value) ?? null)
	const hexes = computed(() => colors.value.map(toHex))

	function snapshot() {
		history.value.push(structuredClone(toRaw(colors.value)))
		if (history.value.length > 50) history.value.shift()
		future.value = []
	}

	function generate() {
		snapshot()
		const anchor = colors.value[0]!.locked ? colors.value[0]!.h : rand(0, 360)
		const offsets = hueOffsets[harmony.value]
		colors.value = colors.value.map((color, index) => {
			if (color.locked) return color
			const range = roleRanges[index] ?? roleRanges[1]
			return {
				...color,
				l: rand(range.l[0], range.l[1]),
				c: rand(range.c[0], range.c[1]),
				h: wrapHue(anchor + (offsets[index] ?? 0) + rand(-8, 8)),
			}
		})
	}

	function undo() {
		const previous = history.value.pop()
		if (!previous) return
		future.value.push(structuredClone(toRaw(colors.value)))
		colors.value = previous
	}

	function redo() {
		const next = future.value.pop()
		if (!next) return
		history.value.push(structuredClone(toRaw(colors.value)))
		colors.value = next
	}

	function toggleLock(id: string) {
		const color = colors.value.find(item => item.id === id)
		if (color) color.locked = !color.locked
	}

	function update(id: string, patch: Partial<Pick<PaletteColor, 'l' | 'c' | 'h'>>) {
		const color = colors.value.find(item => item.id === id)
		if (color) Object.assign(color, patch)
	}

	function select(offset: number) {
		const count = colors.value.length
		const index = colors.value.findIndex(color => color.id === selectedId.value)
		const nextIndex = index === -1 ? (offset > 0 ? 0 : count - 1) : (index + offset + count) % count
		const next = colors.value[nextIndex]
		if (next) selectedId.value = next.id
	}

	/** Expands a color, or collapses it if it's already open. */
	function toggleOpen(id: string) {
		selectedId.value = selectedId.value === id ? null : id
	}

	function cssExport() {
		const lines = colors.value.flatMap((color) => {
			const name = color.role.toLowerCase()
			return scaleOf(color).map((hex, index) => `  --${name}-${scaleSteps[index]}: ${hex};`)
		})
		return `:root {\n${lines.join('\n')}\n}`
	}

	return {
		colors,
		selected,
		selectedId,
		hexes,
		harmony,
		canUndo: computed(() => history.value.length > 0),
		canRedo: computed(() => future.value.length > 0),
		snapshot,
		generate,
		undo,
		redo,
		toggleLock,
		update,
		select,
		toggleOpen,
		cssExport,
	}
}

export type PaletteGenerator = ReturnType<typeof usePaletteGenerator>
export const paletteGeneratorKey: InjectionKey<PaletteGenerator> = Symbol('palette-generator')
