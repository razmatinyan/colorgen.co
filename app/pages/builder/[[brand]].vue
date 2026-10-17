<script setup lang="ts">
import { onKeyStroke, useClipboard, useDebounceFn } from '@vueuse/core'
import { describeColor, readableTextColor, toHex } from '~/lib/color'
import { parseBuilderQuery, toBuilderQuery } from '~/lib/builder-url'
import { isInteractiveTarget } from '~/lib/keyboard'
import { parseHexPart, toHexPart } from '~/lib/palette-url'
import { designSystemBuilderKey, useDesignSystemBuilder } from '~/composables/useDesignSystemBuilder'

definePageMeta({ layout: 'app', key: 'builder' })

const route = useRoute()
const router = useRouter()
const brandParam = computed(() => (typeof route.params.brand === 'string' ? route.params.brand : undefined))
const initialBrand = parseHexPart(brandParam.value)

if (brandParam.value && !initialBrand) {
	await navigateTo('/builder', { replace: true, redirectCode: 301 })
}

const builder = useDesignSystemBuilder({
	...parseBuilderQuery(route.query),
	...(initialBrand && { brand: initialBrand }),
})
provide(designSystemBuilderKey, builder)

useRecentTracking('builder', () => (brandParam.value
	? {
			title: `${describeColor(builder.settings.value.brand)} system`,
			colors: builder.colors.value.map(color => toHex(color.base)),
		}
	: null))

const target = computed(() => ({
	params: { brand: toHexPart(builder.settings.value.brand) },
	query: toBuilderQuery(builder.settings.value),
}))

const syncUrl = useDebounceFn((next: typeof target.value) => {
	const resolved = router.resolve(next)
	if (resolved.fullPath !== route.fullPath) router.replace(next)
}, 250)
watch(target, next => syncUrl(next))

const siteUrl = 'https://colorgen.co'
const defaultTitle = 'Design System Color Builder: Brand, Neutral and Status Scales | colorgen.co'
useSeoMeta({
	title: () => (brandParam.value ? `Design system colors for #${brandParam.value.toUpperCase()} | colorgen.co` : defaultTitle),
	description: 'Enter your brand color and get a complete UI color system: brand, brand-tinted neutral, and success, warning, danger and info scales from 50 to 950, previewed in light and dark mode. Free, no sign-up.',
	ogTitle: defaultTitle,
	ogUrl: () => `${siteUrl}${route.path}`,
})
useHead({
	link: [{ rel: 'canonical', href: () => `${siteUrl}${route.path}` }],
	htmlAttrs: {
		style: computed(() => `--brand: ${builder.brandHex.value}; --brand-foreground: ${readableTextColor(builder.brandHex.value)}`),
	},
})

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const requestUrl = useRequestURL()

const view = ref<'preview' | 'scales'>('preview')
const views = [
	{ value: 'preview', label: 'Preview', icon: 'lucide:layout-panel-left' },
	{ value: 'scales', label: 'Scales', icon: 'lucide:chart-column' },
] as const
const previewMode = ref<'light' | 'dark'>('light')
const previewModes = [
	{ value: 'light', label: 'Light', icon: 'lucide:sun' },
	{ value: 'dark', label: 'Dark', icon: 'lucide:moon' },
] as const

async function copyLink() {
	await copy(`${requestUrl.origin}${router.resolve(target.value).fullPath}`)
	showToast('Link copied', 'success', { description: 'Anyone with the link sees this color system.' })
}

async function copySelected() {
	if (!builder.selected.value) return
	const hex = builder.selected.value.hex.toUpperCase()
	await copy(hex)
	showToast(`Copied ${hex}`, 'success', { description: builder.selected.value.label })
}

onKeyStroke(['c', 'C'], (event) => {
	if (!isInteractiveTarget(event) && !event.metaKey && !event.ctrlKey) copySelected()
})
onKeyStroke(['ArrowDown', 'ArrowUp'], (event) => {
	if (isInteractiveTarget(event)) return
	event.preventDefault()
	builder.select(event.key === 'ArrowDown' ? 1 : -1)
})
onKeyStroke(['z', 'Z'], (event) => {
	if (!(event.metaKey || event.ctrlKey) || isInteractiveTarget(event)) return
	event.preventDefault()
	if (event.shiftKey) builder.redo()
	else builder.undo()
})
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col">
		<AppTopBar title="Design system builder">
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="ghost" size="icon-sm" aria-label="Undo" :disabled="!builder.canUndo.value" @click="builder.undo()">
						<Icon name="lucide:undo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Undo <Kbd>⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="ghost" size="icon-sm" aria-label="Redo" :disabled="!builder.canRedo.value" @click="builder.redo()">
						<Icon name="lucide:redo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Redo <Kbd>⇧⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="outline" size="sm" aria-label="Copy link" @click="copyLink">
						<Icon name="lucide:link" data-icon="inline-start" /> <span class="hidden sm:inline">Copy link</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Share this color system</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<span class="inline-flex">
						<Button size="sm" disabled aria-label="Export">
							<Icon name="lucide:code" data-icon="inline-start" /> <span class="hidden sm:inline">Export</span>
						</Button>
					</span>
				</TooltipTrigger>
				<TooltipContent>Tailwind, CSS, Figma and JSON exports are coming next</TooltipContent>
			</Tooltip>
		</AppTopBar>

		<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch">
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your colors</CardTitle>
					<CardDescription>Click a color to adjust it. Neutral and status colors follow your brand.</CardDescription>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden lg:overflow-y-auto">
					<div class="-mx-2 grid grid-cols-1 gap-1">
						<BuilderColorRow v-for="color in builder.colors.value" :key="color.id" :color="color" />
					</div>
				</CardContent>
			</Card>

			<Card size="sm" class="min-h-0" :aria-label="view === 'preview' ? 'Live preview' : 'Color scales'">
				<CardHeader class="flex flex-wrap items-start justify-between gap-3">
					<div class="grid gap-1">
						<CardTitle>{{ view === 'preview' ? 'Preview' : 'Scales' }}</CardTitle>
						<CardDescription>
							{{ view === 'preview' ? 'Your system applied to common UI elements' : 'Every color from 50 (lightest) to 950 (darkest)' }}
						</CardDescription>
					</div>
					<div class="flex flex-wrap gap-2">
						<AppSegmentedControl v-if="view === 'preview'" v-model="previewMode" :options="previewModes" label="Preview mode" />
						<AppSegmentedControl v-model="view" :options="views" label="View" />
					</div>
				</CardHeader>
				<CardContent class="min-h-0 flex-1 lg:overflow-y-auto">
					<BuilderPreview v-if="view === 'preview'" :mode="previewMode" />
					<BuilderScales v-else />
				</CardContent>
			</Card>
		</div>
	</div>
</template>
