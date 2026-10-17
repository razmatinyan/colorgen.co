<script setup lang="ts">
import { createRng, generatePalette, toHex, wcagRatio } from '~/lib/color'
import { tools } from '~/lib/tools'
import { landingDemoKey } from '~/composables/useLandingDemo'

const { builder } = inject(landingDemoKey)!
const NuxtLink = resolveComponent('NuxtLink')

const paletteSeed = 7
const palette = computed(() => generatePalette({ rng: createRng(paletteSeed), locked: [builder.settings.value.brand] }).map(color => toHex(color)))
const brandScale = computed(() => builder.system.value.brand.swatches.map(swatch => swatch.hex))
const brand2Hex = computed(() => (builder.system.value.brand2 ? toHex(builder.system.value.brand2.base) : brandScale.value[2]!))
const contrastPair = computed(() => ({ foreground: brandScale.value[8]!, background: brandScale.value[1]! }))
const contrastRatio = computed(() => wcagRatio(contrastPair.value.foreground, contrastPair.value.background))

const showcased = tools.filter(tool => tool.id !== 'builder')
const descriptions: Record<string, string> = {
	palette: 'Start from your color and explore palettes around it, with a live UI preview.',
	scale: 'A 50–950 shade scale for any single color, ready to paste.',
	contrast: 'Check any two colors with WCAG 2.2 and APCA, and get a passing alternative.',
	gradient: 'Smooth multi-stop gradients that stay vivid in the middle.',
	image: 'Pull the main colors out of a photo or screenshot.',
}
</script>

<template>
	<section class="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:py-28">
		<LandingSectionHeading
			label="More tools"
			title="Everything around the builder."
			description="Smaller tools for everyday color work. Each one can send its result into the builder."
		/>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<LandingReveal v-for="(tool, index) in showcased" :key="tool.id" :delay="(index % 3) * 90">
				<component
					:is="tool.status === 'live' ? NuxtLink : 'div'"
					:to="tool.status === 'live' ? tool.to : undefined"
					class="group grid h-full content-start gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
					:class="tool.status === 'live' && 'hover:bg-muted/40'"
				>
					<div class="grid h-36 place-items-center overflow-hidden rounded-xl bg-muted/50 p-5" aria-hidden="true">
						<div v-if="tool.id === 'palette'" class="flex w-full gap-1.5">
							<span
								v-for="(hex, swatchIndex) in palette"
								:key="swatchIndex"
								class="h-20 flex-1 rounded-lg ring-1 ring-foreground/10 ring-inset transition-[background-color,translate] duration-700 group-hover:-translate-y-1"
								:style="{ background: hex, transitionDelay: `${swatchIndex * 40}ms` }"
							/>
						</div>
						<div v-else-if="tool.id === 'scale'" class="flex h-16 w-full items-end gap-1">
							<span
								v-for="(hex, step) in brandScale"
								:key="step"
								class="flex-1 rounded-md transition-[background-color,height] duration-700"
								:style="{ background: hex, height: `${40 + step * 6}%`, transitionDelay: `${step * 25}ms` }"
							/>
						</div>
						<div v-else-if="tool.id === 'contrast'" class="flex items-center gap-3">
							<span class="grid size-20 place-items-center rounded-2xl text-2xl font-semibold transition-colors duration-700" :style="{ background: contrastPair.background, color: contrastPair.foreground }">Aa</span>
							<span class="grid gap-1">
								<span class="text-2xl font-semibold tabular-nums">{{ contrastRatio.toFixed(1) }}</span>
								<Badge variant="secondary" class="bg-success/15 text-success">AA</Badge>
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
					</div>
					<div class="grid gap-1.5">
						<div class="flex items-center gap-2 font-medium">
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
