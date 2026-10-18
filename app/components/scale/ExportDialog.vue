<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { toCssScales, toScaleDesignTokens, toTailwindScales, type ExportScale, type ValueFormat } from '~/lib/export'
import { scaleGeneratorKey } from '~/composables/useScaleGenerator'

const open = defineModel<boolean>('open', { required: true })

const generator = inject(scaleGeneratorKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const download = useFileDownload()

type ExportFormat = 'tailwind' | 'css' | 'json'

const format = ref<ExportFormat>('tailwind')
const valueFormat = ref<ValueFormat>('oklch')

const formats = [
	{ value: 'tailwind', label: 'Tailwind' },
	{ value: 'css', label: 'CSS' },
	{ value: 'json', label: 'Design tokens' },
] as const
const valueFormats = [
	{ value: 'oklch', label: 'OKLCH' },
	{ value: 'hex', label: 'HEX' },
] as const

const scales = computed<ExportScale[]>(() =>
	generator.scales.value.map((scale) => ({ name: scale.name, steps: scale.swatches })),
)

const instructions = computed<Record<ExportFormat, string>>(() => {
	const example = scales.value[0]!.name
	return {
		tailwind: `Paste into your main CSS file after @import "tailwindcss". Each step becomes a utility like bg-${example}-500.`,
		css: `Paste into your stylesheet and use the steps as var(--${example}-500).`,
		json: 'W3C design tokens (DTCG format), one group per scale. Figma can import it from the Variables panel.',
	}
})

const file = computed(() => {
	switch (format.value) {
		case 'tailwind':
			return { name: 'sygen-scales.css', type: 'text/css', content: toTailwindScales(scales.value, valueFormat.value) }
		case 'css':
			return { name: 'sygen-scales.css', type: 'text/css', content: toCssScales(scales.value, valueFormat.value) }
		case 'json':
			return { name: 'sygen-scales.tokens.json', type: 'application/json', content: toScaleDesignTokens(scales.value) }
	}
})
const lineCount = computed(() => file.value.content.trimEnd().split('\n').length)

async function copyFile() {
	await copy(file.value.content)
	showToast('Copied to clipboard', 'success', { description: file.value.name })
}

function downloadFile() {
	download(file.value.name, file.value.content, file.value.type)
	showToast(`Downloaded ${file.value.name}`, 'success')
}
</script>

<template>
	<Dialog v-model:open="open">
		<DialogContent
			class="grid max-h-[min(92dvh,52rem)] grid-cols-1 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-4 p-5 sm:max-w-3xl sm:p-6"
		>
			<DialogHeader>
				<DialogTitle>Export your scales</DialogTitle>
				<DialogDescription>Every step from 50 to 950, ready to paste into code or Figma.</DialogDescription>
			</DialogHeader>

			<div class="grid min-w-0 gap-3">
				<div class="flex min-w-0 flex-wrap items-center gap-2 *:max-w-full *:overflow-x-auto">
					<AppSegmentedControl v-model="format" :options="formats" label="Export format" />
					<AppSegmentedControl
						v-if="format !== 'json'"
						v-model="valueFormat"
						:options="valueFormats"
						label="Color format"
					/>
				</div>
				<p class="text-sm text-muted-foreground">{{ instructions[format] }}</p>
			</div>

			<div
				class="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/10"
			>
				<div class="flex items-center justify-between gap-3 border-b px-4 py-2 text-sm">
					<span class="truncate font-medium">{{ file.name }}</span>
					<span class="shrink-0 text-muted-foreground tabular-nums">{{ lineCount }} lines</span>
				</div>
				<pre
					class="min-h-0 overflow-auto p-4 font-sans text-xs/relaxed tabular-nums"
					tabindex="0"
					:aria-label="`Contents of ${file.name}`"
					>{{ file.content }}</pre>
			</div>

			<DialogFooter class="flex-wrap gap-2 sm:justify-end">
				<Button variant="outline" @click="copyFile"> <Icon name="lucide:copy" data-icon="inline-start" /> Copy </Button>
				<Button @click="downloadFile"> <Icon name="lucide:download" data-icon="inline-start" /> Download </Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
