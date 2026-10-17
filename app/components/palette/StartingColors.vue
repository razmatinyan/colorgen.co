<script setup lang="ts">
import { describeColor, toHex } from '~/lib/color'
import { paletteGeneratorKey } from '~/composables/usePaletteGenerator'

const palette = inject(paletteGeneratorKey)!

const startingColors = computed(() => palette.startingColors.value.map(color => ({
	color,
	hex: toHex(color),
	name: describeColor(color),
})))
</script>

<template>
	<section class="grid gap-3" aria-labelledby="starting-colors">
		<div class="flex items-center justify-between gap-3">
			<div class="grid gap-0.5">
				<h3 id="starting-colors" class="text-sm font-medium">No color yet?</h3>
				<p class="text-sm text-muted-foreground">Start from one of these.</p>
			</div>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="ghost" size="icon-sm" aria-label="Show other starting colors" @click="palette.moreStartingColors()">
						<Icon name="lucide:shuffle" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Other starting colors</TooltipContent>
			</Tooltip>
		</div>
		<ul class="flex flex-wrap gap-2">
			<li v-for="item in startingColors" :key="item.hex">
				<Tooltip>
					<TooltipTrigger as-child>
						<button
							type="button"
							class="size-9 rounded-full ring-1 ring-foreground/10 ring-inset outline-none transition-transform duration-150 hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 motion-reduce:transition-none"
							:style="{ background: item.hex }"
							:aria-label="`Start from ${item.name}, ${item.hex.toUpperCase()}`"
							@click="palette.startFrom(item.color)"
						/>
					</TooltipTrigger>
					<TooltipContent>{{ item.name }} · {{ item.hex.toUpperCase() }}</TooltipContent>
				</Tooltip>
			</li>
		</ul>
	</section>
</template>
