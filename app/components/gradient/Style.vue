<script setup lang="ts">
import type { GradientSpace } from '~/lib/color'
import { gradientGeneratorKey } from '~/composables/useGradientGenerator'
import type { GradientType } from '~/lib/gradient-url'

const generator = inject(gradientGeneratorKey)!

const shapes = [
	{ value: 'linear', label: 'Linear' },
	{ value: 'radial', label: 'Radial' },
	{ value: 'conic', label: 'Conic' },
] as const

const blendDetails: Record<GradientSpace, { label: string; hint: string }> = {
	oklch: { label: 'Vivid', hint: 'Stays bright in the middle · OKLCH' },
	oklab: { label: 'Smooth', hint: 'Even lightness, softer middle · OKLab' },
	srgb: { label: 'Classic', hint: 'Plain CSS default, can go gray · sRGB' },
}

const shape = computed({
	get: () => generator.state.value.type,
	set: (type: GradientType) => generator.setType(type),
})
const angle = computed({
	get: () => generator.state.value.angle,
	set: (value: number) => generator.setAngle(value),
})
const angleTrack = computed(
	() =>
		`linear-gradient(to right, ${generator.blends.value.find((blend) => blend.space === generator.state.value.space)!.hexes.join(', ')})`,
)
const blendLabelId = useId()
</script>

<template>
	<div class="grid gap-5">
		<div class="grid gap-2.5">
			<p class="text-sm font-medium">Shape</p>
			<AppSegmentedControl v-model="shape" :options="shapes" label="Shape" class="w-fit" />
		</div>

		<ColorGradientSlider
			v-if="generator.state.value.type !== 'radial'"
			v-model="angle"
			:label="generator.state.value.type === 'conic' ? 'Starting angle' : 'Angle'"
			:min="0"
			:max="359"
			:step="1"
			:track="angleTrack"
			:format="(value) => `${Math.round(value)}°`"
			@commit="generator.snapshot()"
		/>

		<div class="grid gap-2.5">
			<p :id="blendLabelId" class="text-sm font-medium">How colors blend</p>
			<div role="radiogroup" :aria-labelledby="blendLabelId" class="grid gap-1">
				<button
					v-for="blend in generator.blends.value"
					:key="blend.space"
					type="button"
					role="radio"
					:aria-checked="generator.state.value.space === blend.space"
					class="grid gap-2 rounded-xl p-2.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
					:class="generator.state.value.space === blend.space ? 'bg-muted' : 'hover:bg-muted/50'"
					@click="generator.setSpace(blend.space)"
				>
					<span class="flex items-center justify-between gap-2 text-sm">
						<span class="font-medium">{{ blendDetails[blend.space].label }}</span>
						<Icon v-if="generator.state.value.space === blend.space" name="lucide:check" class="size-4" />
					</span>
					<span
						class="h-3 rounded-full ring-1 ring-foreground/10 ring-inset"
						:style="{ background: `linear-gradient(to right, ${blend.hexes.join(', ')})` }"
						aria-hidden="true"
					/>
					<span class="text-sm text-muted-foreground">{{ blendDetails[blend.space].hint }}</span>
				</button>
			</div>
		</div>
	</div>
</template>
