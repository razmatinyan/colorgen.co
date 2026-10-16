<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { formatColor, scaleHexes, toHex, wcagLevel, wcagRatio, type ColorFormat, type WcagLevel } from '~/lib/color'
import { paletteGeneratorKey, type PaletteColor } from '~/composables/usePaletteGenerator'

const props = defineProps<{ color: PaletteColor }>()
const palette = inject(paletteGeneratorKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

const hex = computed(() => toHex(props.color))

function channel(key: 'l' | 'c' | 'h') {
	return computed({
		get: () => props.color[key],
		set: value => palette.update(props.color.id, { [key]: value }),
	})
}
const lightness = channel('l')
const intensity = channel('c')
const hue = channel('h')

const tracks = computed(() => {
	const { l, c, h } = props.color
	const hueStops = Array.from({ length: 13 }, (_, i) => `oklch(${l} ${c} ${i * 30})`).join(', ')
	return {
		l: `linear-gradient(to right, oklch(0 ${c} ${h}), oklch(0.5 ${c} ${h}), oklch(1 ${c} ${h}))`,
		c: `linear-gradient(to right in oklch, oklch(${l} 0 ${h}), oklch(${l} 0.37 ${h}))`,
		h: `linear-gradient(to right, ${hueStops})`,
	}
})

const copyFormats: { format: ColorFormat, label: string }[] = [
	{ format: 'hex', label: 'HEX' },
	{ format: 'rgb', label: 'RGB' },
	{ format: 'hsl', label: 'HSL' },
	{ format: 'oklch', label: 'OKLCH' },
]

const copyValues = computed(() => copyFormats.map(({ format, label }) => ({
	label,
	value: format === 'hex' ? hex.value.toUpperCase() : formatColor(props.color, format),
})))

const checks = computed(() => {
	const pageBackground = scaleHexes(palette.colors.value.at(-1)!)[0]!
	return [
		{ label: 'On white', against: '#ffffff' },
		{ label: 'On black', against: '#000000' },
		{ label: 'On page background', against: pageBackground },
	].map((check) => {
		const ratio = wcagRatio(hex.value, check.against)
		return { ...check, ratio, level: wcagLevel(ratio) }
	})
})

const levelLabel: Record<WcagLevel, string> = {
	'AAA': 'AAA',
	'AA': 'AA',
	'AA Large': 'Large',
	'Fail': 'Fail',
}

const levelClass: Record<WcagLevel, string> = {
	'AAA': 'bg-success/15 text-success',
	'AA': 'bg-success/15 text-success',
	'AA Large': 'bg-warning/25 text-foreground',
	'Fail': 'bg-destructive/10 text-destructive',
}

async function copyValue(value: string) {
	await copy(value)
	showToast(`Copied ${value}`, 'success')
}
</script>

<template>
	<div class="grid grid-cols-1 gap-5 px-2.5 pt-1 pb-3">
		<div class="grid gap-4">
			<ColorGradientSlider v-model="lightness" label="Lightness" :min="0" :max="1" :track="tracks.l" :format="v => `${Math.round(v * 100)}%`" @commit="palette.snapshot()" />
			<ColorGradientSlider v-model="intensity" label="Intensity" :min="0" :max="0.37" :track="tracks.c" :format="v => `${Math.round((v / 0.37) * 100)}%`" @commit="palette.snapshot()" />
			<ColorGradientSlider v-model="hue" label="Hue" :min="0" :max="360" :step="0.1" :track="tracks.h" :format="v => `${Math.round(v)}°`" @commit="palette.snapshot()" />
		</div>

		<section class="grid grid-cols-1 gap-2">
			<h3 class="text-sm font-medium">Copy as</h3>
			<div class="grid grid-cols-4 gap-1.5">
				<Tooltip v-for="item in copyValues" :key="item.label">
					<TooltipTrigger as-child>
						<Button variant="outline" size="sm" class="bg-background dark:bg-input/30" @click="copyValue(item.value)">
							{{ item.label }}
						</Button>
					</TooltipTrigger>
					<TooltipContent>{{ item.value }}</TooltipContent>
				</Tooltip>
			</div>
		</section>

		<section class="grid grid-cols-1 gap-2">
			<h3 class="text-sm font-medium">Readable as text?</h3>
			<ul class="grid grid-cols-3 gap-1.5">
				<li
					v-for="check in checks"
					:key="check.label"
					class="flex flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 ring-1 ring-foreground/10 ring-inset"
					:style="{ background: check.against }"
				>
					<span class="text-lg font-semibold" :style="{ color: hex }">Aa</span>
					<Badge variant="secondary" :class="levelClass[check.level]" class="bg-background/90 dark:bg-background/90">
						{{ levelLabel[check.level] }} · {{ check.ratio.toFixed(1) }}
					</Badge>
					<span class="sr-only">{{ check.label }}</span>
				</li>
			</ul>
			<p class="text-sm text-muted-foreground">On white, black, and your page background.</p>
		</section>
	</div>
</template>
