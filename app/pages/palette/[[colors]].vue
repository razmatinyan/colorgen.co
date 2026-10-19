<script setup lang="ts">
import { onKeyStroke, useClipboard, useDebounceFn } from '@vueuse/core'
import { describeColor, toHex } from '~/lib/color'
import { isInteractiveTarget } from '~/lib/keyboard'
import { parseColorsParam, toColorsParam, toHexPart } from '~/lib/palette-url'
import { paletteGeneratorKey, usePaletteGenerator } from '~/composables/usePaletteGenerator'

definePageMeta({ layout: 'app', key: 'palette' })

const route = useRoute()
const router = useRouter()
const colorsParam = computed(() => (typeof route.params.colors === 'string' ? route.params.colors : undefined))
const initialColors = parseColorsParam(colorsParam.value)

if (colorsParam.value && !initialColors) {
	await navigateTo('/palette', { replace: true, redirectCode: 301 })
}

const palette = usePaletteGenerator(initialColors)
provide(paletteGeneratorKey, palette)

const savePath = computed(() => router.resolve({ params: { colors: toColorsParam(palette.colors.value) } }).fullPath)
const savedSnapshot = () => ({
	title: `${describeColor(palette.colors.value[0]!)} palette`,
	colors: palette.hexes.value,
})
useRecentTracking('palette', () => (colorsParam.value ? savedSnapshot() : null))

const syncUrl = useDebounceFn((param: string) => {
	if (param !== colorsParam.value) router.replace({ params: { colors: param } })
}, 250)
watch(palette.hexes, () => syncUrl(toColorsParam(palette.colors.value)))

useSeoMeta({
	title: () =>
		colorsParam.value
			? `Palette ${colorsParam.value
					.split('-')
					.map((hex) => `#${hex.toUpperCase()}`)
					.join(', ')} | Sygen`
			: 'Color Palette Generator from Your Color, with Live UI Preview | Sygen',
	description:
		'Start from your color and pick from six palettes built around it in OKLCH. Fine-tune every color, check text contrast, and preview it on real UI components. Free, no sign-up.',
	ogTitle: 'Color Palette Generator from Your Color, with Live UI Preview | Sygen',
})
useCanonicalUrl(() => route.path)
usePageOgImage({ kind: 'palette', colors: toColorsParam(palette.colors.value) })

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const previewMode = ref<'light' | 'dark'>('light')
const previewModes = [
	{ value: 'light', label: 'Light', icon: 'lucide:sun' },
	{ value: 'dark', label: 'Dark', icon: 'lucide:moon' },
] as const

const primaryHex = computed(() => toHex(palette.colors.value[0]!))
const builderPath = computed(() => `/builder/${toHexPart(palette.primary.value)}`)
useHead({})

async function exportCss() {
	await copy(palette.cssExport())
	showToast('CSS variables copied', 'success', { description: 'Every color with 11 shades, ready to paste.' })
}

async function copySelected() {
	if (!palette.selected.value) return
	const hex = toHex(palette.selected.value).toUpperCase()
	await copy(hex)
	showToast(`Copied ${hex}`, 'success')
}

onKeyStroke(' ', (event) => {
	if (isInteractiveTarget(event)) return
	event.preventDefault()
	palette.moreOptions()
})
onKeyStroke(['l', 'L'], (event) => {
	if (!isInteractiveTarget(event) && palette.selected.value) palette.toggleLock(palette.selected.value.id)
})
onKeyStroke(['c', 'C'], (event) => {
	if (!isInteractiveTarget(event) && !event.metaKey && !event.ctrlKey) copySelected()
})
onKeyStroke(['ArrowDown', 'ArrowUp'], (event) => {
	if (isInteractiveTarget(event)) return
	event.preventDefault()
	palette.select(event.key === 'ArrowDown' ? 1 : -1)
})
onKeyStroke(['z', 'Z'], (event) => {
	if (!(event.metaKey || event.ctrlKey) || isInteractiveTarget(event)) return
	event.preventDefault()
	if (event.shiftKey) palette.redo()
	else palette.undo()
})
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col">
		<AppTopBar title="Palette generator">
			<Tooltip>
				<TooltipTrigger as-child>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Undo"
						:disabled="!palette.canUndo.value"
						@click="palette.undo()"
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
						:disabled="!palette.canRedo.value"
						@click="palette.redo()"
					>
						<Icon name="lucide:redo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Redo <Kbd>⇧⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<AppSaveButton kind="palette" :path="savePath" :snapshot="savedSnapshot" />
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="outline" size="sm" aria-label="Export" @click="exportCss">
						<Icon name="lucide:code" data-icon="inline-start" /> <span class="hidden sm:inline">Export</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Copy all colors as CSS variables</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button as-child size="sm">
						<NuxtLink :to="builderPath" aria-label="Use in builder">
							<Icon name="lucide:blocks" data-icon="inline-start" />
							<span class="hidden sm:inline">Use in builder</span>
						</NuxtLink>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Build a full color system from your color</TooltipContent>
			</Tooltip>
		</AppTopBar>

		<div
			class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch"
		>
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your colors</CardTitle>
					<CardDescription
						>Enter your color, then pick an option. Lock colors to keep them in every option.</CardDescription
					>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col gap-6 overflow-x-hidden lg:overflow-y-auto">
					<div class="-mx-2 grid grid-cols-1 gap-1">
						<PaletteColorRow v-for="color in palette.colors.value" :key="color.id" :color="color" />
					</div>
					<PaletteStartingColors />
				</CardContent>
			</Card>

			<div class="flex min-h-0 flex-col gap-4">
				<Card size="sm" class="shrink-0" aria-label="Palette options">
					<CardHeader>
						<CardTitle>Built from {{ primaryHex.toUpperCase() }}</CardTitle>
						<CardDescription>Six palettes around your color. Pick one, then fine-tune any color.</CardDescription>
						<CardAction>
							<Tooltip>
								<TooltipTrigger as-child>
									<Button variant="outline" size="sm" aria-label="More options" @click="palette.moreOptions()">
										<Icon name="lucide:refresh-cw" data-icon="inline-start" />
										<span class="hidden sm:inline">More options</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Six new palettes around your color <Kbd>Space</Kbd></TooltipContent>
							</Tooltip>
						</CardAction>
					</CardHeader>
					<CardContent>
						<PaletteOptions />
					</CardContent>
				</Card>

				<Card size="sm" class="min-h-0 flex-1" aria-label="Live preview">
					<CardHeader>
						<CardTitle>Preview</CardTitle>
						<CardDescription>Your colors applied to common UI elements</CardDescription>
						<CardAction>
							<AppSegmentedControl v-model="previewMode" :options="previewModes" label="Preview mode" />
						</CardAction>
					</CardHeader>
					<CardContent class="min-h-0 flex-1 lg:overflow-y-auto">
						<PalettePreview :mode="previewMode" />
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</template>
