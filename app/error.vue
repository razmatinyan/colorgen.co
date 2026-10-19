<script setup lang="ts">
import type { NuxtError } from '#app'
import { scaleSteps, generateScale } from '~/lib/color'
import { tools } from '~/lib/tools'
import { defaultBrand } from '~/composables/useDesignSystemBuilder'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error.statusCode || 500)
const isNotFound = computed(() => statusCode.value === 404)

const content = computed(() =>
	isNotFound.value
		? {
				title: 'This color is out of gamut',
				description: 'The page you’re looking for doesn’t exist or has moved. Your colors are still one click away.',
			}
		: {
				title: 'Something went wrong',
				description: 'An unexpected error stopped this page. Try again, or pick up where you left off in a tool.',
			},
)

const missingIndex = computed(() =>
	scaleSteps.reduce(
		(nearest, step, index) =>
			Math.abs(step - statusCode.value) < Math.abs(scaleSteps[nearest]! - statusCode.value) ? index : nearest,
		0,
	),
)
const swatches = generateScale(defaultBrand).map((swatch) => ({ step: swatch.step, hex: swatch.hex }))
const liveTools = tools.filter((tool) => tool.status === 'live' && tool.id !== 'builder')
const showDetails = import.meta.dev && !!props.error.message

useSeoMeta({
	title: () => `${isNotFound.value ? 'Page not found' : 'Something went wrong'} | Sygen`,
	robots: 'noindex',
})

function retry() {
	if (import.meta.client) window.location.reload()
}
</script>

<template>
	<TooltipProvider :delay-duration="200">
		<NuxtLayout name="default">
			<section class="mx-auto grid max-w-2xl justify-items-center gap-10 px-4 py-20 text-center sm:px-6 lg:py-28">
				<div class="grid w-full max-w-lg gap-2" aria-hidden="true">
					<div class="grid grid-cols-11 gap-1 sm:gap-1.5">
						<span
							v-for="(swatch, index) in swatches"
							:key="swatch.step"
							class="h-10 rounded-md ring-1 ring-foreground/10 ring-inset sm:h-14 sm:rounded-lg"
							:class="
								index === missingIndex &&
								'bg-transparent ring-0 outline-2 -outline-offset-2 outline-foreground/25 outline-dashed'
							"
							:style="index === missingIndex ? undefined : { background: swatch.hex }"
						/>
					</div>
					<div class="grid grid-cols-11 gap-1 text-xs text-muted-foreground tabular-nums sm:gap-1.5">
						<span
							v-for="(swatch, index) in swatches"
							:key="swatch.step"
							:class="index === missingIndex && 'font-medium text-foreground'"
						>
							{{ index === missingIndex ? statusCode : swatch.step }}
						</span>
					</div>
				</div>

				<div class="grid justify-items-center gap-4">
					<Badge variant="secondary">Error {{ statusCode }}</Badge>
					<h1 class="text-4xl font-semibold tracking-(--tracking-display) text-balance sm:text-5xl">
						{{ content.title }}
					</h1>
					<p class="max-w-md text-lg text-pretty text-muted-foreground">{{ content.description }}</p>
					<pre
						v-if="showDetails"
						class="max-w-full overflow-x-auto rounded-xl bg-muted px-4 py-3 text-left font-sans text-sm whitespace-pre-wrap text-muted-foreground"
						>{{ error.message }}</pre>
				</div>

				<div class="flex flex-wrap justify-center gap-2">
					<Button size="lg" as-child>
						<NuxtLink to="/builder"><Icon name="lucide:blocks" data-icon="inline-start" /> Open the builder</NuxtLink>
					</Button>
					<Button v-if="!isNotFound" variant="outline" size="lg" @click="retry">
						<Icon name="lucide:rotate-ccw" data-icon="inline-start" /> Try again
					</Button>
					<Button variant="outline" size="lg" as-child>
						<NuxtLink to="/"><Icon name="lucide:house" data-icon="inline-start" /> Back to home</NuxtLink>
					</Button>
				</div>

				<nav class="grid w-full gap-3" aria-label="Tools">
					<p class="text-sm text-muted-foreground">Or jump to a tool</p>
					<ul class="flex flex-wrap justify-center gap-2">
						<li v-for="tool in liveTools" :key="tool.id">
							<NuxtLink
								:to="tool.to"
								class="inline-flex items-center gap-2 rounded-4xl bg-muted px-3 py-1.5 text-sm transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50"
							>
								<Icon :name="tool.icon" class="size-4 text-muted-foreground" />
								{{ tool.label }}
							</NuxtLink>
						</li>
					</ul>
				</nav>
			</section>
		</NuxtLayout>
		<AppCommandMenu />
	</TooltipProvider>
</template>
