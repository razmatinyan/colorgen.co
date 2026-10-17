<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { formatColor, scaleHexes, toHex, wcagRatio, type ColorFormat } from '~/lib/color'
import { paletteGeneratorKey, type PaletteColor } from '~/composables/usePaletteGenerator'

const props = defineProps<{ color: PaletteColor }>()
const palette = inject(paletteGeneratorKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

const hex = computed(() => toHex(props.color))

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
	].map(check => ({ ...check, ratio: wcagRatio(hex.value, check.against) }))
})

async function copyValue(value: string) {
	await copy(value)
	showToast(`Copied ${value}`, 'success')
}
</script>

<template>
	<div class="grid grid-cols-1 gap-5 px-2.5 pt-1 pb-3">
		<ColorChannelSliders :color="color" @update="patch => palette.update(color.id, patch)" @commit="palette.snapshot()" />

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
					<ColorContrastBadge :ratio="check.ratio" class="bg-background/90 dark:bg-background/90" />
					<span class="sr-only">{{ check.label }}</span>
				</li>
			</ul>
			<p class="text-sm text-muted-foreground">On white, black, and your page background.</p>
		</section>
	</div>
</template>
