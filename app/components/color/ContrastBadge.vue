<script setup lang="ts">
import { wcagLevel, type WcagLevel } from '~/lib/color'

const props = defineProps<{ ratio: number }>()

const level = computed(() => wcagLevel(props.ratio))

const levelLabel: Record<WcagLevel, string> = {
	AAA: 'AAA',
	AA: 'AA',
	'AA Large': 'Large',
	Fail: 'Fail',
}

const levelClass: Record<WcagLevel, string> = {
	AAA: 'bg-success/15 text-success',
	AA: 'bg-success/15 text-success',
	'AA Large': 'bg-warning/25 text-foreground',
	Fail: 'bg-destructive/10 text-destructive',
}
</script>

<template>
	<Badge variant="secondary" :class="levelClass[level]" class="tabular-nums">
		{{ levelLabel[level] }} · {{ ratio.toFixed(1) }}
	</Badge>
</template>
