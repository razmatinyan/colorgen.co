<script setup lang="ts">
import { generateNeutralScale, type TokenName } from '~/lib/color'
import { landingDemoKey } from '~/composables/useLandingDemo'

const { builder } = inject(landingDemoKey)!

const tintLevels = [0, 0.3, 0.7] as const
const neutralRows = computed(() => tintLevels.map(tint => ({
	tint,
	swatches: generateNeutralScale(builder.settings.value.brand, tint).map(swatch => swatch.hex),
})))

const modes = computed(() => (['light', 'dark'] as const).map((mode) => {
	const token = (name: TokenName) => builder.tokens.value[name][mode].hex
	return {
		mode,
		background: token('background'),
		card: token('card'),
		foreground: token('foreground'),
		muted: token('muted-foreground'),
		border: token('border'),
		primary: token('primary'),
		onPrimary: token('primary-foreground'),
	}
}))

const checks = computed(() => ({
	passing: builder.readability.value.length - builder.failingReadability.value.length,
	total: builder.readability.value.length,
	samples: (['primary-foreground/primary', 'foreground/background', 'destructive-foreground/destructive'] as const).map((id) => {
		const result = builder.readability.value.find(item => item.pair.id === id && item.mode === 'light')!
		return { id, foreground: result.foreground, background: result.background, ratio: result.ratio }
	}),
}))

const chartBars = computed(() => (['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] as const).map((name, index) => ({
	name,
	hex: builder.tokens.value[name].light.hex,
	height: [62, 100, 48, 80, 70][index]!,
})))
const brand2Hex = computed(() => builder.colors.value.find(color => color.id === 'brand2')?.hex ?? null)

const formats = ['HEX', 'RGB', 'HSL', 'OKLCH']
const tile = 'grid content-between gap-6 overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6'
</script>

