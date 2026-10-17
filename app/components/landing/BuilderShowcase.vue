<script setup lang="ts">
import { landingDemoKey } from '~/composables/useLandingDemo'

const { builder, builderPath } = inject(landingDemoKey)!

const features = [
	{ icon: 'lucide:swatch-book', title: 'Edit where you look', text: 'Every color opens right where it is listed, with plain Lightness, Intensity and Hue sliders.' },
	{ icon: 'lucide:layers', title: 'Neutrals that belong to you', text: 'Grays carry a touch of your brand hue. Choose how much.' },
	{ icon: 'lucide:link', title: 'Every change is a link', text: 'The whole system lives in the URL. Share it, bookmark it, come back later.' },
]
</script>

<template>
	<section class="border-y bg-muted/30">
		<div class="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-20 sm:px-6 lg:py-28">
			<div class="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
				<LandingSectionHeading
					label="Design system builder"
					title="See it on real UI before you ship it."
					description="Buttons, forms, alerts, charts and navigation, rendered with your tokens. Switch the site theme to see dark mode."
				/>
				<ul class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
					<LandingReveal v-for="(feature, index) in features" :key="feature.title" as="li" :delay="index * 90" class="grid content-start gap-1.5">
						<Icon :name="feature.icon" class="size-5 text-muted-foreground" />
						<p class="font-medium">{{ feature.title }}</p>
						<p class="text-sm text-muted-foreground">{{ feature.text }}</p>
					</LandingReveal>
				</ul>
			</div>

			<LandingReveal :delay="120">
				<div class="overflow-hidden rounded-3xl bg-background ring-1 ring-foreground/10">
					<div class="flex h-12 items-center gap-3 border-b px-4">
						<Icon name="lucide:panel-left" class="size-4 text-muted-foreground" />
						<span class="text-sm font-medium">Design system builder</span>
						<div class="ml-auto flex items-center gap-2">
							<Button as-child size="sm" variant="outline" class="hidden sm:inline-flex">
								<NuxtLink :to="builderPath">Open in builder</NuxtLink>
							</Button>
						</div>
					</div>
					<div class="grid h-[34rem] lg:grid-cols-[17rem_minmax(0,1fr)]">
						<div class="hidden border-r p-3 lg:block">
							<p class="px-2 pt-1 pb-3 text-sm font-medium">Your colors</p>
							<div class="grid gap-0.5">
								<div
									v-for="(color, index) in builder.colors.value"
									:key="color.id"
									class="flex items-center gap-3 rounded-xl p-2"
									:class="index === 0 && 'bg-muted'"
								>
									<span class="size-8 shrink-0 rounded-lg ring-1 ring-foreground/10 ring-inset transition-colors duration-700" :style="{ background: color.hex }" />
									<span class="min-w-0 flex-1">
										<span class="block truncate text-sm font-medium">{{ color.label }}</span>
										<span class="block truncate text-xs text-muted-foreground tabular-nums">{{ color.hex.toUpperCase() }}</span>
									</span>
								</div>
							</div>
						</div>
						<div class="relative min-w-0 overflow-hidden p-4 mask-b-from-75%">
							<BuilderPreview mode="light" class="dark:hidden" />
							<BuilderPreview mode="dark" class="hidden dark:block" />
						</div>
					</div>
				</div>
			</LandingReveal>
		</div>
	</section>
</template>
