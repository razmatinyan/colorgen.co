<script setup lang="ts">
import { scaleGeneratorKey, type ScaleItem } from '~/composables/useScaleGenerator'

const props = defineProps<{ scale: ScaleItem }>()
const generator = inject(scaleGeneratorKey)!

const isOpen = computed(() => generator.selectedId.value === props.scale.id)
const panelId = useId()
</script>

<template>
	<div class="rounded-xl transition-colors" :class="isOpen ? 'bg-muted' : 'hover:bg-muted/50'">
		<button
			type="button"
			class="flex w-full min-w-0 items-center gap-3 rounded-xl p-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			:aria-expanded="isOpen"
			:aria-controls="panelId"
			@click="generator.toggleOpen(scale.id)"
		>
			<span
				class="size-10 shrink-0 rounded-lg ring-1 ring-foreground/10 transition-colors duration-300 ring-inset"
				:style="{ background: scale.hex }"
			/>
			<span class="min-w-0 flex-1">
				<span class="flex items-baseline justify-between gap-2">
					<span class="truncate text-sm font-medium">{{ scale.name }}</span>
					<span class="text-sm text-muted-foreground tabular-nums">{{ scale.hex.toUpperCase() }}</span>
				</span>
				<span class="block truncate text-sm text-muted-foreground"
					>{{ scale.description }}, at step {{ scale.anchorStep }}</span
				>
			</span>
		</button>

		<div v-if="isOpen" :id="panelId">
			<div
				class="mx-2.5 mb-4 flex h-2 overflow-hidden rounded-full outline -outline-offset-1 outline-foreground/10"
				aria-hidden="true"
			>
				<span v-for="swatch in scale.swatches" :key="swatch.step" class="flex-1" :style="{ background: swatch.hex }" />
			</div>
			<ScaleColorEditor :scale="scale" />
		</div>
	</div>
</template>