<template>
	<section class="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pt-8 pb-20 sm:px-6 lg:pt-12 lg:pb-28">
		<LandingSectionHeading
			label="How it works"
			title="One color in. A whole system out."
			description="The builder does the color science for you, in OKLCH, so every step looks even and stays inside what screens can show."
		/>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
			<LandingReveal :class="tile" class="sm:col-span-2 lg:col-span-4 lg:row-span-2">
				<div class="grid gap-2.5">
					<div class="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 text-xs text-muted-foreground sm:grid-cols-[7rem_minmax(0,1fr)]">
						<span />
						<div class="grid grid-cols-11 gap-1 tabular-nums">
							<span v-for="swatch in builder.colors.value[0]!.swatches" :key="swatch.step" class="text-center">{{ swatch.step }}</span>
						</div>
					</div>
					<div v-for="(color, row) in builder.colors.value" :key="color.id" class="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
						<span class="truncate text-sm">{{ color.label }}</span>
						<div class="grid grid-cols-11 gap-1">
							<span
								v-for="(swatch, index) in color.swatches"
								:key="swatch.step"
								class="h-8 rounded-md ring-1 ring-foreground/5 ring-inset transition-colors duration-700 sm:h-10"
								:style="{ background: swatch.hex, transitionDelay: `${row * 45 + index * 22}ms` }"
							/>
						</div>
					</div>
				</div>
				<div class="grid max-w-lg gap-1.5">
					<p class="text-lg font-medium">Every scale from one color</p>
					<p class="text-sm text-muted-foreground">Brand, a second brand, neutral, success, warning, danger and info, each from 50 to 950. Status colors lean toward your brand so they feel related.</p>
				</div>
			</LandingReveal>

			<LandingReveal :class="tile" class="lg:col-span-2" :delay="80">
				<div class="grid gap-3">
					<div class="flex h-11 items-center gap-2.5 rounded-4xl border bg-background pr-4 pl-1.5 dark:bg-input/30">
						<span class="size-8 shrink-0 rounded-full ring-1 ring-foreground/10 ring-inset transition-colors duration-700" :style="{ background: builder.brandHex.value }" />
						<span class="text-sm tabular-nums">{{ builder.brandHex.value.toUpperCase() }}</span>
						<Icon name="lucide:arrow-right" class="ml-auto size-4 text-muted-foreground" />
					</div>
					<div class="flex flex-wrap gap-1.5">
						<Badge v-for="format in formats" :key="format" variant="secondary">{{ format }}</Badge>
					</div>
				</div>
				<div class="grid gap-1.5">
					<p class="font-medium">Start from your brand color</p>
					<p class="text-sm text-muted-foreground">Paste it in any format, or pick from suggestions if you are starting fresh.</p>
				</div>
			</LandingReveal>

			<LandingReveal :class="tile" class="lg:col-span-2" :delay="140">
				<div class="grid gap-2">
					<div v-for="row in neutralRows" :key="row.tint" class="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2">
						<span class="text-xs text-muted-foreground tabular-nums">{{ Math.round(row.tint * 100) }}%</span>
						<div class="grid grid-cols-11 gap-0.5">
							<span v-for="(hex, index) in row.swatches" :key="index" class="h-5 rounded-[4px] transition-colors duration-700" :style="{ background: hex }" />
						</div>
					</div>
				</div>
				<div class="grid gap-1.5">
					<p class="font-medium">Neutrals that carry your brand</p>
					<p class="text-sm text-muted-foreground">Text, borders and backgrounds get a touch of your hue. You choose how much.</p>
				</div>
			</LandingReveal>

			<LandingReveal :class="tile" class="lg:col-span-2" :delay="60">
				<div class="grid grid-cols-2 gap-2">
					<div
						v-for="mode in modes"
						:key="mode.mode"
						class="grid gap-2.5 rounded-xl p-3 ring-1 ring-foreground/10 transition-colors duration-700"
						:style="{ background: mode.background }"
					>
						<div class="grid gap-1.5 rounded-lg p-2.5 ring-1 transition-colors duration-700" :style="{ background: mode.card, '--tw-ring-color': mode.border }">
							<span class="text-sm font-semibold transition-colors duration-700" :style="{ color: mode.foreground }">Aa</span>
							<span class="h-1.5 w-3/4 rounded-full transition-colors duration-700" :style="{ background: mode.muted }" />
						</div>
						<span class="grid h-7 place-items-center rounded-full text-xs font-medium transition-colors duration-700" :style="{ background: mode.primary, color: mode.onPrimary }">Button</span>
					</div>
				</div>
				<div class="grid gap-1.5">
					<p class="font-medium">Light and dark tokens</p>
					<p class="text-sm text-muted-foreground">background, primary, muted, ring and the rest of the shadcn set, for both modes.</p>
				</div>
			</LandingReveal>

			<LandingReveal :class="tile" class="lg:col-span-2" :delay="120">
				<div class="grid gap-3">
					<div class="flex items-baseline gap-2">
						<span class="text-4xl font-semibold tracking-(--tracking-display) tabular-nums">{{ checks.passing }}/{{ checks.total }}</span>
						<span class="text-sm text-muted-foreground">checks pass</span>
					</div>
					<div class="flex gap-1.5">
						<span
							v-for="sample in checks.samples"
							:key="sample.id"
							class="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium ring-1 ring-foreground/10 ring-inset transition-colors duration-700"
							:style="{ background: sample.background, color: sample.foreground }"
						>Aa <span class="tabular-nums opacity-80">{{ sample.ratio.toFixed(1) }}</span></span>
					</div>
				</div>
				<div class="grid gap-1.5">
					<p class="font-medium">Readable by default</p>
					<p class="text-sm text-muted-foreground">Every text pair is checked against WCAG 2.2 AA, with one-click fixes.</p>
				</div>
			</LandingReveal>

			<LandingReveal :class="tile" class="sm:col-span-2 lg:col-span-2" :delay="180">
				<div class="flex items-end gap-4">
					<div class="flex -space-x-3">
						<span class="size-12 rounded-full ring-3 ring-card transition-colors duration-700" :style="{ background: builder.brandHex.value }" />
						<span v-if="brand2Hex" class="size-12 rounded-full ring-3 ring-card transition-colors duration-700" :style="{ background: brand2Hex }" />
					</div>
					<div class="flex h-14 flex-1 items-end gap-1.5">
						<span
							v-for="bar in chartBars"
							:key="bar.name"
							class="flex-1 rounded-md transition-colors duration-700"
							:style="{ background: bar.hex, height: `${bar.height}%` }"
						/>
					</div>
				</div>
				<div class="grid gap-1.5">
					<p class="font-medium">Room for a second brand</p>
					<p class="text-sm text-muted-foreground">Add a second brand color for secondary buttons and charts, or remove it.</p>
				</div>
			</LandingReveal>
		</div>
	</section>
</template>
