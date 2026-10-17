<script setup lang="ts">
import { createRng, generatePalette, paletteRoles, readableTextColor, toHex, wcagRatio } from '~/lib/color'
import { tools, type ToolLink } from '~/lib/tools'
import { landingDemoKey } from '~/composables/useLandingDemo'

const { builder } = inject(landingDemoKey)!
const NuxtLink = resolveComponent('NuxtLink')

const paletteSeed = 7
const palette = computed(() => generatePalette({ rng: createRng(paletteSeed), locked: [builder.settings.value.brand] }).map((color, index) => {
	const hex = toHex(color)
	const role = paletteRoles[index]!
	return { role: role.charAt(0).toUpperCase() + role.slice(1), hex, text: readableTextColor(hex) }
}))
const brandScale = computed(() => builder.system.value.brand.swatches.map(swatch => swatch.hex))
const brand2Hex = computed(() => (builder.system.value.brand2 ? toHex(builder.system.value.brand2.base) : brandScale.value[2]!))
const contrastPairs = computed(() => [
	{ foreground: brandScale.value[8]!, background: brandScale.value[1]! },
	{ foreground: brandScale.value[0]!, background: brandScale.value[6]! },
	{ foreground: brandScale.value[4]!, background: brandScale.value[2]! },
].map(pair => ({ ...pair, ratio: wcagRatio(pair.foreground, pair.background) })))

const layout: Record<string, { span: string, delay: number }> = {
	palette: { span: 'sm:col-span-2 lg:col-span-4 lg:row-span-2', delay: 0 },
	gradient: { span: 'lg:col-span-2', delay: 90 },
	image: { span: 'lg:col-span-2', delay: 150 },
	contrast: { span: 'lg:col-span-3', delay: 60 },
	scale: { span: 'lg:col-span-3', delay: 120 },
}
const descriptions: Record<string, string> = {
	palette: 'Start from your color and explore palettes around it, with a live UI preview.',
	scale: 'A 50–950 shade scale for any single color, ready to paste.',
	contrast: 'Check any two colors with WCAG 2.2 and APCA, and get a passing alternative.',
	gradient: 'Smooth multi-stop gradients that stay vivid in the middle.',
	image: 'Pull the main colors out of a photo or screenshot.',
}

const showcased = Object.keys(layout)
	.map(id => tools.find(tool => tool.id === id))
	.filter((tool): tool is ToolLink => !!tool)
</script>

<template>
	<section class="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 lg:py-28">
		<LandingSectionHeading
			label="More tools"
			title="Everything around the builder."
			description="Smaller tools for everyday color work. Each one can send its result into the builder."
		/>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
			<LandingReveal v-for="tool in showcased" :key="tool.id" :delay="layout[tool.id]!.delay" :class="layout[tool.id]!.span">
				<component
					:is="tool.status === 'live' ? NuxtLink : 'div'"
					:to="tool.status === 'live' ? tool.to : undefined"
					class="group flex h-full flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-6"
					:class="tool.status === 'live' && 'hover:bg-muted/40'"
				>
					<div class="grid min-h-36 flex-1 grid-cols-1 place-items-center overflow-hidden rounded-xl bg-muted/50 p-3 sm:p-5" aria-hidden="true">
						<div v-if="tool.id === 'palette'" class="flex h-full min-h-56 w-full gap-1.5 sm:gap-2">
							<span
								v-for="(swatch, index) in palette"
								:key="index"
								class="flex min-w-0 flex-1 flex-col justify-end gap-0.5 rounded-xl p-2 sm:p-3 ring-1 ring-foreground/10 ring-inset transition-[background-color,color,translate] duration-700 group-hover:-translate-y-1"
								:style="{ background: swatch.hex, color: swatch.text, transitionDelay: `${index * 40}ms` }"
							>
								<span class="hidden truncate text-sm font-medium sm:block">{{ swatch.role }}</span>
								<span class="hidden truncate text-xs tabular-nums opacity-80 sm:block">{{ swatch.hex.toUpperCase() }}</span>
							</span>
						</div>
						<div
							v-else-if="tool.id === 'gradient'"
							class="h-20 w-full rounded-xl transition-[background] duration-700"
							:style="{ background: `linear-gradient(to right in oklch, ${builder.brandHex.value}, ${brand2Hex})` }"
						/>
						<div v-else-if="tool.id === 'image'" class="grid w-full grid-cols-[1fr_auto] items-center gap-4">
							<span class="relative h-24 overflow-hidden rounded-xl transition-colors duration-700" :style="{ background: brandScale[1] }">
								<span class="absolute -bottom-6 -left-4 size-20 rounded-full transition-colors duration-700" :style="{ background: brandScale[6] }" />
								<span class="absolute -right-3 bottom-2 size-14 rounded-full transition-colors duration-700" :style="{ background: brand2Hex }" />
								<span class="absolute top-3 left-1/2 size-6 rounded-full transition-colors duration-700" :style="{ background: brandScale[3] }" />
							</span>
							<span class="grid gap-1.5">
								<span v-for="hex in [brandScale[6], brand2Hex, brandScale[3], brandScale[1]]" :key="hex" class="size-5 rounded-full ring-1 ring-foreground/10 ring-inset transition-colors duration-700" :style="{ background: hex }" />
							</span>
						</div>
						<div v-else-if="tool.id === 'contrast'" class="grid w-full grid-cols-3 gap-2">
							<span
								v-for="(pair, index) in contrastPairs"
								:key="index"
								class="grid gap-1 rounded-xl p-3 transition-colors duration-700"
								:style="{ background: pair.background, color: pair.foreground }"
							>
								<span class="text-xl font-semibold">Aa</span>
								<span class="text-xs tabular-nums">{{ pair.ratio.toFixed(1) }}</span>
							</span>
						</div>
						<div v-else-if="tool.id === 'scale'" class="flex h-20 w-full items-end gap-1">
							<span
								v-for="(hex, step) in brandScale"
								:key="step"
								class="flex-1 rounded-md transition-colors duration-700"
								:style="{ background: hex, height: `${30 + step * 7}%`, transitionDelay: `${step * 25}ms` }"
							/>
						</div>
					</div>
					<div class="grid gap-1.5">
						<div class="flex items-center gap-2 font-medium" :class="tool.id === 'palette' && 'text-lg'">
							<Icon :name="tool.icon" class="size-4 text-muted-foreground" />
							{{ tool.label }}
							<Badge v-if="tool.status === 'planned'" variant="secondary" class="ml-auto">Soon</Badge>
							<Icon v-else name="lucide:arrow-up-right" class="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
						</div>
						<p class="text-sm text-muted-foreground">{{ descriptions[tool.id] ?? tool.description }}</p>
					</div>
				</component>
			</LandingReveal>
		</div>
	</section>
</template>
