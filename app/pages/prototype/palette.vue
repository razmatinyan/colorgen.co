<script setup lang="ts">
// PROTOTYPE — design review for the rebuilt palette tool. Not indexed; delete after Phase 2.
import { onKeyStroke, useClipboard } from '@vueuse/core'
import { harmonies, palettePrototypeKey, readableOn, toHex, usePalettePrototype } from '~/prototype/palette'

definePageMeta({ layout: 'tool' })
useSeoMeta({ title: 'Palette prototype | colorgen.co', robots: 'noindex, nofollow' })

const proto = usePalettePrototype()
provide(palettePrototypeKey, proto)

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const previewMode = ref<'light' | 'dark'>('light')
const style = computed(() => harmonies.find(option => option.value === proto.harmony.value)!)

// The logo mark adopts the palette's primary color.
const primaryHex = computed(() => toHex(proto.colors.value[0]!))
useHead({
	htmlAttrs: {
		style: computed(() => `--brand: ${primaryHex.value}; --brand-foreground: ${readableOn(primaryHex.value)}`),
	},
})

async function exportCss() {
	await copy(proto.cssExport())
	showToast('CSS variables copied', 'success', { description: 'Every color with 11 shades, ready to paste.' })
}

async function copySelected() {
	if (!proto.selected.value) return
	const hex = toHex(proto.selected.value).toUpperCase()
	await copy(hex)
	showToast(`Copied ${hex}`, 'success')
}

function isInteractive(event: KeyboardEvent) {
	const target = event.target as HTMLElement | null
	return !!target?.closest('input, textarea, select, button, a, [role="combobox"], [contenteditable="true"]')
}

onKeyStroke(' ', (event) => {
	if (isInteractive(event)) return
	event.preventDefault()
	proto.generate()
})
onKeyStroke(['l', 'L'], (event) => {
	if (!isInteractive(event) && proto.selected.value) proto.toggleLock(proto.selected.value.id)
})
onKeyStroke(['c', 'C'], (event) => {
	if (!isInteractive(event) && !event.metaKey && !event.ctrlKey) copySelected()
})
onKeyStroke(['ArrowDown', 'ArrowUp'], (event) => {
	if (isInteractive(event)) return
	event.preventDefault()
	proto.select(event.key === 'ArrowDown' ? 1 : -1)
})
onKeyStroke(['z', 'Z'], (event) => {
	if (!(event.metaKey || event.ctrlKey) || isInteractive(event)) return
	event.preventDefault()
	if (event.shiftKey) proto.redo()
	else proto.undo()
})
</script>

<template>
	<div class="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:px-6">
		<!-- Toolbar -->
		<div class="flex flex-wrap items-center gap-x-6 gap-y-3">
			<div>
				<h1 class="text-xl font-semibold">Palette generator</h1>
				<p class="text-sm text-muted-foreground">Press Generate for new colors. Click a color to fine-tune it.</p>
			</div>

			<div class="ml-auto flex flex-wrap items-center justify-end gap-2">
				<div class="mr-1 flex items-center">
					<Tooltip>
						<TooltipTrigger as-child>
							<Button variant="ghost" size="icon" aria-label="Undo" :disabled="!proto.canUndo.value" @click="proto.undo()">
								<Icon name="lucide:undo-2" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Undo <Kbd>⌘Z</Kbd></TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger as-child>
							<Button variant="ghost" size="icon" aria-label="Redo" :disabled="!proto.canRedo.value" @click="proto.redo()">
								<Icon name="lucide:redo-2" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Redo <Kbd>⇧⌘Z</Kbd></TooltipContent>
					</Tooltip>
				</div>

				<Tooltip>
					<TooltipTrigger as-child>
						<span class="hidden sm:inline-flex">
							<Button variant="outline" disabled>
								<Icon name="lucide:bookmark" data-icon="inline-start" /> Save
							</Button>
						</span>
					</TooltipTrigger>
					<TooltipContent>Library arrives in v1</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger as-child>
						<Button variant="outline" @click="exportCss">
							<Icon name="lucide:code" data-icon="inline-start" /> Export
						</Button>
					</TooltipTrigger>
					<TooltipContent>Copy all colors as CSS variables</TooltipContent>
				</Tooltip>
				<Button @click="proto.generate()">
					<Icon name="lucide:shuffle" data-icon="inline-start" /> Generate
					<Kbd class="ml-1 hidden bg-primary-foreground/15 text-primary-foreground/80 sm:inline-flex">Space</Kbd>
				</Button>
			</div>
		</div>

		<!-- Workspace: sidebar (colors + inline editing) and preview -->
		<div class="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:content-stretch">
			<Card size="sm" class="min-h-0">
				<CardHeader>
					<CardTitle>Your colors</CardTitle>
					<CardDescription>Click a color to edit it. Lock the ones you want to keep.</CardDescription>
				</CardHeader>
				<CardContent class="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden lg:overflow-y-auto">
					<div class="grid gap-2">
						<label for="style" class="text-sm font-medium">Style</label>
						<Select v-model="proto.harmony.value">
							<SelectTrigger id="style" class="w-full">
								<SelectValue>{{ style.label }}</SelectValue>
							</SelectTrigger>
							<SelectContent>
								<SelectItem v-for="option in harmonies" :key="option.value" :value="option.value" class="items-start">
									<span class="grid gap-0.5">
										<span>{{ option.label }}</span>
										<span class="text-muted-foreground">{{ option.description }}</span>
									</span>
								</SelectItem>
							</SelectContent>
						</Select>
						<p class="text-sm text-muted-foreground">{{ style.description }}</p>
					</div>

					<div class="-mx-2 grid gap-1">
						<PrototypePaletteRow v-for="color in proto.colors.value" :key="color.id" :color="color" />
					</div>
				</CardContent>
			</Card>

			<Card size="sm" class="min-h-0" aria-label="Live preview">
				<CardHeader>
					<CardTitle>Preview</CardTitle>
					<CardDescription>Your colors applied to common UI elements</CardDescription>
					<CardAction>
						<ToggleGroup
							:model-value="previewMode"
							type="single"
							size="sm"
							:spacing="1"
							aria-label="Preview mode"
							class="rounded-4xl bg-muted p-1"
							@update:model-value="value => value && (previewMode = value as 'light' | 'dark')"
						>
							<ToggleGroupItem
								v-for="mode in (['light', 'dark'] as const)"
								:key="mode"
								:value="mode"
								class="h-7 capitalize text-muted-foreground hover:bg-transparent data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs dark:data-[state=on]:bg-input/50"
							>
								<Icon :name="mode === 'light' ? 'lucide:sun' : 'lucide:moon'" /> {{ mode }}
							</ToggleGroupItem>
						</ToggleGroup>
					</CardAction>
				</CardHeader>
				<CardContent class="min-h-0 flex-1 lg:overflow-y-auto">
					<PrototypePreview :mode="previewMode" />
				</CardContent>
			</Card>
		</div>
	</div>
</template>
