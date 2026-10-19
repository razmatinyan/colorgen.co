<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import { generateSystem, toHex } from '~/lib/color'
import { importFormatLabels, importSample, readImport, type ImportSource, type TokenMatch } from '~/lib/import'
import { colorDetails, designSystemBuilderKey, tokenRefLabel } from '~/composables/useDesignSystemBuilder'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ imported: [] }>()

const builder = inject(designSystemBuilderKey)!
const { showToast } = useAppToast()

const acceptedFiles = '.css,.scss,.json,.js,.cjs,.mjs,.ts'
const maxFileSize = 1_000_000
const inputId = useId()

const step = ref<'source' | 'review'>('source')
const text = ref('')
const files = ref<ImportSource[]>([])
const isDragging = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const debouncedText = refDebounced(text, 200)

const sources = computed<ImportSource[]>(() =>
	files.value.length ? files.value : [{ text: debouncedText.value, fileName: undefined }],
)
const reading = computed(() => readImport(sources.value))
const result = computed(() => reading.value.result)
const hasInput = computed(() => files.value.length > 0 || debouncedText.value.trim().length > 0)

watch(open, (isOpen) => {
	if (isOpen) step.value = 'source'
})

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

const detection = computed(() => {
	const { formats, colorCount, tokenCount, scaleNames, hasDarkMode, missingReferences } = reading.value
	if (!hasInput.value) {
		return { ok: false, text: 'Paste a shadcn globals.css, a Tailwind config or a design tokens JSON file.' }
	}
	if (!formats.length) {
		return { ok: false, text: 'This doesn’t look like CSS variables, a Tailwind config or design tokens JSON.' }
	}
	if (!colorCount) {
		const hint = missingReferences ? ' Its colors point to CSS variables, so paste the CSS file that defines them.' : ''
		return { ok: false, text: `No colors found.${hint}` }
	}
	if (!result.value) return { ok: false, text: 'Found colors, but none that could be a brand color.' }
	const parts = [
		formats.map((format) => importFormatLabels[format]).join(' and '),
		tokenCount ? plural(tokenCount, 'token', 'tokens') : null,
		scaleNames.length ? plural(scaleNames.length, 'scale', 'scales') : null,
		tokenCount ? (hasDarkMode ? 'light and dark' : 'light only') : null,
	]
	return { ok: true, text: parts.filter(Boolean).join(' · ') }
})

const warnings = computed(() => {
	const { missingReferences, unreadable, colorCount } = reading.value
	if (!colorCount) return []
	return [
		missingReferences
			? `${plural(missingReferences, 'color points', 'colors point')} to variables that aren’t in this file.`
			: null,
		unreadable ? `${plural(unreadable, 'value', 'values')} couldn’t be read as colors.` : null,
	].filter((warning): warning is string => warning !== null)
})

async function addFiles(list: FileList | null | undefined) {
	const chosen = [...(list ?? [])]
	const readable = chosen.filter((file) => file.size <= maxFileSize)
	if (readable.length < chosen.length) showToast('Files over 1 MB are skipped', 'warning')
	if (!readable.length) return
	files.value = await Promise.all(readable.map(async (file) => ({ text: await file.text(), fileName: file.name })))
}

function onFileChange(event: Event) {
	const input = event.target as HTMLInputElement
	addFiles(input.files)
	input.value = ''
}

function onDrop(event: DragEvent) {
	isDragging.value = false
	addFiles(event.dataTransfer?.files)
}

function useSample() {
	files.value = []
	text.value = importSample
}

const previewSystem = computed(() => (result.value ? generateSystem(result.value.system) : null))

const picks = computed(() =>
	(result.value?.picks ?? []).map((pick) => {
		const scale = previewSystem.value?.[pick.id]
		return {
			...pick,
			label: colorDetails[pick.id].label,
			hex: scale ? toHex(scale.base) : null,
			description: pick.source ? `From ${pick.source}` : 'Suggested from your brand',
		}
	}),
)

const comparisons = computed(() => result.value?.comparisons ?? [])
const matchCounts = computed(() => {
	const counts: Record<TokenMatch, number> = { same: 0, close: 0, changed: 0 }
	for (const entry of comparisons.value) counts[entry.match]++
	return counts
})

type TokenFilter = 'differences' | 'all'
const tokenFilter = ref<TokenFilter>('differences')
const tokenFilters = [
	{ value: 'differences', label: 'Differences' },
	{ value: 'all', label: 'All' },
] as const
const shownComparisons = computed(() =>
	tokenFilter.value === 'all' ? comparisons.value : comparisons.value.filter((entry) => entry.match !== 'same'),
)

