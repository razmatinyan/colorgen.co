<script setup lang="ts">
import { onKeyStroke, useClipboard, useDebounceFn } from '@vueuse/core'
import { convertColor, readableTextColor, type Oklch } from '~/lib/color'
import { parseConvertRoute, toConvertTarget } from '~/lib/convert-url'
import { isInteractiveTarget } from '~/lib/keyboard'
import { colorConverterKey, useColorConverter } from '~/composables/useColorConverter'

definePageMeta({ layout: 'app', key: 'convert' })

const route = useRoute()
const router = useRouter()
const colorParam = computed(() => (typeof route.params.color === 'string' ? route.params.color : undefined))
const exactQuery = Array.isArray(route.query.oklch) ? route.query.oklch[0] : route.query.oklch
const initialColor = parseConvertRoute(colorParam.value, typeof exactQuery === 'string' ? exactQuery : undefined)

if (colorParam.value && !initialColor) {
	await navigateTo('/convert', { replace: true, redirectCode: 301 })
}

const converter = useColorConverter(initialColor)
provide(colorConverterKey, converter)

const conversion = computed(() => converter.conversion.value)
const hexLabel = computed(() => conversion.value.hex.toUpperCase())

useRecentTracking('convert', () => (colorParam.value
	? { title: `${converter.description.value} ${hexLabel.value}`, colors: [conversion.value.hex] }
	: null))

const target = computed(() => {
	const { param, query } = toConvertTarget(converter.color.value)
	return { params: { color: param }, query }
})
const syncUrl = useDebounceFn((next: typeof target.value) => {
	if (router.resolve(next).fullPath !== route.fullPath) router.replace(next)
}, 250)
watch(target, next => syncUrl(next))

const siteUrl = 'https://colorgen.co'
const defaultTitle = 'Color Converter: HEX, RGB, HSL, OKLCH, Lab and Display P3 | colorgen.co'
const pathConversion = computed(() => {
	const color = parseConvertRoute(colorParam.value, undefined)
	return color ? convertColor(color) : null
})
useSeoMeta({
	title: () => (pathConversion.value
		? `${pathConversion.value.hex.toUpperCase()} to RGB, HSL, OKLCH and more | colorgen.co`
		: defaultTitle),
	description: () => {
		if (!pathConversion.value) return 'Paste any CSS color and copy it as HEX, RGB, HSL, HWB, OKLCH, OKLab, LCH, Lab or Display P3. Colors outside sRGB stay exact. Free, no sign-up.'
		const byId = Object.fromEntries(pathConversion.value.values.map(item => [item.id, item.value]))
		return `${pathConversion.value.hex.toUpperCase()} is ${byId.rgb}, ${byId.hsl} and ${byId.oklch}. Copy it as HWB, OKLab, LCH, Lab or Display P3, then build shades or a full color system from it.`
	},
	ogTitle: defaultTitle,
	ogUrl: () => `${siteUrl}${route.path}`,
})
useHead({
	link: [{ rel: 'canonical', href: () => `${siteUrl}${route.path}` }],
	htmlAttrs: {
		style: computed(() => `--brand: ${conversion.value.hex}; --brand-foreground: ${readableTextColor(conversion.value.hex)}`),
	},
})

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const requestUrl = useRequestURL()

const gamutNote = computed(() => {
	if (conversion.value.inSrgb) return null
	return conversion.value.inP3
		? 'This color is outside sRGB, so HEX, RGB, HSL and HWB show the closest color most screens can display.'
		: 'This color is outside sRGB and Display P3, so those formats show the closest color screens can display.'
})

function changeColor(color: Oklch) {
	converter.set(color)
}

async function copyLink() {
	await copy(`${requestUrl.origin}${router.resolve(target.value).fullPath}`)
	showToast('Link copied', 'success', { description: hexLabel.value })
}

async function copyFormat(index: number) {
	const item = conversion.value.values[index]
	if (!item) return
	await copy(item.value)
	showToast(`Copied ${item.value}`, 'success', { description: item.label })
}

onKeyStroke(['1', '2', '3', '4', '5', '6', '7', '8', '9'], (event) => {
	if (isInteractiveTarget(event) || event.metaKey || event.ctrlKey || event.altKey) return
	copyFormat(Number(event.key) - 1)
})
onKeyStroke(['c', 'C'], (event) => {
	if (!isInteractiveTarget(event) && !event.metaKey && !event.ctrlKey) copyFormat(0)
})
onKeyStroke(['z', 'Z'], (event) => {
	if (!(event.metaKey || event.ctrlKey) || isInteractiveTarget(event)) return
	event.preventDefault()
	if (event.shiftKey) converter.redo()
	else converter.undo()
})
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col">
		<AppTopBar title="Color converter">
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="ghost" size="icon-sm" aria-label="Undo" :disabled="!converter.canUndo.value" @click="converter.undo()">
						<Icon name="lucide:undo-2" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Undo <Kbd>⌘Z</Kbd></TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="ghost" size="icon-sm" aria-label="Redo" :disabled="!converter.canRedo.value" @click="converter.redo()">
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
				<TooltipContent>Share this color</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button as-child size="sm">
						<NuxtLink :to="`/builder/${conversion.hex.slice(1)}`" aria-label="Use in builder">
							<Icon name="lucide:blocks" data-icon="inline-start" /> <span class="hidden sm:inline">Use in builder</span>
						</NuxtLink>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Build a full color system from {{ hexLabel }}</TooltipContent>
			</Tooltip>
		</AppTopBar>

		<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch">
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your color</CardTitle>
					<CardDescription>Paste a color in any format, or adjust it with the sliders.</CardDescription>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden lg:overflow-y-auto">
					<div
						class="flex h-28 items-end justify-between gap-3 rounded-xl p-3 text-sm ring-1 ring-foreground/10 ring-inset transition-colors duration-200"
						:style="{ background: conversion.hex, color: readableTextColor(conversion.hex) }"
					>
						<span class="font-medium">{{ converter.description.value }}</span>
						<span class="tabular-nums opacity-80">{{ hexLabel }}</span>
					</div>
					<ColorValueInput
						:color="converter.color.value"
						label="Paste any color"
						picker-label="Open color picker"
						hint="HEX, RGB, HSL, HWB, OKLCH, Lab, LCH, Display P3 or a CSS name."
						@change="changeColor"
						@update="value => converter.update(value)"
						@commit="converter.snapshot()"
					/>
					<ColorChannelSliders :color="converter.color.value" @update="patch => converter.update(patch)" @commit="converter.snapshot()" />
					<p v-if="gamutNote" class="flex gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
						<Icon name="lucide:info" class="mt-0.5 size-4 shrink-0" />
						{{ gamutNote }}
					</p>
				</CardContent>
			</Card>

			<Card size="sm" class="min-h-0" aria-label="Formats">
				<CardHeader>
					<CardTitle>{{ hexLabel }} in every format</CardTitle>
					<CardDescription>Click a value, or press 1–9, to copy it. Every value is valid CSS.</CardDescription>
				</CardHeader>
				<CardContent class="grid min-h-0 flex-1 content-start gap-6 lg:overflow-y-auto">
					<div class="-mx-3">
						<ConvertFormats />
					</div>
					<ConvertRelatedTools />
				</CardContent>
			</Card>
		</div>
	</div>
</template>
