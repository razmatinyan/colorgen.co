<script setup lang="ts">
import { useDocumentVisibility, usePreferredReducedMotion, useTimeoutFn } from '@vueuse/core'
import {
	apcaContrast,
	findFix,
	readabilityPairs,
	resolveTokens,
	wcagRatio,
	withOverride,
	type TokenMode,
	type TokenOverrides,
} from '~/lib/color'
import { tokenRefLabel } from '~/composables/useDesignSystemBuilder'
import { landingDemoKey } from '~/composables/useLandingDemo'

const { builder } = inject(landingDemoKey)!

const demoPair = readabilityPairs.find((pair) => pair.id === 'muted-foreground/muted')!
const brokenRefs = { light: 'neutral.300', dark: 'neutral.600' } as const

type Phase = 'broken' | 'pressing' | 'fixed'
const phase = ref<Phase>('broken')

function demoFor(mode: TokenMode) {
	const brokenOverrides: TokenOverrides = { 'muted-foreground': { [mode]: brokenRefs[mode] } }
	const broken = resolveTokens(builder.system.value, brokenOverrides)
	const fix = findFix(builder.system.value, broken, demoPair, mode)
	const fixed = fix ? resolveTokens(builder.system.value, withOverride(brokenOverrides, fix)) : broken
	const tokens = phase.value === 'fixed' ? fixed : broken
	const background = tokens.muted[mode].hex
	const foreground = tokens['muted-foreground'][mode].hex
	const ratio = wcagRatio(foreground, background)
	return {
		mode,
		visibility: mode === 'light' ? 'grid dark:hidden' : 'hidden dark:grid',
		background,
		foreground,
		ratio,
		apca: Math.round(Math.abs(apcaContrast(foreground, background))),
		passes: ratio >= demoPair.minRatio,
		fixedStep: tokenRefLabel(fixed['muted-foreground'][mode].ref),
	}
}

const demos = computed(() => [demoFor('light'), demoFor('dark')])

const otherChecks = computed(() =>
	(['primary-foreground/primary', 'foreground/background', 'destructive-foreground/destructive'] as const).map((id) => {
		const pair = readabilityPairs.find((item) => item.id === id)!
		const modes = (['light', 'dark'] as const).map((mode) => {
			const foreground = builder.tokens.value[pair.foreground][mode].hex
			const background = builder.tokens.value[pair.background][mode].hex
			const ratio = wcagRatio(foreground, background)
			return {
				mode,
				visibility: mode === 'light' ? 'flex dark:hidden' : 'hidden dark:flex',
				foreground,
				background,
				ratio,
				passes: ratio >= pair.minRatio,
			}
		})
		return { id, label: pair.label, modes }
	}),
)

const reducedMotion = usePreferredReducedMotion()
const visibility = useDocumentVisibility()
const isLooping = ref(false)
const phaseDurations: Record<Phase, number> = { broken: 2600, pressing: 450, fixed: 3400 }
const nextPhase: Record<Phase, Phase> = { broken: 'pressing', pressing: 'fixed', fixed: 'broken' }

const { start } = useTimeoutFn(
	() => {
		if (visibility.value === 'visible') phase.value = nextPhase[phase.value]
		if (isLooping.value) start()
	},
	() => phaseDurations[phase.value],
	{ immediate: false },
)

onMounted(() => {
	if (reducedMotion.value === 'reduce') return
	isLooping.value = true
	start()
})

function fixNow() {
	isLooping.value = false
	phase.value = 'fixed'
}

function replay() {
	phase.value = 'broken'
	if (reducedMotion.value === 'reduce') return
	isLooping.value = true
	start()
}

const points = [
	'17 text and control pairs, checked in light and dark mode',
	'WCAG 2.2 AA decides, APCA is shown for reference',
	'Fixes move a token to the nearest step that passes, so your colors stay yours',
]
</script>

