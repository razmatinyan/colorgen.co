<script setup lang="ts">
import { colorConverterKey } from '~/composables/useColorConverter'

const converter = inject(colorConverterKey)!

const links = computed(() => {
	const hex = converter.conversion.value.hex.slice(1)
	return [
		{ to: `/color/${hex}`, icon: 'lucide:palette', title: 'About this color', description: 'Shades, palettes and readability' },
		{ to: `/scale/${hex}`, icon: 'lucide:chart-column', title: 'Shades', description: 'A 50–950 scale from this color' },
		{ to: `/contrast/${hex}-ffffff`, icon: 'lucide:contrast', title: 'Contrast', description: 'Is it readable as text?' },
		{ to: `/builder/${hex}`, icon: 'lucide:blocks', title: 'Builder', description: 'A full UI color system' },
	]
})
</script>

<template>
	<section class="grid gap-2" aria-labelledby="related-tools">
		<h3 id="related-tools" class="text-sm font-medium">Keep going</h3>
		<ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
			<li v-for="link in links" :key="link.title">
				<NuxtLink
					:to="link.to"
					class="flex h-full items-center gap-3 rounded-xl p-3 ring-1 ring-foreground/10 ring-inset outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
						<Icon :name="link.icon" class="size-4" />
					</span>
					<span class="grid min-w-0 gap-0.5">
						<span class="text-sm font-medium">{{ link.title }}</span>
						<span class="truncate text-xs text-muted-foreground">{{ link.description }}</span>
					</span>
				</NuxtLink>
			</li>
		</ul>
	</section>
</template>
