<script setup lang="ts">
import { onKeyStroke, useClipboard, useDebounceFn } from '@vueuse/core'
import { isInteractiveTarget } from '~/lib/keyboard'
import { parseGradientParam, parseGradientQuery, toGradientQuery } from '~/lib/gradient-url'
import { toColorsParam } from '~/lib/palette-url'
import { gradientGeneratorKey, useGradientGenerator } from '~/composables/useGradientGenerator'

definePageMeta({ layout: 'app', key: 'gradient' })

const route = useRoute()
const router = useRouter()
const gradientParam = computed(() => (typeof route.params.gradient === 'string' ? route.params.gradient : undefined))
const initialStops = parseGradientParam(gradientParam.value)

if (gradientParam.value && !initialStops) {
	await navigateTo('/gradient', { replace: true, redirectCode: 301 })
}

const generator = useGradientGenerator({ stops: initialStops, options: parseGradientQuery(route.query) })
provide(gradientGeneratorKey, generator)

const stopHexes = computed(() => generator.stops.value.map(stop => stop.hex))

const savePath = computed(() => router.resolve(target.value).fullPath)
const savedSnapshot = () => ({ title: `${generator.stops.value[0]!.description} to ${generator.stops.value.at(-1)!.description.toLowerCase()} gradient`, colors: stopHexes.value })
useRecentTracking('gradient', () => (gradientParam.value ? savedSnapshot() : null))

const target = computed(() => ({
	params: { gradient: toColorsParam(generator.colors.value) },
	query: toGradientQuery(generator.state.value),
}))
const syncUrl = useDebounceFn((next: typeof target.value) => {
	if (router.resolve(next).fullPath !== route.fullPath) router.replace(next)
}, 250)
watch(target, next => syncUrl(next), { deep: true })

const siteUrl = 'https://sygen.app'
const defaultTitle = 'Gradient Generator: Smooth OKLCH Gradients for CSS and Tailwind | Sygen'
const pathHexes = computed(() => gradientParam.value?.split('-').map(hex => `#${hex.toUpperCase()}`) ?? [])
useSeoMeta({
	title: () => {
		if (pathHexes.value.length === 2) return `Gradient from ${pathHexes.value[0]} to ${pathHexes.value[1]}: CSS and Tailwind | Sygen`
		if (pathHexes.value.length > 2) return `Gradient: ${pathHexes.value.join(', ')} | Sygen`
		return defaultTitle
	},
	description: () => (pathHexes.value.length
		? `A ${pathHexes.value.join(' to ')} gradient that stays vivid in the middle, with CSS, Tailwind classes and solid steps to copy.`
		: 'Make linear, radial and conic gradients that stay vivid in the middle by blending in OKLCH. Copy CSS with a fallback for older browsers, Tailwind classes or solid steps. Free, no sign-up.'),
	ogTitle: defaultTitle,
	ogUrl: () => `${siteUrl}${route.path}`,
})
useHead({
	link: [{ rel: 'canonical', href: () => `${siteUrl}${route.path}` }],
})

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const requestUrl = useRequestURL()

const exportOpen = ref(false)
const builderPath = computed(() => `/builder/${stopHexes.value[0]!.slice(1)}`)

async function copyCss() {
	await copy(`background: ${generator.css.value};`)
	showToast('Copied CSS', 'success', { description: generator.css.value })
}

async function copyLink() {
	await copy(`${requestUrl.origin}${router.resolve(target.value).fullPath}`)
	showToast('Link copied', 'success', { description: stopHexes.value.map(hex => hex.toUpperCase()).join(' → ') })
}

