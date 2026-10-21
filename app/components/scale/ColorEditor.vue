<script setup lang="ts">
import type { Oklch } from '~/lib/color'
import { toHexPart } from '~/lib/palette-url'
import { maxScaleNameLength, toScaleName } from '~/lib/scale-names'
import { scaleGeneratorKey, type ScaleItem } from '~/composables/useScaleGenerator'

const props = defineProps<{ scale: ScaleItem }>()
const generator = inject(scaleGeneratorKey)!

const nameId = useId()
const nameHintId = useId()
const nameDraft = ref(props.scale.customName ?? '')
const isEditingName = ref(false)

watch(
	() => props.scale.customName,
	(name) => {
		if (!isEditingName.value) nameDraft.value = name ?? ''
	},
)

const previewName = computed(() => (isEditingName.value && toScaleName(nameDraft.value)) || props.scale.name)

function applyName() {
	const name = toScaleName(nameDraft.value)
	generator.setName(props.scale.id, name || null)
	nameDraft.value = name
}

function onNameBlur() {
	applyName()
	isEditingName.value = false
}

function changeColor(color: Oklch) {
	generator.snapshot()
	generator.updateColor(props.scale.id, color)
}

const builderPath = computed(() => `/builder/${toHexPart(props.scale.color)}`)
</script>

<template>
	<div class="grid grid-cols-1 gap-5 px-2.5 pt-1 pb-3">
		<ColorValueInput
			:color="scale.color"
			label="Your color"
			@change="changeColor"
			@update="(value) => generator.updateColor(scale.id, value)"
			@commit="generator.snapshot()"
		/>
		<ColorChannelSliders
			:color="scale.color"
			@update="(patch) => generator.updateColor(scale.id, patch)"
			@commit="generator.snapshot()"
		/>

		<form class="grid gap-2" @submit.prevent="applyName">
			<label :for="nameId" class="text-sm font-medium">Name in code</label>
			<Input
				:id="nameId"
				v-model="nameDraft"
				class="bg-background dark:bg-input/30"
				autocomplete="off"
				spellcheck="false"
				:maxlength="maxScaleNameLength + 8"
				:placeholder="scale.name"
				:aria-describedby="nameHintId"
				@focus="isEditingName = true"
				@blur="onNameBlur"
			/>
			<p :id="nameHintId" class="truncate text-sm text-muted-foreground">
				Exported as <span class="text-foreground">--color-{{ previewName }}-500</span>
			</p>
		</form>

		<div class="flex flex-wrap items-center justify-between gap-2">
			<Button as-child variant="outline" size="sm" class="bg-background dark:bg-input/30">
				<NuxtLink :to="builderPath"> <Icon name="lucide:blocks" data-icon="inline-start" /> Use in builder </NuxtLink>
			</Button>
			<Button v-if="generator.canRemove.value" variant="ghost" size="sm" @click="generator.remove(scale.id)">
				<Icon name="lucide:trash-2" data-icon="inline-start" /> Remove
			</Button>
		</div>
	</div>
</template>
