<script setup lang="ts">
import { extraColorIndex, isStatusKind, neutralChroma, type ExtraColorId, type Oklch } from '~/lib/color'
import { maxScaleNameLength, toScaleName } from '~/lib/scale-names'
import { designSystemBuilderKey, type BrandId, type BuilderColor } from '~/composables/useDesignSystemBuilder'

const props = defineProps<{ color: BuilderColor }>()
const builder = inject(designSystemBuilderKey)!

const statusKind = computed(() => (isStatusKind(props.color.id) ? props.color.id : null))
const extraIndex = computed(() => extraColorIndex(props.color.id))
const extraId = computed(() => (extraIndex.value === null ? null : (props.color.id as ExtraColorId)))
const brandId = computed<BrandId | null>(() => (props.color.id === 'brand' ? 'brand' : extraId.value))
const brandColor = computed(() => {
	if (props.color.id === 'brand') return builder.settings.value.brand
	return extraIndex.value === null ? null : (builder.settings.value.extras[extraIndex.value] ?? null)
})

const nameId = useId()
const nameHintId = useId()
const nameDraft = ref(props.color.customName ?? '')
const isEditingName = ref(false)

watch(
	() => props.color.customName,
	(name) => {
		if (!isEditingName.value) nameDraft.value = name ?? ''
	},
)

const previewName = computed(() => (isEditingName.value && toScaleName(nameDraft.value)) || props.color.name)

function applyName() {
	if (!extraId.value) return
	const name = toScaleName(nameDraft.value)
	builder.setColorName(extraId.value, name || null)
	nameDraft.value = name
}

function onNameBlur() {
	applyName()
	isEditingName.value = false
}

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
				:label="brandId === 'brand' ? 'Your brand color' : `${color.label} color`"
				@change="changeBrand"
				@update="(value) => builder.updateBrand(brandId!, value)"
				@commit="builder.snapshot()"
			/>
			<ColorChannelSliders
				:color="brandColor"
				@update="(patch) => builder.updateBrand(brandId!, patch)"
				@commit="builder.snapshot()"
			/>
			<template v-if="extraId">
				<form class="grid gap-2" @submit.prevent="applyName">
					<label :for="nameId" class="text-sm font-medium">Name in code</label>
					<Input
						:id="nameId"
						v-model="nameDraft"
						class="bg-background dark:bg-input/30"
						autocomplete="off"
						spellcheck="false"
						:maxlength="maxScaleNameLength + 8"
						:placeholder="color.name"
						:aria-describedby="nameHintId"
						@focus="isEditingName = true"
						@blur="onNameBlur"
					/>
					<p :id="nameHintId" class="truncate text-sm text-muted-foreground">
						Exported as <span class="text-foreground">--color-{{ previewName }}-500</span>
					</p>
				</form>
				<div class="flex items-center justify-between gap-3">
					<p class="text-sm text-muted-foreground">
						{{
							extraIndex === 0 ? 'Used for secondary buttons and charts.' : 'Used for charts and any token you pick.'
						}}
					</p>
					<Button
						variant="outline"
						size="sm"
						class="shrink-0 bg-background dark:bg-input/30"
						@click="builder.removeColor(extraId)"
					>
						<Icon name="lucide:trash-2" data-icon="inline-start" /> Remove
					</Button>
				</div>
			</template>
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
