<script setup lang="ts">
import { isStatusKind, neutralChroma, parseColor, toHex } from '~/lib/color'
import { designSystemBuilderKey, type BrandId, type BuilderColor } from '~/composables/useDesignSystemBuilder'

const props = defineProps<{ color: BuilderColor }>()
const builder = inject(designSystemBuilderKey)!

const statusKind = computed(() => (isStatusKind(props.color.id) ? props.color.id : null))
const brandId = computed<BrandId | null>(() => (props.color.id === 'brand' || props.color.id === 'brand2' ? props.color.id : null))
const brandColor = computed(() => (brandId.value ? builder.settings.value[brandId.value] : null))

const inputId = useId()
const hintId = useId()
const draft = ref(props.color.hex.toUpperCase())
const isEditingDraft = ref(false)
const isDraftInvalid = ref(false)

watch(() => props.color.hex, (hex) => {
	if (!isEditingDraft.value) draft.value = hex.toUpperCase()
})

function applyDraft() {
	const parsed = parseColor(draft.value)
	isDraftInvalid.value = !parsed
	if (!parsed || !brandId.value) return
	if (toHex(parsed) !== props.color.hex) {
		builder.snapshot()
		builder.updateBrand(brandId.value, parsed)
	}
	draft.value = toHex(parsed).toUpperCase()
}

function onDraftBlur() {
	applyDraft()
	isEditingDraft.value = false
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
			<form class="grid gap-2" @submit.prevent="applyDraft">
				<label :for="inputId" class="text-sm font-medium">{{ brandId === 'brand' ? 'Your brand color' : 'Your second brand color' }}</label>
				<Input
					:id="inputId"
					v-model="draft"
					class="bg-background tabular-nums dark:bg-input/30"
					autocomplete="off"
					spellcheck="false"
					:aria-invalid="isDraftInvalid || undefined"
					:aria-describedby="hintId"
					@focus="isEditingDraft = true"
					@blur="onDraftBlur"
				/>
				<p :id="hintId" class="text-sm" :class="isDraftInvalid ? 'text-destructive' : 'text-muted-foreground'">
					{{ isDraftInvalid ? 'Enter a color like #1F6CB0 or rgb(31 108 176).' : 'Paste a HEX, RGB, HSL or OKLCH value.' }}
				</p>
			</form>
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