<template>
	<section
		class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-28"
	>
		<div class="grid gap-8">
			<LandingSectionHeading
				label="Readability"
				title="Readable by default. Fixed in one click."
				description="Every pair of text and background in your tokens is checked, so nobody ships gray-on-gray by accident."
			/>
			<ul class="grid gap-3">
				<LandingReveal
					v-for="(point, index) in points"
					:key="point"
					as="li"
					:delay="index * 80"
					class="flex gap-3 text-sm"
				>
					<Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-success" />
					{{ point }}
				</LandingReveal>
			</ul>
		</div>

		<LandingReveal :delay="120">
			<div class="grid gap-3 rounded-3xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
				<div
					v-for="demo in demos"
					:key="demo.mode"
					class="gap-4 rounded-2xl p-4 ring-1 transition-colors duration-500"
					:class="[
						demo.visibility,
						demo.passes ? 'bg-success/5 ring-success/25' : 'bg-destructive/5 ring-destructive/25',
					]"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="truncate text-sm font-medium">{{ demoPair.label }}</p>
							<p class="truncate text-sm text-muted-foreground">muted-foreground on muted</p>
						</div>
						<Badge
							variant="secondary"
							class="w-16 shrink-0 justify-center"
							:class="demo.passes ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'"
						>
							<Icon :name="demo.passes ? 'lucide:circle-check' : 'lucide:triangle-alert'" />
							{{ demo.passes ? 'Pass' : 'Fail' }}
						</Badge>
					</div>

					<div
						class="rounded-xl p-4 transition-colors duration-500"
						:style="{ background: demo.background }"
						aria-hidden="true"
					>
						<p class="truncate text-sm font-medium transition-colors duration-500" :style="{ color: demo.foreground }">
							Last edited 2 hours ago by Ana
						</p>
						<p class="truncate text-sm transition-colors duration-500" :style="{ color: demo.foreground }">
							3 comments · 12 files
						</p>
					</div>

					<div class="flex items-baseline gap-2">
						<span class="w-[4.5ch] text-4xl font-semibold tracking-(--tracking-display) tabular-nums">{{
							demo.ratio.toFixed(2)
						}}</span>
						<span class="truncate text-sm text-muted-foreground"
							>of {{ demoPair.minRatio }} needed · APCA Lc {{ demo.apca }}</span
						>
					</div>

					<div class="flex h-8 items-center justify-between gap-3">
						<span class="min-w-0 truncate text-sm text-muted-foreground">
							{{ phase === 'fixed' ? `Moved to ${demo.fixedStep}` : 'Too faint to read comfortably' }}
						</span>
						<Button
							v-if="phase !== 'fixed'"
							size="sm"
							class="w-24 shrink-0 transition-transform duration-150"
							:class="phase === 'pressing' && 'scale-95'"
							@click="fixNow"
						>
							<Icon name="lucide:wand-sparkles" data-icon="inline-start" /> Fix
						</Button>
						<Button v-else variant="outline" size="sm" class="w-24 shrink-0" @click="replay">
							<Icon name="lucide:rotate-ccw" data-icon="inline-start" /> Replay
						</Button>
					</div>
				</div>

				<ul class="grid grid-cols-1 gap-1 rounded-2xl bg-muted/50 p-1">
					<li v-for="check in otherChecks" :key="check.id">
						<div
							v-for="mode in check.modes"
							:key="mode.mode"
							class="h-11 items-center gap-3 rounded-xl px-3 text-sm"
							:class="mode.visibility"
						>
							<span
								class="grid h-7 shrink-0 place-items-center rounded-md px-2 text-xs font-medium ring-1 ring-foreground/10 transition-colors duration-700 ring-inset"
								:style="{ background: mode.background, color: mode.foreground }"
								>Aa</span
							>
							<span class="min-w-0 flex-1 truncate">{{ check.label }}</span>
							<span class="w-8 text-right text-muted-foreground tabular-nums">{{ mode.ratio.toFixed(1) }}</span>
							<Badge
								variant="secondary"
								class="w-12 justify-center"
								:class="mode.passes ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'"
							>
								{{ mode.passes ? 'Pass' : 'Fail' }}
							</Badge>
						</div>
					</li>
				</ul>
			</div>
		</LandingReveal>
	</section>
</template>
