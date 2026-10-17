<script setup lang="ts">
import { useDocumentVisibility, usePreferredReducedMotion, useTimeoutFn, useTransition } from '@vueuse/core'
import { apcaContrast, findFix, readabilityPairs, resolveTokens, wcagRatio, withOverride, type TokenOverrides } from '~/lib/color'
import { tokenRefLabel } from '~/composables/useDesignSystemBuilder'
import { landingDemoKey } from '~/composables/useLandingDemo'

const { builder } = inject(landingDemoKey)!

const demoPair = readabilityPairs.find(pair => pair.id === 'muted-foreground/muted')!
const brokenOverrides: TokenOverrides = { 'muted-foreground': { light: 'neutral.300' } }

const broken = computed(() => resolveTokens(builder.system.value, brokenOverrides))
const fixed = computed(() => {
	const fix = findFix(builder.system.value, broken.value, demoPair, 'light')
	return fix ? resolveTokens(builder.system.value, withOverride(brokenOverrides, fix)) : broken.value
})

type Phase = 'broken' | 'pressing' | 'fixed'
const phase = ref<Phase>('broken')
const tokens = computed(() => (phase.value === 'fixed' ? fixed.value : broken.value))

const sample = computed(() => ({
	background: tokens.value.muted.light.hex,
	foreground: tokens.value['muted-foreground'].light.hex,
	step: tokens.value['muted-foreground'].light.ref,
}))
const ratio = computed(() => wcagRatio(sample.value.foreground, sample.value.background))
const shownRatio = useTransition(ratio, { duration: 700 })
const apca = computed(() => Math.round(Math.abs(apcaContrast(sample.value.foreground, sample.value.background))))
const passes = computed(() => ratio.value >= demoPair.minRatio)

const otherChecks = computed(() => ['primary-foreground/primary', 'foreground/background', 'destructive-foreground/destructive'].map((id) => {
	const pair = readabilityPairs.find(item => item.id === id)!
	const foreground = builder.tokens.value[pair.foreground].light.hex
	const background = builder.tokens.value[pair.background].light.hex
	return { id, label: pair.label, foreground, background, ratio: wcagRatio(foreground, background), passes: wcagRatio(foreground, background) >= pair.minRatio }
}))

const reducedMotion = usePreferredReducedMotion()
const visibility = useDocumentVisibility()
const isLooping = ref(false)
const phaseDurations: Record<Phase, number> = { broken: 2600, pressing: 450, fixed: 3400 }
const nextPhase: Record<Phase, Phase> = { broken: 'pressing', pressing: 'fixed', fixed: 'broken' }

const { start } = useTimeoutFn(() => {
	if (visibility.value === 'visible') phase.value = nextPhase[phase.value]
	if (isLooping.value) start()
}, () => phaseDurations[phase.value], { immediate: false })

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
}

const points = [
	'17 text and control pairs, checked in light and dark mode',
	'WCAG 2.2 AA decides, APCA is shown for reference',
	'Fixes move a token to the nearest step that passes, so your colors stay yours',
]
</script>

<template>
	<section class="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-28">
		<div class="grid gap-8">
			<LandingSectionHeading
				label="Readability"
				title="Readable by default. Fixed in one click."
				description="Every pair of text and background in your tokens is checked, so nobody ships gray-on-gray by accident."
			/>
			<ul class="grid gap-3">
				<LandingReveal v-for="(point, index) in points" :key="point" as="li" :delay="index * 80" class="flex gap-3 text-sm">
					<Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-success" />
					{{ point }}
				</LandingReveal>
			</ul>
		</div>

		<LandingReveal :delay="120">
			<div class="grid gap-3 rounded-3xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
				<div class="grid gap-4 rounded-2xl p-4 ring-1 transition-colors duration-500" :class="passes ? 'bg-success/5 ring-success/25' : 'bg-destructive/5 ring-destructive/25'">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p class="text-sm font-medium">{{ demoPair.label }}</p>
							<p class="text-sm text-muted-foreground">Light mode · muted-foreground on muted</p>
						</div>
						<Badge variant="secondary" :class="passes ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'">
							<Icon :name="passes ? 'lucide:circle-check' : 'lucide:triangle-alert'" /> {{ passes ? 'Pass' : 'Fail' }}
						</Badge>
					</div>

					<div class="rounded-xl p-4 transition-colors duration-500" :style="{ background: sample.background }" aria-hidden="true">
						<p class="text-sm font-medium transition-colors duration-500" :style="{ color: sample.foreground }">Last edited 2 hours ago by Ana</p>
						<p class="text-sm transition-colors duration-500" :style="{ color: sample.foreground }">3 comments · 12 files</p>
					</div>

					<div class="flex flex-wrap items-end justify-between gap-4">
						<div class="flex items-baseline gap-2">
							<span class="text-4xl font-semibold tracking-(--tracking-display) tabular-nums">{{ shownRatio.toFixed(2) }}</span>
							<span class="text-sm text-muted-foreground">of {{ demoPair.minRatio }} needed · APCA Lc {{ apca }}</span>
						</div>
						<Button
							v-if="phase !== 'fixed'"
							size="sm"
							class="transition-transform duration-150"
							:class="phase === 'pressing' && 'scale-95'"
							@click="fixNow"
						>
							<Icon name="lucide:wand-sparkles" data-icon="inline-start" /> Fix
						</Button>
						<div v-else class="flex items-center gap-3">
							<span class="text-sm text-muted-foreground">Moved to {{ tokenRefLabel(sample.step) }}</span>
							<Button variant="outline" size="sm" @click="replay">
								<Icon name="lucide:rotate-ccw" data-icon="inline-start" /> Replay
							</Button>
						</div>
					</div>
				</div>

				<ul class="grid grid-cols-1 gap-1 rounded-2xl bg-muted/50 p-1">
					<li v-for="check in otherChecks" :key="check.id" class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm">
						<span class="grid h-7 shrink-0 place-items-center rounded-md px-2 text-xs font-medium ring-1 ring-foreground/10 ring-inset transition-colors duration-700" :style="{ background: check.background, color: check.foreground }">Aa</span>
						<span class="min-w-0 flex-1 truncate">{{ check.label }}</span>
						<span class="text-muted-foreground tabular-nums">{{ check.ratio.toFixed(1) }}</span>
						<Badge variant="secondary" :class="check.passes ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'">
							{{ check.passes ? 'Pass' : 'Fail' }}
						</Badge>
					</li>
				</ul>
			</div>
		</LandingReveal>
	</section>
</template>