const tokenSummary = computed(() => {
	if (!result.value) return ''
	const { same, close, changed } = matchCounts.value
	const filled = result.value.missingTokens
	const sentences = [
		comparisons.value.length
			? `${plural(comparisons.value.length, 'value', 'values')} imported: ${same} same, ${close} close, ${changed} changed.`
			: 'No shadcn tokens found, so every token is filled in from your colors.',
		comparisons.value.length && filled
			? `${plural(filled, 'missing value is', 'missing values are')} filled in.`
			: null,
		result.value.hasDarkMode ? null : 'Dark mode is generated for you.',
	]
	return sentences.filter(Boolean).join(' ')
})

const matchLabels: Record<TokenMatch, string> = { same: 'Same', close: 'Close', changed: 'Changed' }
const matchClasses: Record<TokenMatch, string> = {
	same: 'bg-muted text-muted-foreground',
	close: 'bg-secondary text-secondary-foreground',
	changed: 'bg-warning/20 text-foreground',
}
const modeLabels = { light: 'Light', dark: 'Dark' } as const

function apply() {
	if (!result.value) return
	builder.load({ ...result.value.system })
	open.value = false
	const failing = builder.failingReadability.value.length
	showToast('Colors imported', 'success', {
		description: failing
			? `${plural(failing, 'readability check fails', 'readability checks fail')}. Fix them in Tokens.`
			: 'Every readability check passes.',
	})
	emit('imported')
}
</script>

