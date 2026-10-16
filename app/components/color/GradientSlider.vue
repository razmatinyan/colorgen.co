<script setup lang="ts">
const props = withDefaults(defineProps<{
	label: string
	min: number
	max: number
	step?: number
	track: string
	format?: (value: number) => string
}>(), {
	step: 0.001,
	format: (value: number) => value.toFixed(2),
})

const model = defineModel<number>({ required: true })
const emit = defineEmits<{ commit: [] }>()
const id = useId()

const readout = computed(() => props.format(model.value))
</script>

<template>
	<div class="grid gap-2.5">
		<div class="flex items-baseline justify-between">
			<label :for="id" class="text-sm font-medium">{{ label }}</label>
			<output :for="id" class="text-sm text-muted-foreground tabular-nums">{{ readout }}</output>
		</div>
		<input
			:id="id"
			v-model.number="model"
			type="range"
			:min="min"
			:max="max"
			:step="step"
			:aria-valuetext="readout"
			class="gradient-slider h-4 w-full cursor-pointer appearance-none rounded-full bg-transparent"
			:style="{ '--track': track }"
			@pointerdown="emit('commit')"
			@keydown="emit('commit')"
		>
	</div>
</template>

<style scoped>
.gradient-slider::-webkit-slider-runnable-track {
	height: 0.625rem;
	border-radius: 9999px;
	background: var(--track);
	box-shadow: inset 0 0 0 1px var(--border);
}
.gradient-slider::-moz-range-track {
	height: 0.625rem;
	border-radius: 9999px;
	background: var(--track);
	box-shadow: inset 0 0 0 1px var(--border);
}
.gradient-slider::-webkit-slider-thumb {
	appearance: none;
	margin-top: -0.1875rem;
	width: 1rem;
	height: 1rem;
	border-radius: 9999px;
	background: white;
	box-shadow: 0 0 0 1px oklch(0 0 0 / 20%), 0 1px 2px oklch(0 0 0 / 25%);
	transition: transform 120ms ease;
}
.gradient-slider::-moz-range-thumb {
	width: 1rem;
	height: 1rem;
	border: 0;
	border-radius: 9999px;
	background: white;
	box-shadow: 0 0 0 1px oklch(0 0 0 / 20%), 0 1px 2px oklch(0 0 0 / 25%);
}
.gradient-slider:active::-webkit-slider-thumb {
	transform: scale(1.12);
}
.gradient-slider:focus-visible {
	outline: none;
}
.gradient-slider:focus-visible::-webkit-slider-thumb {
	box-shadow: 0 0 0 1px oklch(0 0 0 / 20%), 0 0 0 4px color-mix(in oklch, var(--ring) 50%, transparent);
}
.gradient-slider:focus-visible::-moz-range-thumb {
	box-shadow: 0 0 0 1px oklch(0 0 0 / 20%), 0 0 0 4px color-mix(in oklch, var(--ring) 50%, transparent);
}
</style>
