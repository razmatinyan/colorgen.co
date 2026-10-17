<script setup lang="ts">
import { parseColor, toHex, type Oklch } from '~/lib/color'

const props = defineProps<{ hex: string, label: string }>()
const emit = defineEmits<{ change: [color: Oklch] }>()

const inputId = useId()
const hintId = useId()
const draft = ref(props.hex.toUpperCase())
const isEditing = ref(false)
const isInvalid = ref(false)

watch(() => props.hex, (hex) => {
	if (!isEditing.value) draft.value = hex.toUpperCase()
})

function apply() {
	const parsed = parseColor(draft.value)
	isInvalid.value = !parsed
	if (!parsed) return
	if (toHex(parsed) !== props.hex) emit('change', parsed)
	draft.value = toHex(parsed).toUpperCase()
}

function onBlur() {
	apply()
	isEditing.value = false
}
</script>

<template>
	<form class="grid gap-2" @submit.prevent="apply">
		<label :for="inputId" class="text-sm font-medium">{{ label }}</label>
		<Input
			:id="inputId"
			v-model="draft"
			class="bg-background tabular-nums dark:bg-input/30"
			autocomplete="off"
			spellcheck="false"
			:aria-invalid="isInvalid || undefined"
			:aria-describedby="hintId"
			@focus="isEditing = true"
			@blur="onBlur"
		/>
		<p :id="hintId" class="text-sm" :class="isInvalid ? 'text-destructive' : 'text-muted-foreground'">
			{{ isInvalid ? 'Enter a color like #1F6CB0 or rgb(31 108 176).' : 'Paste a HEX, RGB, HSL or OKLCH value.' }}
		</p>
	</form>
</template>
