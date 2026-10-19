<script setup lang="ts">
import { apcaContrast, darkText, lightText, wcagRatio } from '~/lib/color'
import { scaleGeneratorKey } from '~/composables/useScaleGenerator'

const generator = inject(scaleGeneratorKey)!

const scale = computed(() => generator.selected.value ?? generator.scales.value[0]!)

const textColors = [
	{ id: 'light', label: 'White text', hex: lightText },
	{ id: 'dark', label: 'Dark text', hex: darkText },
] as const

const rows = computed(() =>
	scale.value.swatches.map((swatch) => ({
		...swatch,
		checks: textColors.map((text) => ({
			...text,
			ratio: wcagRatio(text.hex, swatch.hex),
			lc: Math.round(Math.abs(apcaContrast(text.hex, swatch.hex))),
		})),
	})),
)
</script>

<template>
	<div class="grid gap-4">
		<div
			role="table"
			:aria-label="`Text on each step of ${scale.name}`"
			class="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)_minmax(0,1fr)] gap-x-2 gap-y-1.5 sm:gap-x-3"
		>
			<div role="row" class="contents text-sm text-muted-foreground">
				<span role="columnheader" class="px-1">Step</span>
				<span v-for="text in textColors" :key="text.id" role="columnheader" class="px-1">{{ text.label }}</span>
			</div>
			<div v-for="row in rows" :key="row.step" role="row" class="contents">
				<span role="rowheader" class="flex items-center gap-2 px-1 text-sm tabular-nums">
					<span class="w-8 font-medium">{{ row.step }}</span>
					<span class="hidden text-muted-foreground sm:inline">{{ row.hex.slice(1).toUpperCase() }}</span>
					<span v-if="row.step === scale.anchorStep" class="size-1.5 rounded-full bg-current" aria-label="Your color" />
				</span>
				<span
					v-for="check in row.checks"
					:key="check.id"
					role="cell"
					class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl p-1.5 ring-1 ring-foreground/10 ring-inset sm:flex-nowrap"
				>
					<span
						class="grid h-9 w-14 shrink-0 place-items-center rounded-lg text-base font-semibold transition-colors duration-300"
						:style="{ background: row.hex, color: check.hex }"
						aria-hidden="true"
						>Aa</span
					>
					<ColorContrastBadge :ratio="check.ratio" />
					<span class="text-xs text-muted-foreground tabular-nums">Lc {{ check.lc }}</span>
				</span>
			</div>
		</div>
		<p class="text-sm text-muted-foreground">
			Badges show the WCAG 2.2 contrast ratio: 4.5 for body text, 3 for large text and icons. Lc is the APCA contrast;
			aim for 60 or more for body text.
		</p>
	</div>
</template>
