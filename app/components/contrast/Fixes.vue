<script setup lang="ts">
import { contrastCheckerKey, type ContrastColorId } from '~/composables/useContrastChecker'

const checker = inject(contrastCheckerKey)!

const targets = [
	{ value: 'body-aa', label: 'AA · 4.5' },
	{ value: 'body-aaa', label: 'AAA · 7' },
	{ value: 'large-aa', label: 'Large · 3' },
] as const
type TargetId = typeof targets[number]['value']

const target = computed<TargetId>({
	get: () => checker.targetId.value as TargetId,
	set: (value) => {
		checker.targetId.value = value
	},
})

const fixTargets: readonly ContrastColorId[] = ['text', 'background']

const options = computed(() => fixTargets.map((id) => {
	const fix = checker.fixes.value[id]
	const current = checker.hexes.value[id]
	const shown = fix?.hex ?? current
	return {
		id,
		title: id === 'text' ? 'Change the text' : 'Change the background',
		current,
		fix,
		isChange: !!fix && fix.hex !== current,
		preview: id === 'text'
			? { color: shown, background: checker.hexes.value.background }
			: { color: checker.hexes.value.text, background: shown },
	}
}))
</script>

<template>
	<section class="grid content-start gap-4" aria-labelledby="contrast-fixes">
		<div class="grid gap-3">
			<div class="grid gap-1">
				<h3 id="contrast-fixes" class="text-sm font-medium">Make it pass</h3>
				<p class="text-sm text-muted-foreground">
					{{ checker.passesTarget.value ? 'Already passes this target.' : 'The closest colors that pass. Only lightness changes.' }}
				</p>
			</div>
			<AppSegmentedControl v-model="target" :options="targets" label="Target ratio" class="w-fit" />
		</div>
		<ul class="grid gap-2">
			<li v-for="option in options" :key="option.id" class="flex items-center gap-3 rounded-xl p-2.5 ring-1 ring-foreground/10 ring-inset">
				<span
					class="grid h-12 w-16 shrink-0 place-items-center rounded-lg text-lg font-semibold ring-1 ring-foreground/10 ring-inset transition-colors duration-200"
					:style="{ background: option.preview.background, color: option.preview.color }"
					aria-hidden="true"
				>Aa</span>
				<span class="grid min-w-0 flex-1 gap-0.5">
					<span class="text-sm font-medium">{{ option.title }}</span>
					<span v-if="option.fix" class="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground tabular-nums">
						<template v-if="option.isChange">
							<span>{{ option.current.toUpperCase() }}</span>
							<Icon name="lucide:arrow-right" class="size-3.5" />
							<span class="text-foreground">{{ option.fix.hex.toUpperCase() }}</span>
						</template>
						<span v-else>No change needed</span>
						<span>· {{ option.fix.ratio.toFixed(2) }}:1</span>
					</span>
					<span v-else class="text-sm text-muted-foreground">No lightness of this color reaches {{ checker.target.value.minRatio }}:1 here.</span>
				</span>
				<Button
					v-if="option.isChange"
					variant="outline"
					size="sm"
					class="shrink-0"
					:aria-label="`${option.title} to ${option.fix?.hex.toUpperCase()}`"
					@click="checker.applyFix(option.id)"
				>
					Apply
				</Button>
			</li>
		</ul>
	</section>
</template>
