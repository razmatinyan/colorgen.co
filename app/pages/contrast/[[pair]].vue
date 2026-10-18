<script setup lang="ts">
import { onKeyStroke, useClipboard, useDebounceFn } from '@vueuse/core'
import { checkContrast, toHex } from '~/lib/color'
import { parseContrastParam, toContrastParam } from '~/lib/contrast-url'
import { isInteractiveTarget } from '~/lib/keyboard'
import { toHexPart } from '~/lib/palette-url'
import { contrastCheckerKey, useContrastChecker } from '~/composables/useContrastChecker'

definePageMeta({ layout: 'app', key: 'contrast' })

const route = useRoute()
const router = useRouter()
const pairParam = computed(() => (typeof route.params.pair === 'string' ? route.params.pair : undefined))
const initialPair = parseContrastParam(pairParam.value)

if (pairParam.value && !initialPair) {
	await navigateTo('/contrast', { replace: true, redirectCode: 301 })
}

const checker = useContrastChecker(initialPair ?? {})
provide(contrastCheckerKey, checker)

const pairTitle = computed(
	() => `${checker.hexes.value.text.toUpperCase()} on ${checker.hexes.value.background.toUpperCase()}`,
)

const savePath = computed(() => router.resolve(target.value).fullPath)
const savedSnapshot = () => ({
	title: pairTitle.value,
	colors: [checker.hexes.value.text, checker.hexes.value.background],
})
useRecentTracking('contrast', () => (pairParam.value ? savedSnapshot() : null))

const target = computed(() => ({ params: { pair: toContrastParam(checker.pair.value) } }))
const syncUrl = useDebounceFn((next: typeof target.value) => {
	if (router.resolve(next).fullPath !== route.fullPath) router.replace(next)
}, 250)
watch(target, (next) => syncUrl(next))

const siteUrl = 'https://sygen.app'
const defaultTitle = 'Color Contrast Checker: WCAG 2.2 and APCA, with Fixes | Sygen'
const pathCheck = computed(() => {
	const pair = parseContrastParam(pairParam.value)
	if (!pair) return null
	return {
		text: toHex(pair.text).toUpperCase(),
		background: toHex(pair.background).toUpperCase(),
		check: checkContrast(pair.text, pair.background),
	}
})
useSeoMeta({
	title: () =>
		pathCheck.value
			? `${pathCheck.value.text} on ${pathCheck.value.background}: contrast ${pathCheck.value.check.ratio.toFixed(2)}:1 | Sygen`
			: defaultTitle,
	description: () => {
		if (!pathCheck.value)
			return 'Check text and background colors against WCAG 2.2 AA and AAA and the APCA method, see them on real text, and get the closest colors that pass. Free, no sign-up.'
		const { text, background, check } = pathCheck.value
		const passed = check.criteria
			.filter((criterion) => criterion.passes)
			.map((criterion) => `${criterion.label.toLowerCase()} ${criterion.level}`)
		const summary = passed.length ? `Passes WCAG for ${passed.join(', ')}.` : 'Fails every WCAG level.'
		return `${text} text on ${background} has a contrast ratio of ${check.ratio.toFixed(2)}:1 and APCA Lc ${Math.round(check.lc)}. ${summary} See the closest colors that pass.`
	},
	ogTitle: defaultTitle,
	ogUrl: () => `${siteUrl}${route.path}`,
})
useHead({
	link: [{ rel: 'canonical', href: () => `${siteUrl}${route.path}` }],
})

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const requestUrl = useRequestURL()

const builderPath = computed(() => `/builder/${toHexPart(checker.brandColor.value)}`)
const announcement = computed(() => {
	const { ratio, criteria } = checker.check.value
	const bodyAa = criteria.find((criterion) => criterion.id === 'body-aa')!
	return `Contrast ${ratio.toFixed(2)} to 1, ${bodyAa.passes ? 'passes' : 'fails'} AA for body text`
})

async function copyLink() {
	await copy(`${requestUrl.origin}${router.resolve(target.value).fullPath}`)
	showToast('Link copied', 'success', { description: pairTitle.value })
}

async function copySelected() {
	if (!checker.selected.value) return
	const hex = checker.selected.value.hex.toUpperCase()
	await copy(hex)
	showToast(`Copied ${hex}`, 'success', { description: checker.selected.value.label })
}

onKeyStroke(['x', 'X'], (event) => {
	if (isInteractiveTarget(event) || event.metaKey || event.ctrlKey) return
	checker.swap()
})
onKeyStroke(['c', 'C'], (event) => {
	if (!isInteractiveTarget(event) && !event.metaKey && !event.ctrlKey) copySelected()
})
onKeyStroke(['ArrowDown', 'ArrowUp'], (event) => {
	if (isInteractiveTarget(event)) return
	event.preventDefault()
	checker.select(event.key === 'ArrowDown' ? 1 : -1)
})
onKeyStroke(['z', 'Z'], (event) => {
	if (!(event.metaKey || event.ctrlKey) || isInteractiveTarget(event)) return
	event.preventDefault()
	if (event.shiftKey) checker.redo()
	else checker.undo()
})
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col">
		<AppTopBar title="Contrast checker">
			<Tooltip>
				<TooltipTrigger as-child>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Undo"
						:disabled="!checker.canUndo.value"
						@click="checker.undo()"
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
						:disabled="!checker.canRedo.value"
						@click="checker.redo()"
					>
						<Icon name="lucide:redo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Redo <Kbd>⇧⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<AppSaveButton kind="contrast" :path="savePath" :snapshot="savedSnapshot" />
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="outline" size="sm" aria-label="Copy link" @click="copyLink">
						<Icon name="lucide:link" data-icon="inline-start" /> <span class="hidden sm:inline">Copy link</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Share this color pair</TooltipContent>
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
				<TooltipContent
					>Build a full color system from {{ toHexPart(checker.brandColor.value).toUpperCase() }}</TooltipContent
				>
			</Tooltip>
		</AppTopBar>

		<div
			class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch"
		>
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your colors</CardTitle>
					<CardDescription>Click a color to adjust it. Paste any HEX, RGB, HSL or OKLCH value.</CardDescription>
					<CardAction>
						<Tooltip>
							<TooltipTrigger as-child>
								<Button variant="outline" size="icon-sm" aria-label="Swap text and background" @click="checker.swap()">
									<Icon name="lucide:arrow-down-up" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Swap text and background <Kbd>X</Kbd></TooltipContent>
						</Tooltip>
					</CardAction>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden lg:overflow-y-auto">
					<div class="-mx-2 grid grid-cols-1 gap-1">
						<ContrastColorRow v-for="color in checker.colors.value" :key="color.id" :color="color" />
					</div>
				</CardContent>
			</Card>

			<Card size="sm" class="min-h-0" aria-label="Contrast result">
				<CardHeader>
					<CardTitle>{{ pairTitle }}</CardTitle>
					<CardDescription>Is this text readable on this background?</CardDescription>
				</CardHeader>
				<CardContent class="grid min-h-0 flex-1 content-start gap-6 lg:overflow-y-auto">
					<ContrastPreview />
					<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
						<ContrastResults />
						<ContrastFixes />
					</div>
					<p class="sr-only" aria-live="polite">{{ announcement }}</p>
				</CardContent>
			</Card>
		</div>
	</div>
</template>
