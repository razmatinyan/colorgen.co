<script setup lang="ts">
import type { Oklch } from '~/lib/color'
import { gradientGeneratorKey, type GradientStopItem } from '~/composables/useGradientGenerator'

const props = defineProps<{ stop: GradientStopItem }>()
const generator = inject(gradientGeneratorKey)!

const isOpen = computed(() => generator.selectedId.value === props.stop.id)
const panelId = useId()

function changeColor(color: Oklch) {
	generator.snapshot()
	generator.updateColor(props.stop.id, color)
}
</script>

<template>
	<div class="rounded-xl transition-colors" :class="isOpen ? 'bg-muted' : 'hover:bg-muted/50'">
		<button
			type="button"
			class="flex w-full min-w-0 items-center gap-3 rounded-xl p-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			:aria-expanded="isOpen"
			:aria-controls="panelId"
			@click="generator.toggleOpen(stop.id)"
		>
			<span
				class="size-10 shrink-0 rounded-lg ring-1 ring-foreground/10 transition-colors duration-300 ring-inset"
				:style="{ background: stop.hex }"
			/>
			<span class="min-w-0 flex-1">
				<span class="flex items-baseline justify-between gap-2">
					<span class="truncate text-sm font-medium">{{ stop.label }}</span>
					<span class="text-sm text-muted-foreground tabular-nums">{{ stop.hex.toUpperCase() }}</span>
				</span>
				<span class="block truncate text-sm text-muted-foreground">{{ stop.description }}</span>
			</span>
		</button>

		<div v-if="isOpen" :id="panelId" class="grid grid-cols-1 gap-5 px-2.5 pt-1 pb-3">
			<ColorValueInput
				:color="stop.color"
				:label="`${stop.label} color`"
				@change="changeColor"
				@update="(value) => generator.updateColor(stop.id, value)"
				@commit="generator.snapshot()"
			/>
			<ColorChannelSliders
				:color="stop.color"
				@update="(patch) => generator.updateColor(stop.id, patch)"
				@commit="generator.snapshot()"
			/>
			<div v-if="generator.canRemove.value" class="flex justify-end">
				<Button variant="ghost" size="sm" @click="generator.remove(stop.id)">
					<Icon name="lucide:trash-2" data-icon="inline-start" /> Remove
				</Button>
			</div>
		</div>
	</div>
</template>
