<script setup lang="ts">
import { contrastCheckerKey } from '~/composables/useContrastChecker'

const checker = inject(contrastCheckerKey)!
const style = computed(() => ({ background: checker.hexes.value.background, color: checker.hexes.value.text }))
</script>

<template>
	<div
		class="grid gap-5 rounded-2xl p-5 ring-1 ring-foreground/10 transition-colors duration-200 ring-inset sm:p-7"
		:style="style"
	>
		<div class="grid gap-2">
			<p class="text-3xl font-semibold tracking-[-0.022em] sm:text-4xl">Large heading</p>
			<p class="max-w-prose text-base/relaxed">
				Body text at 16px. Readable text helps everyone, including people with low vision and anyone reading a screen in
				bright sunlight.
			</p>
			<p class="text-xs">Small print at 12px is the hardest to read.</p>
		</div>
		<div class="flex flex-wrap items-center gap-3" aria-hidden="true">
			<span class="inline-flex h-9 items-center gap-1.5 rounded-4xl border-2 border-current px-4 text-sm font-medium">
				Outline button <Icon name="lucide:arrow-right" />
			</span>
			<span class="inline-flex h-9 min-w-40 items-center rounded-4xl border border-current px-4 text-sm"
				>Input border</span
			>
			<span class="flex items-center gap-3 text-xl">
				<Icon name="lucide:heart" />
				<Icon name="lucide:bell" />
				<Icon name="lucide:settings" />
			</span>
		</div>
	</div>
</template>
