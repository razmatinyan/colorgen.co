<script setup lang="ts">
import { maxExtractCount, minExtractCount } from '~/lib/color'
import { imageColorsKey } from '~/composables/useImageColors'

const image = inject(imageColorsKey)!
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const modifierKey = useModifierKey()
const isDragging = ref(false)

function chooseFile() {
	fileInput.value?.click()
}

function onFileChange(event: Event) {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	if (file) image.loadFile(file)
	input.value = ''
}

function onDrop(event: DragEvent) {
	isDragging.value = false
	const file = event.dataTransfer?.files[0]
	if (file) image.loadFile(file)
}

defineExpose({ chooseFile })
</script>

<template>
	<div class="grid w-full min-w-0 grid-cols-1 gap-5">
		<input
			ref="fileInput"
			type="file"
			accept="image/*"
			class="sr-only"
			tabindex="-1"
			aria-hidden="true"
			@change="onFileChange"
		/>

		<div v-if="image.imageUrl.value" class="grid min-w-0 grid-cols-1 gap-3">
			<img
				:src="image.imageUrl.value"
				:alt="image.imageName.value ?? 'Your image'"
				class="block max-h-72 w-full max-w-full min-w-0 rounded-xl bg-muted object-contain ring-1 ring-foreground/10"
			/>
			<div class="flex items-center justify-between gap-2">
				<p class="min-w-0 truncate text-sm text-muted-foreground">{{ image.imageName.value }}</p>
				<div class="flex shrink-0 gap-1">
					<Button variant="outline" size="sm" @click="chooseFile">
						<Icon name="lucide:replace" data-icon="inline-start" /> Replace
					</Button>
					<Button variant="ghost" size="icon-sm" aria-label="Remove image" @click="image.clear()">
						<Icon name="lucide:x" />
					</Button>
				</div>
			</div>
		</div>

		<button
			v-else
			type="button"
			class="grid min-h-56 place-items-center content-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
			:class="isDragging && 'border-foreground/40 bg-muted/60'"
			:aria-busy="image.isLoading.value"
			@click="chooseFile"
			@dragover.prevent="isDragging = true"
			@dragleave="isDragging = false"
			@drop.prevent="onDrop"
		>
			<span class="grid size-11 place-items-center rounded-full bg-muted">
				<Icon
					:name="image.isLoading.value ? 'lucide:loader-circle' : 'lucide:image-up'"
					class="size-5"
					:class="image.isLoading.value && 'animate-spin motion-reduce:animate-none'"
				/>
			</span>
			<span class="grid gap-1">
				<span class="text-sm font-medium">Drop an image or choose a file</span>
				<span class="text-sm text-muted-foreground"
					>Or paste one with <Kbd>{{ modifierKey }}</Kbd> <Kbd>V</Kbd></span
				>
			</span>
		</button>

		<div class="flex items-center justify-between gap-3">
			<div class="grid gap-0.5">
				<p class="text-sm font-medium">Colors</p>
				<p class="text-sm text-muted-foreground">How many to pull out</p>
			</div>
			<div class="flex items-center gap-1 rounded-4xl bg-muted p-1" role="group" aria-label="Number of colors">
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Fewer colors"
					:disabled="image.count.value <= minExtractCount"
					@click="image.setCount(image.count.value - 1)"
				>
					<Icon name="lucide:minus" />
				</Button>
				<output class="w-6 text-center text-sm tabular-nums" aria-live="polite">{{ image.count.value }}</output>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="More colors"
					:disabled="image.count.value >= maxExtractCount"
					@click="image.setCount(image.count.value + 1)"
				>
					<Icon name="lucide:plus" />
				</Button>
			</div>
		</div>

		<p class="flex gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
			<Icon name="lucide:lock" class="mt-0.5 size-4 shrink-0" />
			Your image never leaves your device. Colors are read in the browser.
		</p>

		<Button v-if="!image.hasImage.value" variant="ghost" size="sm" class="w-fit" @click="image.loadSample()">
			<Icon name="lucide:sparkles" data-icon="inline-start" /> Try a sample image
		</Button>
	</div>
</template>
