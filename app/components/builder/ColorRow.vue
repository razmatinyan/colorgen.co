<script setup lang="ts">
import { designSystemBuilderKey, type BuilderColor } from '~/composables/useDesignSystemBuilder'

const props = defineProps<{ color: BuilderColor }>()
const builder = inject(designSystemBuilderKey)!

const isOpen = computed(() => builder.selectedId.value === props.color.id)
const panelId = useId()
</script>

<template>
	<div class="rounded-xl transition-colors" :class="isOpen ? 'bg-muted' : 'hover:bg-muted/50'">
		<button
			type="button"
			class="flex w-full min-w-0 items-center gap-3 rounded-xl p-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			:aria-expanded="isOpen"
			:aria-controls="panelId"
			@click="builder.toggleOpen(color.id)"
		>
			<span class="size-10 shrink-0 rounded-lg ring-1 ring-foreground/10 ring-inset transition-colors duration-300" :style="{ background: color.hex }" />
			<span class="min-w-0 flex-1">
				<span class="flex items-baseline justify-between gap-2">
					<span class="flex items-center gap-2 text-sm font-medium">
						{{ color.label }}
						<Badge v-if="color.edited" variant="secondary">Edited</Badge>
					</span>
					<span class="text-sm text-muted-foreground tabular-nums">{{ color.hex.toUpperCase() }}</span>
				</span>
				<span class="block truncate text-sm text-muted-foreground">{{ color.hint }}</span>
			</span>
		</button>

		<div v-if="isOpen" :id="panelId">
			<div class="mx-2.5 mb-4 flex h-2 overflow-hidden rounded-full outline outline-foreground/10 -outline-offset-1" aria-hidden="true">
				<span v-for="swatch in color.swatches" :key="swatch.step" class="flex-1" :style="{ background: swatch.hex }" />
			</div>
			<BuilderColorEditor :color="color" />
		</div>
	</div>
</template>
