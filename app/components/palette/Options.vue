<script setup lang="ts">
import { paletteGeneratorKey } from '~/composables/usePaletteGenerator'

const palette = inject(paletteGeneratorKey)!
</script>

<template>
	<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-6" aria-label="Palette options">
		<li v-for="(option, index) in palette.options.value" :key="index">
			<button
				type="button"
				class="grid w-full gap-2 rounded-xl p-1.5 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
				:class="option.isCurrent && 'bg-muted ring-1 ring-foreground/15 hover:bg-muted'"
				:aria-pressed="option.isCurrent"
				:aria-label="`Option ${index + 1}: ${option.hexes.map(hex => hex.toUpperCase()).join(', ')}`"
				@click="palette.applyOption(index)"
			>
				<span class="flex h-10 overflow-hidden rounded-lg ring-1 ring-foreground/10 ring-inset" aria-hidden="true">
					<span v-for="(hex, colorIndex) in option.hexes" :key="colorIndex" class="flex-1 transition-colors duration-200" :style="{ background: hex }" />
				</span>
				<span class="flex items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
					Option {{ index + 1 }}
					<Icon v-if="option.isCurrent" name="lucide:check" class="size-3.5 text-foreground" />
				</span>
			</button>
		</li>
	</ul>
</template>
