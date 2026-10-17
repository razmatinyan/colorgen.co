<script setup lang="ts">
import type { TokenName } from '~/lib/color'
import { landingDemoKey } from '~/composables/useLandingDemo'

const demo = inject(landingDemoKey)!
const builder = demo.builder

const samples = computed(() => (['light', 'dark'] as const).map((mode) => {
	const token = (name: TokenName) => builder.tokens.value[name][mode].hex
	return {
		mode,
		visibility: mode === 'light' ? 'dark:hidden' : 'hidden dark:grid',
		background: token('background'),
		foreground: token('foreground'),
		primary: token('primary'),
		onPrimary: token('primary-foreground'),
		secondary: token('secondary'),
		onSecondary: token('secondary-foreground'),
		destructive: token('destructive'),
		onDestructive: token('destructive-foreground'),
		muted: token('muted'),
		mutedForeground: token('muted-foreground'),
		success: token('success'),
	}
}))
const passing = computed(() => builder.readability.value.length - builder.failingReadability.value.length)
</script>

<template>
	<div class="relative">
		<div class="relative rounded-3xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
			<div class="mb-4 flex items-center justify-between gap-3">
				<div class="flex items-center gap-2.5">
					<span class="size-6 rounded-md ring-1 ring-foreground/10 ring-inset transition-colors duration-700" :style="{ background: builder.brandHex.value }" />
					<span class="text-sm font-medium">Your system</span>
				</div>
				<span class="text-sm text-muted-foreground tabular-nums">{{ builder.brandHex.value.toUpperCase() }}</span>
			</div>

			<div class="grid gap-2">
				<div v-for="(color, row) in builder.colors.value" :key="color.id" class="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[6rem_minmax(0,1fr)]">
					<span class="truncate text-xs text-muted-foreground">{{ color.label }}</span>
					<div class="grid grid-cols-11 gap-1">
						<span
							v-for="(swatch, index) in color.swatches"
							:key="swatch.step"
							class="h-6 rounded-[5px] ring-1 ring-foreground/5 ring-inset transition-colors duration-700 sm:h-7"
							:style="{ background: swatch.hex, transitionDelay: `${row * 45 + index * 22}ms` }"
						/>
					</div>
				</div>
			</div>

			<div
				v-for="sample in samples"
				:key="sample.mode"
				class="mt-5 gap-3 rounded-2xl p-4 ring-1 ring-foreground/10 transition-colors duration-700"
				:class="[sample.visibility, sample.mode === 'light' && 'grid']"
				:style="{ background: sample.background, color: sample.foreground }"
			>
				<div class="flex flex-wrap gap-2">
					<span class="inline-flex h-8 items-center rounded-full px-3.5 text-sm font-medium transition-colors duration-700" :style="{ background: sample.primary, color: sample.onPrimary }">Get started</span>
					<span class="inline-flex h-8 items-center rounded-full px-3.5 text-sm font-medium transition-colors duration-700" :style="{ background: sample.secondary, color: sample.onSecondary }">Learn more</span>
					<span class="inline-flex h-8 items-center rounded-full px-3.5 text-sm font-medium transition-colors duration-700" :style="{ background: sample.destructive, color: sample.onDestructive }">Delete</span>
				</div>
				<div class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-700" :style="{ background: sample.muted, color: sample.mutedForeground }">
					<Icon name="lucide:circle-check" class="size-4 shrink-0 transition-colors duration-700" :style="{ color: sample.success }" />
					Changes saved a moment ago
				</div>
			</div>
		</div>

		<div class="absolute -top-4 -right-2 hidden items-center gap-2 rounded-full bg-popover py-1.5 pr-3.5 pl-2 text-sm shadow-sm ring-1 ring-foreground/10 sm:flex">
			<span class="grid size-6 place-items-center rounded-full bg-success/15 text-success"><Icon name="lucide:check" class="size-3.5" /></span>
			<span class="tabular-nums">{{ passing }} of {{ builder.readability.value.length }} readable</span>
		</div>
		<div class="absolute -bottom-4 -left-3 hidden items-center gap-2 rounded-full bg-popover py-1.5 pr-3.5 pl-3 text-sm shadow-sm ring-1 ring-foreground/10 sm:flex">
			<Icon name="lucide:code" class="size-4 text-muted-foreground" />
			Tailwind · shadcn · CSS · Figma
		</div>
	</div>
</template>
