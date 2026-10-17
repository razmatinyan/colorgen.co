<script setup lang="ts">
import type { Oklch } from '~/lib/color'
import { contrastCheckerKey, type ContrastColor } from '~/composables/useContrastChecker'

const props = defineProps<{ color: ContrastColor }>()
const checker = inject(contrastCheckerKey)!

const isOpen = computed(() => checker.selectedId.value === props.color.id)
const panelId = useId()

function changeColor(color: Oklch) {
	checker.set(props.color.id, color)
}
</script>

<template>
	<div class="rounded-xl transition-colors" :class="isOpen ? 'bg-muted' : 'hover:bg-muted/50'">
		<button
			type="button"
			class="flex w-full min-w-0 items-center gap-3 rounded-xl p-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
			:aria-expanded="isOpen"
			:aria-controls="panelId"
			@click="checker.toggleOpen(color.id)"
		>
			<span class="size-10 shrink-0 rounded-lg ring-1 ring-foreground/10 ring-inset transition-colors duration-200" :style="{ background: color.hex }" />
			<span class="min-w-0 flex-1">
				<span class="flex items-baseline justify-between gap-2">
					<span class="text-sm font-medium">{{ color.label }}</span>
					<span class="text-sm text-muted-foreground tabular-nums">{{ color.hex.toUpperCase() }}</span>
				</span>
				<span class="block truncate text-sm text-muted-foreground">{{ color.description }} · {{ color.hint }}</span>
			</span>
		</button>

		<div v-if="isOpen" :id="panelId" class="grid grid-cols-1 gap-5 px-2.5 pt-1 pb-3">
			<ColorValueInput
				:color="color.color"
				:label="color.id === 'text' ? 'Text color' : 'Background color'"
				@change="changeColor"
				@update="value => checker.update(color.id, value)"
				@commit="checker.snapshot()"
			/>
			<ColorChannelSliders :color="color.color" @update="patch => checker.update(color.id, patch)" @commit="checker.snapshot()" />
		</div>
	</div>
</template>
