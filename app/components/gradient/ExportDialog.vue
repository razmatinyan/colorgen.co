<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { toGradientCss, toNumberedVariables, toTailwindGradient, type ValueFormat } from '~/lib/export'
import { gradientGeneratorKey } from '~/composables/useGradientGenerator'

const open = defineModel<boolean>('open', { required: true })

const generator = inject(gradientGeneratorKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()
const download = useFileDownload()

type ExportFormat = 'css' | 'tailwind' | 'steps'

const format = ref<ExportFormat>('css')
const valueFormat = ref<ValueFormat>('hex')

const formats = [
	{ value: 'css', label: 'CSS' },
	{ value: 'tailwind', label: 'Tailwind' },
	{ value: 'steps', label: 'Steps' },
] as const
const valueFormats = [
	{ value: 'hex', label: 'HEX' },
	{ value: 'oklch', label: 'OKLCH' },
] as const

const instructions = computed<Record<ExportFormat, string>>(() => ({
	css:
		generator.state.value.space === 'srgb'
			? 'Paste into your stylesheet. sRGB is the CSS default, so it works in every browser.'
			: `Browsers without "in ${generator.state.value.space}" support use the first line, which looks the same.`,
	tailwind:
		generator.stops.value.length > 3
			? 'Tailwind gradient utilities take up to three colors, so this uses an arbitrary value. Needs Tailwind CSS v4.'
			: 'Add these classes to any element. Needs Tailwind CSS v4.',
	steps: `${generator.steps.value.length} solid colors along the gradient as CSS variables.`,
}))

const file = computed(() => {
	switch (format.value) {
		case 'css':
			return {
				name: 'sygen-gradient.css',
				type: 'text/css',
				content: toGradientCss(generator.gradient.value, valueFormat.value),
			}
		case 'tailwind':
			return {
				name: 'sygen-gradient.txt',
				type: 'text/plain',
				content: `${toTailwindGradient(generator.gradient.value)}\n`,
			}
		case 'steps':
			return {
				name: 'sygen-gradient-steps.css',
				type: 'text/css',
				content: toNumberedVariables(
					generator.steps.value.map((step) => step.color),
					valueFormat.value,
				),
			}
	}
})

async function copyFile() {
	await copy(file.value.content.trimEnd())
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
			class="grid max-h-[min(92dvh,44rem)] grid-cols-1 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-4 p-5 sm:max-w-2xl sm:p-6"
		>
			<DialogHeader>
				<DialogTitle>Export your gradient</DialogTitle>
				<DialogDescription>Ready to paste into CSS or Tailwind.</DialogDescription>
			</DialogHeader>

			<div class="grid min-w-0 gap-3">
				<div class="flex min-w-0 flex-wrap items-center gap-2 *:max-w-full *:overflow-x-auto">
					<AppSegmentedControl v-model="format" :options="formats" label="Export format" />
					<AppSegmentedControl
						v-if="format !== 'tailwind'"
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
				</div>
				<CodeBlock
					class="min-h-0 overflow-auto p-4"
					:code="file.content"
					:language="format === 'tailwind' ? 'text' : 'css'"
					:label="`Contents of ${file.name}`"
					wrap
				/>
			</div>

			<DialogFooter class="flex-wrap gap-2 sm:justify-end">
				<Button variant="outline" @click="copyFile"> <Icon name="lucide:copy" data-icon="inline-start" /> Copy </Button>
				<Button @click="downloadFile"> <Icon name="lucide:download" data-icon="inline-start" /> Download </Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