onKeyStroke(['c', 'C'], (event) => {
	if (!isInteractiveTarget(event) && !event.metaKey && !event.ctrlKey) copyCss()
})
onKeyStroke(['r', 'R'], (event) => {
	if (!isInteractiveTarget(event) && !event.metaKey && !event.ctrlKey) generator.reverse()
})
onKeyStroke(['e', 'E'], (event) => {
	if (isInteractiveTarget(event) || event.metaKey || event.ctrlKey || exportOpen.value) return
	event.preventDefault()
	exportOpen.value = true
})
onKeyStroke(['ArrowDown', 'ArrowUp'], (event) => {
	if (isInteractiveTarget(event)) return
	event.preventDefault()
	generator.select(event.key === 'ArrowDown' ? 1 : -1)
})
onKeyStroke(['z', 'Z'], (event) => {
	if (!(event.metaKey || event.ctrlKey) || isInteractiveTarget(event)) return
	event.preventDefault()
	if (event.shiftKey) generator.redo()
	else generator.undo()
})
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col">
		<AppTopBar title="Gradient generator">
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="ghost" size="icon-sm" aria-label="Undo" :disabled="!generator.canUndo.value" @click="generator.undo()">
						<Icon name="lucide:undo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Undo <Kbd>⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="ghost" size="icon-sm" aria-label="Redo" :disabled="!generator.canRedo.value" @click="generator.redo()">
						<Icon name="lucide:redo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Redo <Kbd>⇧⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<AppSaveButton kind="gradient" :path="savePath" :snapshot="savedSnapshot" />
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="outline" size="sm" aria-label="Copy link" @click="copyLink">
						<Icon name="lucide:link" data-icon="inline-start" /> <span class="hidden sm:inline">Copy link</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Share this gradient</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button as-child variant="outline" size="sm">
						<NuxtLink :to="builderPath" aria-label="Use in builder">
							<Icon name="lucide:blocks" data-icon="inline-start" /> <span class="hidden sm:inline">Use in builder</span>
						</NuxtLink>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Build a full color system from {{ stopHexes[0]!.toUpperCase() }}</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button size="sm" aria-label="Export" @click="exportOpen = true">
						<Icon name="lucide:code" data-icon="inline-start" /> <span class="hidden sm:inline">Export</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>CSS, Tailwind or steps <Kbd>E</Kbd></TooltipContent>
			</Tooltip>
		</AppTopBar>

		<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch">
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your gradient</CardTitle>
					<CardDescription>Two to five colors, from start to end.</CardDescription>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col gap-6 overflow-x-hidden lg:overflow-y-auto">
					<div class="-mx-2 grid grid-cols-1 gap-1">
						<GradientStopRow v-for="stop in generator.stops.value" :key="stop.id" :stop="stop" />
						<button
							v-if="generator.canAdd.value"
							type="button"
							class="flex items-center gap-3 rounded-xl p-2.5 text-left text-sm text-muted-foreground outline-none transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
							@click="generator.add()"
						>
							<span class="grid size-10 shrink-0 place-items-center rounded-lg border border-dashed">
								<Icon name="lucide:plus" class="size-4" />
							</span>
							Add a color
						</button>
					</div>
					<Separator />
					<GradientStyle />
				</CardContent>
			</Card>

			<Card size="sm" class="min-h-0" aria-label="Preview">
				<CardHeader class="flex flex-wrap items-start justify-between gap-3">
					<div class="grid min-w-0 gap-1">
						<CardTitle>Preview</CardTitle>
						<CardDescription>Click the CSS to copy it, or press C.</CardDescription>
					</div>
					<Tooltip>
						<TooltipTrigger as-child>
							<Button variant="outline" size="sm" @click="generator.reverse()">
								<Icon name="lucide:arrow-left-right" data-icon="inline-start" /> Reverse
							</Button>
						</TooltipTrigger>
						<TooltipContent>Swap start and end <Kbd>R</Kbd></TooltipContent>
					</Tooltip>
				</CardHeader>
				<CardContent class="grid min-h-0 flex-1 content-start gap-8 lg:overflow-y-auto">
					<GradientPreview />
					<GradientSteps />
					<GradientIdeas />
				</CardContent>
			</Card>
		</div>
		<GradientExportDialog v-model:open="exportOpen" />
	</div>
</template>
