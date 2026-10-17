<script setup lang="ts">
import type { ColorPage } from '~/lib/color-page'

const props = defineProps<{ page: ColorPage }>()

const hexLabel = computed(() => props.page.hex.toUpperCase())
</script>

<template>
	<ColorPageSection
		id="related"
		:title="`Colors related to ${hexLabel}`"
		:description="page.intensity === 'neutral'
			? `Lighter and darker versions of ${hexLabel}.`
			: `Lighter and darker versions, its complementary color, neighbors on the color wheel and softer variants.`"
	>
		<ul class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<li v-for="color in page.related" :key="color.id">
				<NuxtLink
					:to="`/color/${color.hex.slice(1)}`"
					class="grid gap-3 rounded-2xl bg-card p-2 ring-1 ring-foreground/10 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					<span class="h-16 rounded-xl ring-1 ring-foreground/10 ring-inset" :style="{ background: color.hex }" aria-hidden="true" />
					<span class="grid gap-0.5 px-2 pb-1">
						<span class="text-sm font-medium">{{ color.label }}</span>
						<span class="truncate text-xs text-muted-foreground tabular-nums">{{ color.name }} · {{ color.hex.toUpperCase() }}</span>
					</span>
				</NuxtLink>
			</li>
		</ul>
	</ColorPageSection>
</template>
