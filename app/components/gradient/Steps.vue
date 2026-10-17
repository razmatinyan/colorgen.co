<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { maxGradientSteps, minGradientSteps, readableTextColor } from '~/lib/color'
import { gradientGeneratorKey } from '~/composables/useGradientGenerator'

const generator = inject(gradientGeneratorKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

const count = computed(() => generator.state.value.steps)

async function copyStep(index: number, hex: string) {
	const value = hex.toUpperCase()
	await copy(value)
	showToast(`Copied ${value}`, 'success', { description: `Step ${index + 1}` })
}
</script>

<template>
	<section class="grid gap-3" aria-labelledby="gradient-steps">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="grid gap-0.5">
				<h3 id="gradient-steps" class="text-sm font-medium">Steps</h3>
				<p class="text-sm text-muted-foreground">Solid colors along the gradient. Click one to copy it.</p>
			</div>
			<div class="flex items-center gap-1 rounded-4xl bg-muted p-1" role="group" aria-label="Number of steps">
				<Button variant="ghost" size="icon-sm" aria-label="Fewer steps" :disabled="count <= minGradientSteps" @click="generator.setSteps(count - 1)">
					<Icon name="lucide:minus" />
				</Button>
				<output class="w-6 text-center text-sm tabular-nums" aria-live="polite">{{ count }}</output>
				<Button variant="ghost" size="icon-sm" aria-label="More steps" :disabled="count >= maxGradientSteps" @click="generator.setSteps(count + 1)">
					<Icon name="lucide:plus" />
				</Button>
			</div>
		</div>
		<ol class="grid grid-cols-[repeat(auto-fit,minmax(3.25rem,1fr))] gap-1.5">
			<li v-for="(step, index) in generator.steps.value" :key="index">
				<button
					type="button"
					class="flex h-16 w-full items-end rounded-xl p-2 text-left text-xs ring-1 ring-foreground/10 ring-inset outline-none transition-[color,background-color,transform] duration-200 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
					:style="{ background: step.hex, color: readableTextColor(step.hex) }"
					:aria-label="`Copy step ${index + 1}, ${step.hex.toUpperCase()}`"
					@click="copyStep(index, step.hex)"
				>
					<span class="truncate tabular-nums opacity-80">{{ step.hex.slice(1).toUpperCase() }}</span>
				</button>
			</li>
		</ol>
	</section>
</template>
