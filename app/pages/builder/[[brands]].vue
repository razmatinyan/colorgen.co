<script setup lang="ts">
import { onKeyStroke, useClipboard, useDebounceFn } from '@vueuse/core'
import { describeColor, toHex, type ColorBlindVision } from '~/lib/color'
import { parseBrandsParam, parseBuilderQuery, toBrandsParam, toBuilderQuery } from '~/lib/builder-url'
import { isInteractiveTarget } from '~/lib/keyboard'
import { designSystemBuilderKey, useDesignSystemBuilder } from '~/composables/useDesignSystemBuilder'

definePageMeta({ layout: 'app', key: 'builder' })

const route = useRoute()
const router = useRouter()
const brandsParam = computed(() => (typeof route.params.brands === 'string' ? route.params.brands : undefined))
const initialBrands = parseBrandsParam(brandsParam.value)

if (brandsParam.value && !initialBrands) {
	await navigateTo('/builder', { replace: true, redirectCode: 301 })
}

const builder = useDesignSystemBuilder({
	...parseBuilderQuery(route.query),
	...initialBrands,
})
provide(designSystemBuilderKey, builder)

const savePath = computed(() => router.resolve(target.value).fullPath)
const savedSnapshot = () => ({
	title: `${describeColor(builder.settings.value.brand)} system`,
	colors: builder.colors.value.map((color) => toHex(color.base)),
})
useRecentTracking('builder', () => (brandsParam.value ? savedSnapshot() : null))

const target = computed(() => ({
	params: { brands: toBrandsParam(builder.settings.value) },
	query: toBuilderQuery(builder.settings.value),
}))

const replaceUrl = useToolUrlSync()
const syncUrl = useDebounceFn((next: typeof target.value) => {
	replaceUrl(next)
}, 250)
watch(target, (next) => syncUrl(next))

