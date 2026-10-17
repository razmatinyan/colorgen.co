<script setup lang="ts">
import { isStatusKind, neutralChroma, type Oklch } from '~/lib/color'
import { designSystemBuilderKey, type BrandId, type BuilderColor } from '~/composables/useDesignSystemBuilder'

const props = defineProps<{ color: BuilderColor }>()
const builder = inject(designSystemBuilderKey)!

const statusKind = computed(() => (isStatusKind(props.color.id) ? props.color.id : null))
const brandId = computed<BrandId | null>(() => (props.color.id === 'brand' || props.color.id === 'brand2' ? props.color.id : null))
const brandColor = computed(() => (brandId.value ? builder.settings.value[brandId.value] : null))

function changeBrand(color: Oklch) {
	if (!brandId.value) return
	builder.snapshot()
	builder.updateBrand(brandId.value, color)
}

const tint = computed({
	get: () => builder.settings.value.neutralTint,
	set: value => builder.setNeutralTint(value),
})

const tintTrack = computed(() => {
	const { h } = builder.settings.value.brand
	return `linear-gradient(to right, oklch(0.6 0 ${h}), oklch(0.6 ${neutralChroma(builder.settings.value.brand, 1)} ${h}))`
})
</script>

<template>
	<div class="grid grid-cols-1 gap-5 px-2.5 pt-1 pb-3">
		<template v-if="brandId && brandColor">
			<ColorValueInput :hex="color.hex" :label="brandId === 'brand' ? 'Your brand color' : 'Your second brand color'" @change="changeBrand" />
			<ColorChannelSliders :color="brandColor" @update="patch => builder.updateBrand(brandId!, patch)" @commit="builder.snapshot()" />
			<div v-if="brandId === 'brand2'" class="flex items-center justify-between gap-3">
				<p class="text-sm text-muted-foreground">Used for secondary buttons and charts.</p>
				<Button variant="outline" size="sm" class="shrink-0 bg-background dark:bg-input/30" @click="builder.removeSecondBrand()">
					<Icon name="lucide:trash-2" data-icon="inline-start" /> Remove
				</Button>
			</div>
		</template>

		<template v-else-if="color.id === 'neutral'">
			<ColorGradientSlider
				v-model="tint"
				label="Brand tint"
				:min="0"
				:max="1"
				:step="0.01"
				:track="tintTrack"
				:format="v => `${Math.round(v * 100)}%`"
				@commit="builder.snapshot()"
			/>
			<p class="text-sm text-muted-foreground">How much of your brand's hue the grays carry. At 0% they are pure gray.</p>
		</template>

		<template v-else-if="statusKind">
			<ColorChannelSliders :color="color.base" @update="patch => builder.updateStatus(statusKind!, patch)" @commit="builder.snapshot()" />
			<div class="flex items-center justify-between gap-3">
				<p class="text-sm text-muted-foreground">
					{{ color.edited ? 'Edited, so it no longer follows your brand color.' : 'Suggested to match your brand color.' }}
				</p>
				<Button v-if="color.edited" variant="outline" size="sm" class="shrink-0 bg-background dark:bg-input/30" @click="builder.resetStatus(statusKind)">
					<Icon name="lucide:rotate-ccw" data-icon="inline-start" /> Reset
				</Button>
			</div>
		</template>
	</div>
</template>
