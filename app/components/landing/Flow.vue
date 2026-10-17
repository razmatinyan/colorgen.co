<script setup lang="ts">
import { landingDemoKey } from '~/composables/useLandingDemo'

const { builder } = inject(landingDemoKey)!

const scaleRows = computed(() => builder.colors.value.filter(color => ['brand', 'neutral', 'success'].includes(color.id)))
const modes = computed(() => (['light', 'dark'] as const).map((mode) => {
	const token = (name: 'background' | 'foreground' | 'muted-foreground' | 'primary' | 'primary-foreground') => builder.tokens.value[name][mode].hex
	return {
		mode,
		background: token('background'),
		foreground: token('foreground'),
		muted: token('muted-foreground'),
		primary: token('primary'),
		onPrimary: token('primary-foreground'),
	}
}))

const files = [
	{ name: 'globals.css', label: 'Tailwind + shadcn', icon: 'lucide:wind' },
	{ name: 'variables.css', label: 'CSS variables', icon: 'lucide:braces' },
	{ name: 'light + dark.tokens.json', label: 'Figma variables', icon: 'lucide:figma' },
	{ name: 'colorgen.tokens.json', label: 'Design tokens', icon: 'lucide:file-json' },
]

const steps = [
	{ title: 'Start from your brand color', text: 'Paste it in any format. Add a second brand color if you have one.' },
	{ title: 'Get every scale', text: 'Brand, a neutral tinted by your brand, and success, warning, danger and info, from 50 to 950.' },
	{ title: 'Map light and dark tokens', text: 'background, primary, muted, ring and the rest, checked for readability in both modes.' },
	{ title: 'Export where you work', text: 'Copy or download for Tailwind and shadcn, plain CSS, Figma or design tokens.' },
]
</script>

<template>
	<section class="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:py-28">
		<LandingSectionHeading
			label="How it works"
			title="One color in. A whole system out."
			description="The builder does the color science for you, in OKLCH, so every step looks even and stays inside what screens can show."
		/>

		<ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<LandingReveal v-for="(step, index) in steps" :key="step.title" as="li" :delay="index * 90" class="grid content-start gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
				<div class="grid h-32 place-items-center rounded-xl bg-muted/50 p-4">
					<div v-if="index === 0" class="grid justify-items-center gap-2">
						<span class="size-16 rounded-2xl ring-1 ring-foreground/10 ring-inset transition-colors duration-700" :style="{ background: builder.brandHex.value }" />
						<span class="text-sm font-medium tabular-nums">{{ builder.brandHex.value.toUpperCase() }}</span>
					</div>
					<div v-else-if="index === 1" class="grid w-full gap-1.5">
						<div v-for="(color, row) in scaleRows" :key="color.id" class="grid grid-cols-11 gap-0.5">
							<span
								v-for="(swatch, column) in color.swatches"
								:key="swatch.step"
								class="h-5 rounded-[4px] transition-colors duration-700"
								:style="{ background: swatch.hex, transitionDelay: `${row * 60 + column * 25}ms` }"
							/>
						</div>
					</div>
					<div v-else-if="index === 2" class="grid w-full grid-cols-2 gap-2">
						<div
							v-for="mode in modes"
							:key="mode.mode"
							class="grid gap-2 rounded-lg p-2.5 ring-1 ring-foreground/10 transition-colors duration-700"
							:style="{ background: mode.background }"
						>
							<span class="text-sm font-semibold transition-colors duration-700" :style="{ color: mode.foreground }">Aa</span>
							<span class="h-1.5 w-3/4 rounded-full transition-colors duration-700" :style="{ background: mode.muted }" />
							<span class="h-5 rounded-full transition-colors duration-700" :style="{ background: mode.primary }" />
						</div>
					</div>
					<ul v-else class="grid w-full gap-1.5">
						<li v-for="file in files" :key="file.name" class="flex items-center gap-2 rounded-lg bg-background px-2.5 py-1 text-xs ring-1 ring-foreground/10 dark:bg-card">
							<Icon :name="file.icon" class="size-3.5 shrink-0 text-muted-foreground" />
							<span class="truncate">{{ file.label }}</span>
						</li>
					</ul>
				</div>
				<div class="grid gap-1.5">
					<p class="flex items-center gap-2 font-medium">
						<span class="grid size-6 place-items-center rounded-full bg-muted text-xs tabular-nums">{{ index + 1 }}</span>
						{{ step.title }}
					</p>
					<p class="text-sm text-muted-foreground">{{ step.text }}</p>
				</div>
			</LandingReveal>
		</ol>
	</section>
</template>
