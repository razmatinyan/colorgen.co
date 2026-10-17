<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { TokenMode } from '~/lib/color'
import { buildExportModel, toCssVariables, toDesignTokens, toFigmaTokens, toTailwindCss, type ValueFormat } from '~/lib/export'
import { designSystemBuilderKey } from '~/composables/useDesignSystemBuilder'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ review: [] }>()

const builder = inject(designSystemBuilderKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const download = useFileDownload()

type ExportFormat = 'tailwind' | 'css' | 'figma' | 'json'

const format = ref<ExportFormat>('tailwind')
const valueFormat = ref<ValueFormat>('oklch')
const figmaMode = ref<TokenMode>('light')

const formats = [
	{ value: 'tailwind', label: 'Tailwind + shadcn' },
	{ value: 'css', label: 'CSS' },
	{ value: 'figma', label: 'Figma' },
	{ value: 'json', label: 'Design tokens' },
] as const
const valueFormats = [
	{ value: 'oklch', label: 'OKLCH' },
	{ value: 'hex', label: 'HEX' },
] as const
const figmaModes = [
	{ value: 'light', label: 'Light', icon: 'lucide:sun' },
	{ value: 'dark', label: 'Dark', icon: 'lucide:moon' },
] as const

const instructions: Record<ExportFormat, string> = {
	tailwind: 'Paste into your globals.css in place of the shadcn color variables. Your scales also become utilities like bg-brand-500.',
	css: 'Paste into your stylesheet. Tokens point to the scale variables; add the dark class to <html> for dark mode.',
	figma: 'Import both files from Figma’s Variables panel: the light file into one mode, the dark file into another.',
	json: 'W3C design tokens (DTCG format) with the scales as primitives and light and dark tokens as aliases.',
}

interface ExportFile {
	name: string
	type: string
	content: string
	label: string
}

const model = computed(() => buildExportModel(builder.system.value, builder.tokens.value))

const files = computed<ExportFile[]>(() => {
	switch (format.value) {
		case 'tailwind':
			return [{ name: 'sygen-theme.css', type: 'text/css', label: 'Download', content: toTailwindCss(model.value, valueFormat.value) }]
		case 'css':
			return [{ name: 'sygen-variables.css', type: 'text/css', label: 'Download', content: toCssVariables(model.value, valueFormat.value) }]
		case 'figma':
			return (['light', 'dark'] as const).map(mode => ({
				name: `sygen-${mode}.tokens.json`,
				type: 'application/json',
				label: mode === 'light' ? 'Light file' : 'Dark file',
				content: toFigmaTokens(model.value, mode),
			}))
		case 'json':
			return [{ name: 'sygen.tokens.json', type: 'application/json', label: 'Download', content: toDesignTokens(model.value) }]
	}
})

const shownFile = computed(() => (format.value === 'figma' && figmaMode.value === 'dark' ? files.value[1]! : files.value[0]!))
const lineCount = computed(() => shownFile.value.content.trimEnd().split('\n').length)

async function copyShown() {
	await copy(shownFile.value.content)
	showToast('Copied to clipboard', 'success', { description: shownFile.value.name })
}

function downloadFile(file: ExportFile) {
	download(file.name, file.content, file.type)
	showToast(`Downloaded ${file.name}`, 'success')
}

function review() {
	open.value = false
	emit('review')
}
</script>

<template>
	<Dialog v-model:open="open">
		<DialogContent class="grid max-h-[min(92dvh,52rem)] grid-cols-1 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-4 p-5 sm:max-w-3xl sm:p-6">
			<DialogHeader>
				<DialogTitle>Export your color system</DialogTitle>
				<DialogDescription>Scales and tokens for light and dark mode, ready for code or Figma.</DialogDescription>
			</DialogHeader>

			<div class="grid min-w-0 gap-3">
				<div class="flex min-w-0 flex-wrap items-center gap-2 *:max-w-full *:overflow-x-auto">
					<AppSegmentedControl v-model="format" :options="formats" label="Export format" />
					<AppSegmentedControl v-if="format === 'tailwind' || format === 'css'" v-model="valueFormat" :options="valueFormats" label="Color format" />
					<AppSegmentedControl v-if="format === 'figma'" v-model="figmaMode" :options="figmaModes" label="Shown file" />
				</div>
				<p class="text-sm text-muted-foreground">{{ instructions[format] }}</p>
				<div
					v-if="builder.failingReadability.value.length"
					class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm"
				>
					<Icon name="lucide:triangle-alert" class="size-4 shrink-0 text-destructive" />
					<span class="min-w-0 flex-1">
						{{ builder.failingReadability.value.length }} readability {{ builder.failingReadability.value.length === 1 ? 'check fails' : 'checks fail' }}. You can still export.
					</span>
					<Button variant="outline" size="sm" class="bg-background" @click="review">Review tokens</Button>
				</div>
			</div>

			<div class="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/10">
				<div class="flex items-center justify-between gap-3 border-b px-4 py-2 text-sm">
					<span class="truncate font-medium">{{ shownFile.name }}</span>
					<span class="shrink-0 text-muted-foreground tabular-nums">{{ lineCount }} lines</span>
				</div>
				<pre class="min-h-0 overflow-auto p-4 font-sans text-xs/relaxed tabular-nums" tabindex="0" :aria-label="`Contents of ${shownFile.name}`">{{ shownFile.content }}</pre>
			</div>

			<DialogFooter class="flex-wrap gap-2 sm:justify-end">
				<Button variant="outline" @click="copyShown">
					<Icon name="lucide:copy" data-icon="inline-start" /> Copy
				</Button>
				<Button v-for="file in files" :key="file.name" @click="downloadFile(file)">
					<Icon name="lucide:download" data-icon="inline-start" /> {{ file.label }}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
