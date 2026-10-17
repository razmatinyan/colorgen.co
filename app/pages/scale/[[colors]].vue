<script setup lang="ts">
import { onKeyStroke, useClipboard, useDebounceFn } from '@vueuse/core'
import { readableTextColor } from '~/lib/color'
import { isInteractiveTarget } from '~/lib/keyboard'
import { toColorsParam, toHexPart } from '~/lib/palette-url'
import { parseNamesParam, parseScalesParam, toNamesParam } from '~/lib/scale-url'
import { scaleGeneratorKey, useScaleGenerator } from '~/composables/useScaleGenerator'

definePageMeta({ layout: 'app', key: 'scale' })

const route = useRoute()
const router = useRouter()
const colorsParam = computed(() => (typeof route.params.colors === 'string' ? route.params.colors : undefined))
const initialColors = parseScalesParam(colorsParam.value)

if (colorsParam.value && !initialColors) {
	await navigateTo('/scale', { replace: true, redirectCode: 301 })
}

const namesQuery = Array.isArray(route.query.names) ? route.query.names[0] : route.query.names
const generator = useScaleGenerator({
	colors: initialColors,
	names: parseNamesParam(typeof namesQuery === 'string' ? namesQuery : undefined, initialColors?.length ?? 1),
})
provide(scaleGeneratorKey, generator)

useRecentTracking('scale', () => (colorsParam.value
	? {
			title: generator.scales.value.length === 1 ? `${generator.scales.value[0]!.description} scale` : `${generator.scales.value.length} scales`,
			colors: generator.scales.value.map(scale => scale.hex),
		}
	: null))

const target = computed(() => {
	const names = toNamesParam(generator.entries.value.map(entry => entry.name))
	return {
		params: { colors: toColorsParam(generator.entries.value.map(entry => entry.color)) },
		query: names ? { names } : {},
	}
})

const syncUrl = useDebounceFn((next: typeof target.value) => {
	if (router.resolve(next).fullPath !== route.fullPath) router.replace(next)
}, 250)
watch(target, next => syncUrl(next))

const siteUrl = 'https://colorgen.co'
const defaultTitle = 'Shade Scale Generator: 50–950 Color Scales for Tailwind | colorgen.co'
const pathHexes = computed(() => colorsParam.value?.split('-').map(hex => `#${hex.toUpperCase()}`) ?? [])
useSeoMeta({
	title: () => {
		if (pathHexes.value.length === 1) return `${pathHexes.value[0]} Shades: 50–950 Color Scale | colorgen.co`
		if (pathHexes.value.length > 1) return `Color scales for ${pathHexes.value.join(', ')} | colorgen.co`
		return defaultTitle
	},
	description: 'Turn any color into an even 50–950 shade scale in OKLCH, with your exact color kept at its step. Check which text is readable on every shade and export to Tailwind, CSS or design tokens. Free, no sign-up.',
	ogTitle: defaultTitle,
	ogUrl: () => `${siteUrl}${route.path}`,
})

const firstHex = computed(() => generator.scales.value[0]!.hex)
useHead({
	link: [{ rel: 'canonical', href: () => `${siteUrl}${route.path}` }],
	htmlAttrs: {
		style: computed(() => `--brand: ${firstHex.value}; --brand-foreground: ${readableTextColor(firstHex.value)}`),
	},
})

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

type ScaleView = 'shades' | 'readability'
const view = ref<ScaleView>('shades')
const views = [
	{ value: 'shades', label: 'Shades', icon: 'lucide:chart-column' },
	{ value: 'readability', label: 'Readability', icon: 'lucide:type' },
] as const
const readabilityScale = computed(() => generator.selected.value ?? generator.scales.value[0]!)
const viewDetails = computed<Record<ScaleView, { title: string, description: string }>>(() => ({
	shades: { title: 'Shades', description: 'Every color from 50 (lightest) to 950 (darkest)' },
	readability: { title: 'Readability', description: `White and dark text on every step of ${readabilityScale.value.name}` },
}))

const exportOpen = ref(false)
const builderPath = computed(() => `/builder/${toHexPart(readabilityScale.value.color)}`)

async function copySelected() {
	if (!generator.selected.value) return
	const hex = generator.selected.value.hex.toUpperCase()
	await copy(hex)
	showToast(`Copied ${hex}`, 'success', { description: generator.selected.value.name })
}

onKeyStroke(['c', 'C'], (event) => {
	if (!isInteractiveTarget(event) && !event.metaKey && !event.ctrlKey) copySelected()
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
		<AppTopBar title="Shade scale generator">
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
			<Tooltip>
				<TooltipTrigger as-child>
					<Button as-child variant="outline" size="sm">
						<NuxtLink :to="builderPath" aria-label="Use in builder">
							<Icon name="lucide:blocks" data-icon="inline-start" /> <span class="hidden sm:inline">Use in builder</span>
						</NuxtLink>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Build a full color system from {{ readabilityScale.name }}</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button size="sm" aria-label="Export" @click="exportOpen = true">
						<Icon name="lucide:code" data-icon="inline-start" /> <span class="hidden sm:inline">Export</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Tailwind, CSS or design tokens <Kbd>E</Kbd></TooltipContent>
			</Tooltip>
		</AppTopBar>

		<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch">
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your colors</CardTitle>
					<CardDescription>Each color becomes a scale from 50 to 950. Your exact color stays in it.</CardDescription>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden lg:overflow-y-auto">
					<div class="-mx-2 grid grid-cols-1 gap-1">
						<ScaleColorRow v-for="scale in generator.scales.value" :key="scale.id" :scale="scale" />
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
				</CardContent>
			</Card>

			<Card size="sm" class="min-h-0" :aria-label="viewDetails[view].title">
				<CardHeader class="flex flex-wrap items-start justify-between gap-3">
					<div class="grid min-w-0 gap-1">
						<CardTitle>{{ viewDetails[view].title }}</CardTitle>
						<CardDescription>{{ viewDetails[view].description }}</CardDescription>
					</div>
					<AppSegmentedControl v-model="view" :options="views" label="View" />
				</CardHeader>
				<CardContent class="min-h-0 flex-1 lg:overflow-y-auto">
					<ScaleShades v-if="view === 'shades'" />
					<ScaleReadability v-else />
				</CardContent>
			</Card>
		</div>
		<ScaleExportDialog v-model:open="exportOpen" />
	</div>
</template>
