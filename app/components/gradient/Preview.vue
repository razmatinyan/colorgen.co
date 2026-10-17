<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { toFallbackGradient } from '~/lib/export'
import { gradientGeneratorKey } from '~/composables/useGradientGenerator'

const generator = inject(gradientGeneratorKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

const background = computed(() => toFallbackGradient(generator.gradient.value))

async function copyCss() {
	await copy(`background: ${generator.css.value};`)
	showToast('Copied CSS', 'success', { description: generator.css.value })
}
</script>

<template>
	<div class="grid gap-2">
		<div
			class="h-64 rounded-2xl ring-1 ring-foreground/10 ring-inset sm:h-80 lg:h-[clamp(18rem,42dvh,30rem)]"
			:style="{ background }"
			role="img"
			:aria-label="`Gradient preview: ${generator.stops.value.map(stop => stop.hex.toUpperCase()).join(' to ')}`"
		/>
		<button
			type="button"
			class="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
			aria-label="Copy CSS"
			@click="copyCss"
		>
			<span class="min-w-0 truncate tabular-nums"><span class="text-muted-foreground">background:</span> {{ generator.css.value }}</span>
			<Icon name="lucide:copy" class="size-3.5 shrink-0 text-muted-foreground" />
		</button>
	</div>
</template>
