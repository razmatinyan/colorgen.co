<script setup lang="ts">
import type { Oklch } from '~/lib/color'

const props = defineProps<{ color: Oklch }>()
const emit = defineEmits<{ update: [patch: Partial<Oklch>]; commit: [] }>()

const maxChroma = 0.37

function channel(key: keyof Oklch) {
	return computed({
		get: () => props.color[key],
		set: (value) => emit('update', { [key]: value }),
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
		c: `linear-gradient(to right in oklch, oklch(${l} 0 ${h}), oklch(${l} ${maxChroma} ${h}))`,
		h: `linear-gradient(to right, ${hueStops})`,
	}
})
</script>

<template>
	<div class="grid gap-4">
		<ColorGradientSlider
			v-model="lightness"
			label="Lightness"
			:min="0"
			:max="1"
			:track="tracks.l"
			:format="(v) => `${Math.round(v * 100)}%`"
			@commit="emit('commit')"
		/>
		<ColorGradientSlider
			v-model="intensity"
			label="Intensity"
			:min="0"
			:max="maxChroma"
			:track="tracks.c"
			:format="(v) => `${Math.round((v / maxChroma) * 100)}%`"
			@commit="emit('commit')"
		/>
		<ColorGradientSlider
			v-model="hue"
			label="Hue"
			:min="0"
			:max="360"
			:step="0.1"
			:track="tracks.h"
			:format="(v) => `${Math.round(v)}°`"
			@commit="emit('commit')"
		/>
	</div>
</template>
