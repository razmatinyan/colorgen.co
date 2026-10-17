<script setup lang="ts">
import { onKeyStroke, useClipboard, useEventListener } from '@vueuse/core'
import { toNumberedVariables } from '~/lib/export'
import { isInteractiveTarget } from '~/lib/keyboard'
import { imageColorsKey, useImageColors } from '~/composables/useImageColors'

definePageMeta({ layout: 'app' })

const image = useImageColors()
provide(imageColorsKey, image)

const siteUrl = 'https://sygen.app'
const title = 'Extract Colors from an Image: Palette and Brand Color | Sygen'
const description = 'Drop a photo, logo or screenshot to get its main colors with how much of the image each covers, plus a suggested brand color to build a full UI color system from. Runs in your browser, free, no sign-up.'
useSeoMeta({
	title,
	description,
	ogTitle: title,
	ogDescription: description,
	ogUrl: `${siteUrl}/image-colors`,
})
useHead({
	link: [{ rel: 'canonical', href: `${siteUrl}/image-colors` }],
})

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const drop = useTemplateRef<{ chooseFile: () => void }>('drop')

async function copyCss() {
	if (!image.colors.value.length) return
	await copy(toNumberedVariables(image.colors.value.map(color => color.hex), 'hex', 'image').trimEnd())
	showToast('Copied CSS variables', 'success', { description: `${image.colors.value.length} colors` })
}

useEventListener(import.meta.client ? window : undefined, 'paste', (event: ClipboardEvent) => {
	const file = [...(event.clipboardData?.files ?? [])].find(item => item.type.startsWith('image/'))
	if (!file) return
	event.preventDefault()
	image.loadFile(file)
})

onKeyStroke(['c', 'C'], (event) => {
	if (!isInteractiveTarget(event) && !event.metaKey && !event.ctrlKey) copyCss()
})
onKeyStroke(['o', 'O'], (event) => {
	if (isInteractiveTarget(event) || event.metaKey || event.ctrlKey) return
	event.preventDefault()
	drop.value?.chooseFile()
})
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col">
		<AppTopBar title="Image color extractor">
			<Tooltip>
				<TooltipTrigger as-child>
					<Button variant="outline" size="sm" aria-label="Copy CSS" :disabled="!image.hasImage.value" @click="copyCss">
						<Icon name="lucide:copy" data-icon="inline-start" /> <span class="hidden sm:inline">Copy CSS</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>Copy the colors as CSS variables <Kbd>C</Kbd></TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger as-child>
					<Button as-child size="sm">
						<NuxtLink :to="image.builderPath.value" aria-label="Use in builder">
							<Icon name="lucide:blocks" data-icon="inline-start" /> <span class="hidden sm:inline">Use in builder</span>
						</NuxtLink>
					</Button>
				</TooltipTrigger>
				<TooltipContent>{{ image.brand.value ? `Build a color system from ${image.brand.value.hex.toUpperCase()}` : 'Build a color system' }}</TooltipContent>
			</Tooltip>
		</AppTopBar>

		<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch">
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your image</CardTitle>
					<CardDescription>A photo, logo or screenshot. Press O to choose a file.</CardDescription>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col overflow-x-hidden lg:overflow-y-auto">
					<ImageDrop ref="drop" />
				</CardContent>
			</Card>

			<Card size="sm" class="min-h-0" aria-label="Colors">
				<CardHeader>
					<CardTitle>Colors in your image</CardTitle>
					<CardDescription>{{ image.hasImage.value ? 'Largest first. Click a color to copy it.' : 'Add an image to see its colors.' }}</CardDescription>
				</CardHeader>
				<CardContent class="min-h-0 flex-1 lg:overflow-y-auto">
					<ImageColors v-if="image.hasImage.value" />
					<div v-else class="grid h-full min-h-64 place-items-center content-center gap-4 rounded-xl bg-muted/40 p-8 text-center">
						<div class="flex gap-1.5" aria-hidden="true">
							<span v-for="shade in [20, 35, 50, 65, 80]" :key="shade" class="size-8 rounded-lg bg-foreground" :style="{ opacity: shade / 100 }" />
						</div>
						<div class="grid max-w-sm gap-1">
							<p class="text-sm font-medium">No image yet</p>
							<p class="text-sm text-pretty text-muted-foreground">Drop, paste or choose an image. You'll get its main colors and a brand color to build a full system from.</p>
						</div>
						<Button variant="outline" size="sm" @click="image.loadSample()">
							<Icon name="lucide:sparkles" data-icon="inline-start" /> Try a sample image
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</template>