const defaultTitle = 'Design System Color Builder: Brand, Neutral and Status Scales | Sygen'
useSeoMeta({
	title: () =>
		brandsParam.value
			? `Design system colors for ${brandsParam.value
					.split('-')
					.map((hex) => `#${hex.toUpperCase()}`)
					.join(' and ')} | Sygen`
			: defaultTitle,
	description:
		'Enter your brand color and get a complete UI color system: brand scales, brand-tinted neutrals, success, warning, danger and info, plus readable light and dark tokens for shadcn and Tailwind. Free, no sign-up.',
	ogTitle: defaultTitle,
})
useCanonicalUrl(() => route.path)
usePageOgImage({
	kind: 'builder',
	colors: toBrandsParam(builder.settings.value),
	tint: Math.round(builder.settings.value.neutralTint * 100),
	hue: builder.settings.value.neutralHue ?? undefined,
})

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const requestUrl = useRequestURL()

type BuilderView = 'preview' | 'tokens' | 'scales'
const view = ref<BuilderView>('preview')
const views = [
	{ value: 'preview', label: 'Preview', icon: 'lucide:layout-panel-left' },
	{ value: 'tokens', label: 'Tokens', icon: 'lucide:list-tree' },
	{ value: 'scales', label: 'Scales', icon: 'lucide:chart-column' },
] as const
const viewDetails: Record<BuilderView, { title: string; description: string }> = {
	preview: { title: 'Preview', description: 'Your tokens applied to common UI elements' },
	tokens: { title: 'Tokens', description: 'The named colors your app uses, for light and dark mode' },
	scales: { title: 'Scales', description: 'Every color from 50 (lightest) to 950 (darkest)' },
}
const previewMode = ref<'light' | 'dark'>('light')
const previewModes = [
	{ value: 'light', label: 'Light', icon: 'lucide:sun' },
	{ value: 'dark', label: 'Dark', icon: 'lucide:moon' },
] as const

const { vision } = useVisionSimulation(() => view.value !== 'tokens')

function simulate(type: ColorBlindVision) {
	vision.value = type
	view.value = 'preview'
}

const exportOpen = ref(false)
const importOpen = ref(false)

function openImportFromQuery() {
	if (route.query.import === undefined) return
	importOpen.value = true
	const { import: _import, ...query } = route.query
	replaceUrl({ query })
}

onMounted(openImportFromQuery)
watch(() => route.query.import, openImportFromQuery)

function onImported() {
	view.value = builder.failingReadability.value.length ? 'tokens' : 'preview'
}

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
onKeyStroke(['e', 'E'], (event) => {
	if (isInteractiveTarget(event) || event.metaKey || event.ctrlKey || exportOpen.value) return
	event.preventDefault()
	exportOpen.value = true
})
onKeyStroke(['i', 'I'], (event) => {
	if (isInteractiveTarget(event) || event.metaKey || event.ctrlKey || importOpen.value) return
	event.preventDefault()
	importOpen.value = true
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
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Undo"
						:disabled="!builder.canUndo.value"
						@click="builder.undo()"
					>
						<Icon name="lucide:undo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Undo <Kbd>⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Redo"
						:disabled="!builder.canRedo.value"
						@click="builder.redo()"
					>
						<Icon name="lucide:redo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Redo <Kbd>⇧⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="outline" size="sm" aria-label="Import" @click="importOpen = true">
						<Icon name="lucide:file-input" data-icon="inline-start" /> <span class="hidden sm:inline">Import</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Import an existing theme <Kbd>I</Kbd></TooltipContent>
			</Tooltip>
			<AppSaveButton kind="builder" :path="savePath" :snapshot="savedSnapshot" />
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
					<Button size="sm" aria-label="Export" @click="exportOpen = true">
						<Icon name="lucide:code" data-icon="inline-start" /> <span class="hidden sm:inline">Export</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Tailwind, CSS, Figma or design tokens <Kbd>E</Kbd></TooltipContent>
			</Tooltip>
		</AppTopBar>

		<div
			class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch"
		>
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your colors</CardTitle>
					<CardDescription>Click a color to adjust it. Neutral and status colors follow your brand.</CardDescription>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden lg:overflow-y-auto">
					<div class="-mx-2 grid grid-cols-1 gap-1">
						<template v-for="color in builder.colors.value" :key="color.id">
							<BuilderColorRow :color="color" />
							<button
								v-if="color.id === 'brand' && !builder.settings.value.brand2"
								type="button"
								class="flex items-center gap-3 rounded-xl p-2.5 text-left text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
								@click="builder.addSecondBrand()"
							>
								<span class="grid size-10 shrink-0 place-items-center rounded-lg border border-dashed">
									<Icon name="lucide:plus" class="size-4" />
								</span>
								Add a second brand color
							</button>
						</template>
					</div>
				</CardContent>
			</Card>

			<Card size="sm" class="min-h-0" :aria-label="viewDetails[view].title">
				<CardHeader class="flex flex-wrap items-start justify-between gap-3">
					<div class="grid gap-1">
						<CardTitle>{{ viewDetails[view].title }}</CardTitle>
						<CardDescription>{{ viewDetails[view].description }}</CardDescription>
					</div>
					<div class="flex flex-wrap gap-2">
						<ColorVisionMenu v-if="view !== 'tokens'" v-model="vision" />
						<AppSegmentedControl
							v-if="view === 'preview'"
							v-model="previewMode"
							:options="previewModes"
							label="Preview mode"
						/>
						<AppSegmentedControl v-model="view" :options="views" label="View" />
					</div>
				</CardHeader>
				<CardContent class="min-h-0 flex-1 lg:overflow-y-auto">
					<BuilderPreview v-if="view === 'preview'" :mode="previewMode" :vision="vision" />
					<BuilderTokens v-else-if="view === 'tokens'" @simulate="simulate" />
					<BuilderScales v-else :vision="vision" />
				</CardContent>
			</Card>
		</div>
		<BuilderExportDialog v-model:open="exportOpen" @review="view = 'tokens'" />
		<BuilderImportDialog v-model:open="importOpen" @imported="onImported" />
	</div>
</template>
