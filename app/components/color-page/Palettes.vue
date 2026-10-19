<script setup lang="ts">
import type { ColorPage } from '~/lib/color-page'

const props = defineProps<{ page: ColorPage }>()

const hexLabel = computed(() => props.page.hex.toUpperCase())

function palettePath(hexes: readonly string[]) {
	return `/palette/${hexes.map((hex) => hex.slice(1)).join('-')}`
}
</script>

<template>
	<ColorPageSection
		id="palettes"
		:title="`Color palettes with ${hexLabel}`"
		:description="`Six palettes built around ${hexLabel}, each starting from the exact color. Open one in the palette tool to adjust it or get more options.`"
	>
		<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			<li v-for="palette in page.palettes" :key="palette.harmony">
				<NuxtLink
					:to="palettePath(palette.hexes)"
					class="group grid gap-3 rounded-2xl bg-card p-2 ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					<span class="flex h-20 gap-1" aria-hidden="true">
						<span
							v-for="(hex, index) in palette.hexes"
							:key="index"
							class="flex-1 rounded-lg ring-1 ring-foreground/10 ring-inset first:flex-[1.6]"
							:style="{ background: hex }"
						/>
					</span>
					<span class="flex items-center justify-between gap-3 px-2 pb-1">
						<span class="grid min-w-0 gap-0.5">
							<span class="text-sm font-medium">{{ palette.label }}</span>
							<span class="truncate text-xs text-muted-foreground tabular-nums">{{
								palette.hexes.map((hex) => hex.toUpperCase()).join(' · ')
							}}</span>
						</span>
						<Icon
							name="lucide:arrow-right"
							class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
						/>
					</span>
				</NuxtLink>
			</li>
		</ul>
	</ColorPageSection>
</template>