<template>
	<Dialog v-model:open="open">
		<DialogContent
			class="grid max-h-[min(92dvh,52rem)] grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 p-5 sm:max-w-2xl sm:p-6"
		>
			<DialogHeader>
				<DialogTitle>{{ step === 'source' ? 'Import your colors' : 'Check the import' }}</DialogTitle>
				<DialogDescription>
					{{
						step === 'source'
							? 'Bring in an existing theme to fix its contrast, add dark mode or fill in missing scales.'
							: 'Your colors are rebuilt as full scales. Tokens snap to the nearest step.'
					}}
				</DialogDescription>
			</DialogHeader>

			<div v-if="step === 'source'" class="grid min-h-0 grid-cols-1 content-start gap-3 overflow-y-auto">
				<input
					ref="fileInput"
					type="file"
					:accept="acceptedFiles"
					multiple
					class="sr-only"
					tabindex="-1"
					aria-hidden="true"
					@change="onFileChange"
				/>

				<div
					v-if="files.length"
					class="grid gap-2 rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/10"
					aria-label="Chosen files"
				>
					<p v-for="file in files" :key="file.fileName" class="flex min-w-0 items-center gap-2 text-sm">
						<Icon name="lucide:file-code" class="size-4 shrink-0 text-muted-foreground" />
						<span class="truncate">{{ file.fileName }}</span>
					</p>
					<Button variant="ghost" size="sm" class="w-fit" @click="files = []">
						<Icon name="lucide:x" data-icon="inline-start" /> Paste text instead
					</Button>
				</div>

				<div
					v-else
					class="grid gap-2"
					@dragover.prevent="isDragging = true"
					@dragleave="isDragging = false"
					@drop.prevent="onDrop"
				>
					<label :for="inputId" class="text-sm font-medium">Your theme</label>
					<Textarea
						:id="inputId"
						v-model="text"
						spellcheck="false"
						autocomplete="off"
						placeholder="Paste CSS, JSON or a Tailwind config, or drop files here"
						class="field-sizing-fixed h-56 overflow-auto text-sm"
						:class="isDragging && 'border-foreground/40 bg-muted/60'"
					/>
				</div>

				<div class="grid gap-1" aria-live="polite">
					<p class="flex items-start gap-2 text-sm" :class="detection.ok ? 'text-foreground' : 'text-muted-foreground'">
						<Icon
							:name="detection.ok ? 'lucide:circle-check' : 'lucide:info'"
							class="mt-0.5 size-4 shrink-0"
							:class="detection.ok && 'text-success'"
						/>
						{{ detection.text }}
					</p>
					<p v-for="warning in warnings" :key="warning" class="flex items-start gap-2 text-sm text-muted-foreground">
						<Icon name="lucide:triangle-alert" class="mt-0.5 size-4 shrink-0" />
						{{ warning }}
					</p>
				</div>

				<div class="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" @click="fileInput?.click()">
						<Icon name="lucide:folder-open" data-icon="inline-start" /> Choose files
					</Button>
					<Button variant="ghost" size="sm" @click="useSample">
						<Icon name="lucide:sparkles" data-icon="inline-start" /> Try an example
					</Button>
				</div>

				<p class="flex gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm text-muted-foreground">
					<Icon name="lucide:lock" class="mt-0.5 size-4 shrink-0" />
					Your files are read in the browser and never uploaded.
				</p>
			</div>

			<div v-else-if="result" class="grid min-h-0 grid-cols-1 content-start gap-6 overflow-y-auto">
				<section class="grid gap-2" aria-labelledby="import-colors-heading">
					<h3 id="import-colors-heading" class="text-sm font-medium">Your colors</h3>
					<ul class="grid grid-cols-1 gap-1 sm:grid-cols-2">
						<li
							v-for="pick in picks"
							:key="pick.id"
							class="flex min-w-0 items-center gap-3 rounded-xl p-2 ring-1 ring-foreground/10"
						>
							<span
								class="size-8 shrink-0 rounded-lg ring-1 ring-foreground/10 ring-inset"
								:style="{ background: pick.hex ?? undefined }"
								aria-hidden="true"
							/>
							<span class="grid min-w-0">
								<span class="text-sm font-medium">{{ pick.label }}</span>
								<span class="truncate text-sm text-muted-foreground">{{ pick.description }}</span>
							</span>
						</li>
					</ul>
				</section>

				<section class="grid gap-3" aria-labelledby="import-tokens-heading">
					<div class="flex flex-wrap items-start justify-between gap-3">
						<div class="grid min-w-0 flex-1 gap-0.5">
							<h3 id="import-tokens-heading" class="text-sm font-medium">Tokens</h3>
							<p class="text-sm text-muted-foreground">{{ tokenSummary }}</p>
						</div>
						<AppSegmentedControl
							v-if="comparisons.length"
							v-model="tokenFilter"
							:options="tokenFilters"
							label="Shown tokens"
						/>
					</div>

					<p
						v-if="comparisons.length && !shownComparisons.length"
						class="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm"
					>
						<Icon name="lucide:circle-check" class="size-4 shrink-0 text-success" />
						Every imported value keeps its color.
					</p>
					<ul
						v-else-if="shownComparisons.length"
						class="grid grid-cols-1 gap-0.5 rounded-xl bg-muted/50 p-1 ring-1 ring-foreground/10"
					>
						<li
							v-for="entry in shownComparisons"
							:key="`${entry.name}.${entry.mode}`"
							class="flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm"
						>
							<span class="grid min-w-0 flex-1">
								<span class="truncate">{{ entry.name }}</span>
								<span class="text-muted-foreground">{{ modeLabels[entry.mode] }}</span>
							</span>
							<span
								class="flex shrink-0 items-center gap-1.5"
								role="img"
								:aria-label="`${entry.imported} becomes ${tokenRefLabel(entry.ref)}, ${entry.result}`"
							>
								<span
									class="size-6 rounded-md ring-1 ring-foreground/10 ring-inset"
									:style="{ background: entry.imported }"
								/>
								<Icon name="lucide:arrow-right" class="size-3.5 text-muted-foreground" />
								<span
									class="size-6 rounded-md ring-1 ring-foreground/10 ring-inset"
									:style="{ background: entry.result }"
								/>
							</span>
							<span class="hidden w-24 shrink-0 truncate text-muted-foreground sm:block">
								{{ tokenRefLabel(entry.ref) }}
							</span>
							<Badge variant="secondary" class="w-16 shrink-0" :class="matchClasses[entry.match]">
								{{ matchLabels[entry.match] }}
							</Badge>
						</li>
					</ul>
				</section>
			</div>

			<DialogFooter class="flex-wrap gap-2 sm:justify-end">
				<template v-if="step === 'source'">
					<Button variant="outline" @click="open = false">Cancel</Button>
					<Button :disabled="!result" @click="step = 'review'">
						Continue <Icon name="lucide:arrow-right" data-icon="inline-end" />
					</Button>
				</template>
				<template v-else>
					<Button variant="outline" @click="step = 'source'">
						<Icon name="lucide:arrow-left" data-icon="inline-start" /> Back
					</Button>
					<Button @click="apply"> <Icon name="lucide:check" data-icon="inline-start" /> Open in builder </Button>
				</template>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
