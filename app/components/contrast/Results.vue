<script setup lang="ts">
import { contrastCheckerKey } from '~/composables/useContrastChecker'

const checker = inject(contrastCheckerKey)!
const check = computed(() => checker.check.value)
</script>

<template>
	<section class="grid content-start gap-4" aria-labelledby="contrast-results">
		<h3 id="contrast-results" class="text-sm font-medium">Results</h3>
		<div class="grid grid-cols-2 gap-2">
			<div class="grid content-start gap-1 rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/10 ring-inset">
				<span class="text-sm text-muted-foreground">WCAG 2.2 ratio</span>
				<span class="text-2xl font-semibold tracking-[-0.022em] tabular-nums">{{ check.ratio.toFixed(2) }}:1</span>
			</div>
			<div class="grid content-start gap-1 rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/10 ring-inset">
				<span class="text-sm text-muted-foreground">APCA contrast</span>
				<span class="text-2xl font-semibold tracking-[-0.022em] tabular-nums">Lc {{ Math.round(check.lc) }}</span>
				<span class="text-xs text-muted-foreground">{{ check.usage.label }}</span>
			</div>
		</div>
		<ul class="grid gap-1">
			<li
				v-for="criterion in check.criteria"
				:key="criterion.id"
				class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm"
				:class="criterion.passes ? 'bg-success/10' : 'bg-destructive/10'"
			>
				<Icon
					:name="criterion.passes ? 'lucide:circle-check' : 'lucide:circle-x'"
					class="size-4 shrink-0"
					:class="criterion.passes ? 'text-success' : 'text-destructive'"
				/>
				<span class="min-w-0 flex-1 truncate"
					>{{ criterion.label }} <span class="text-muted-foreground">· {{ criterion.level }}</span></span
				>
				<span class="shrink-0 text-muted-foreground tabular-nums">{{ criterion.minRatio }}:1</span>
				<span
					class="w-9 shrink-0 text-right font-medium"
					:class="criterion.passes ? 'text-success' : 'text-destructive'"
				>
					{{ criterion.passes ? 'Pass' : 'Fail' }}
				</span>
			</li>
		</ul>
		<p class="text-sm text-muted-foreground">
			Large text is 24px, or 18.5px bold. APCA is the newer method planned for WCAG 3; a negative Lc means light text on
			a dark background.
		</p>
	</section>
</template>
