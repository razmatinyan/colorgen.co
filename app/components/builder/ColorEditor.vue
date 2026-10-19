<script setup lang="ts">
import { isStatusKind, neutralChroma, type Oklch } from '~/lib/color'
import { designSystemBuilderKey, type BrandId, type BuilderColor } from '~/composables/useDesignSystemBuilder'

const props = defineProps<{ color: BuilderColor }>()
const builder = inject(designSystemBuilderKey)!

const statusKind = computed(() => (isStatusKind(props.color.id) ? props.color.id : null))
const brandId = computed<BrandId | null>(() =>
	props.color.id === 'brand' || props.color.id === 'brand2' ? props.color.id : null,
)
const brandColor = computed(() => (brandId.value ? builder.settings.value[brandId.value] : null))

function changeBrand(color: Oklch) {
	if (!brandId.value) return
	builder.snapshot()
	builder.updateBrand(brandId.value, color)
}

function changeStatus(color: Oklch) {
	if (!statusKind.value) return
	builder.snapshot()
	builder.updateStatus(statusKind.value, color)
}

const tint = computed({
	get: () => builder.settings.value.neutralTint,
	set: (value) => builder.setNeutralTint(value),
})

const ownHue = computed(() => builder.settings.value.neutralHue)
const neutralHue = computed({
	get: () => ownHue.value ?? Math.round(builder.settings.value.brand.h),
	set: (value) => builder.setNeutralHue(value),
})

const tintTrack = computed(() => {
	const h = neutralHue.value
	const chroma = neutralChroma(builder.settings.value.brand, 1, ownHue.value)
	return `linear-gradient(to right, oklch(0.6 0 ${h}), oklch(0.6 ${chroma} ${h}))`
})

const hueTrack = `linear-gradient(to right, ${Array.from({ length: 13 }, (_, index) => `oklch(0.6 0.1 ${index * 30})`).join(', ')})`
</script>

<template>
	<div class="grid grid-cols-1 gap-5 px-2.5 pt-1 pb-3">
		<template v-if="brandId && brandColor">
			<ColorValueInput
				:color="brandColor"
				:label="brandId === 'brand' ? 'Your brand color' : 'Your second brand color'"
				@change="changeBrand"
				@update="(value) => builder.updateBrand(brandId!, value)"
				@commit="builder.snapshot()"
			/>
			<ColorChannelSliders
				:color="brandColor"
				@update="(patch) => builder.updateBrand(brandId!, patch)"
				@commit="builder.snapshot()"
			/>
			<div v-if="brandId === 'brand2'" class="flex items-center justify-between gap-3">
				<p class="text-sm text-muted-foreground">Used for secondary buttons and charts.</p>
				<Button
					variant="outline"
					size="sm"
					class="shrink-0 bg-background dark:bg-input/30"
					@click="builder.removeSecondBrand()"
				>
					<Icon name="lucide:trash-2" data-icon="inline-start" /> Remove
				</Button>
			</div>
		</template>

		<template v-else-if="color.id === 'neutral'">
			<ColorGradientSlider
				v-model="tint"
				label="Tint"
				:min="0"
				:max="1"
				:step="0.01"
				:track="tintTrack"
				:format="(v) => `${Math.round(v * 100)}%`"
				@commit="builder.snapshot()"
			/>
			<ColorGradientSlider
				v-model="neutralHue"
				label="Hue"
				:min="0"
				:max="359"
				:step="1"
				:track="hueTrack"
				:format="(v) => `${Math.round(v)}°`"
				@commit="builder.snapshot()"
			/>
			<div class="flex items-center justify-between gap-3">
				<p class="text-sm text-muted-foreground">
					{{
						ownHue === null
							? 'The grays carry your brand hue. At 0% tint they are pure gray.'
							: 'The grays use their own hue instead of your brand hue.'
					}}
				</p>
				<Button
					v-if="ownHue !== null"
					variant="outline"
					size="sm"
					class="shrink-0 bg-background dark:bg-input/30"
					@click="builder.followBrandHue()"
				>
					<Icon name="lucide:rotate-ccw" data-icon="inline-start" /> Follow brand
				</Button>
			</div>
		</template>

		<template v-else-if="statusKind">
			<ColorValueInput
				:color="color.base"
				:label="`${color.label} color`"
				@change="changeStatus"
				@update="(value) => builder.updateStatus(statusKind!, value)"
				@commit="builder.snapshot()"
			/>
			<ColorChannelSliders
				:color="color.base"
				@update="(patch) => builder.updateStatus(statusKind!, patch)"
				@commit="builder.snapshot()"
			/>
			<div class="flex items-center justify-between gap-3">
				<p class="text-sm text-muted-foreground">
					{{
						color.edited ? 'Edited, so it no longer follows your brand color.' : 'Suggested to match your brand color.'
					}}
				</p>
				<Button
					v-if="color.edited"
					variant="outline"
					size="sm"
					class="shrink-0 bg-background dark:bg-input/30"
					@click="builder.resetStatus(statusKind)"
				>
					<Icon name="lucide:rotate-ccw" data-icon="inline-start" /> Reset
				</Button>
			</div>
		</template>
	</div>
</template>
