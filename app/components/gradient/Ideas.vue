<script setup lang="ts">
import { gradientGeneratorKey } from '~/composables/useGradientGenerator'

const generator = inject(gradientGeneratorKey)!

const startHex = computed(() => generator.stops.value[0]!.hex.toUpperCase())

function isCurrent(hexes: readonly string[]) {
	const current = generator.stops.value.map(stop => stop.hex)
	return hexes.length === current.length && hexes.every((hex, index) => hex === current[index])
}
</script>

<template>
	<section class="@container grid gap-3" aria-labelledby="gradient-ideas">
		<div class="grid gap-0.5">
			<h3 id="gradient-ideas" class="text-sm font-medium">Ideas from {{ startHex }}</h3>
			<p class="text-sm text-muted-foreground">Gradients that start from your first color.</p>
		</div>
		<ul class="grid grid-cols-2 gap-2 @xl:grid-cols-3">
			<li v-for="idea in generator.ideas.value" :key="idea.id">
				<button
					type="button"
					class="grid w-full gap-2 rounded-xl p-1.5 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
					:class="isCurrent(idea.hexes) && 'bg-muted'"
					:aria-pressed="isCurrent(idea.hexes)"
					@click="generator.applyIdea(idea.stops)"
				>
					<span class="h-12 rounded-lg ring-1 ring-foreground/10 ring-inset" :style="{ background: `linear-gradient(90deg in ${generator.state.value.space}, ${idea.hexes.join(', ')})` }" aria-hidden="true" />
					<span class="flex items-center justify-between gap-2 px-1 text-sm">
						{{ idea.label }}
						<Icon v-if="isCurrent(idea.hexes)" name="lucide:check" class="size-4" />
					</span>
				</button>
			</li>
		</ul>
	</section>
</template>
