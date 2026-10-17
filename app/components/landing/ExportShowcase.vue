<script setup lang="ts">
import { useClipboard, useDocumentVisibility, useIntervalFn, usePreferredReducedMotion } from '@vueuse/core'
import { buildExportModel, toCssVariables, toDesignTokens, toFigmaTokens, toTailwindCss } from '~/lib/export'
import { landingDemoKey } from '~/composables/useLandingDemo'

const { builder } = inject(landingDemoKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

type FormatId = 'tailwind' | 'css' | 'figma' | 'json'

const formats: { id: FormatId, label: string, text: string, icon: string, file: string, anchor: string }[] = [
	{ id: 'tailwind', label: 'Tailwind + shadcn', text: 'Drop-in globals.css with your scales as utilities.', icon: 'lucide:wind', file: 'globals.css', anchor: ':root {' },
	{ id: 'css', label: 'CSS variables', text: 'Tokens that point to your scales, with a dark class.', icon: 'lucide:braces', file: 'variables.css', anchor: '  --background:' },
	{ id: 'figma', label: 'Figma variables', text: 'One file per mode for Figma’s variable import.', icon: 'lucide:figma', file: 'light.tokens.json', anchor: '  "theme": {' },
	{ id: 'json', label: 'Design tokens', text: 'W3C format with primitives and aliases.', icon: 'lucide:file-json', file: 'colorgen.tokens.json', anchor: '  "light": {' },
]

const active = ref<FormatId>('tailwind')
const model = computed(() => buildExportModel(builder.system.value, builder.tokens.value))
const content = computed(() => {
	switch (active.value) {
		case 'tailwind': return toTailwindCss(model.value)
		case 'css': return toCssVariables(model.value)
		case 'figma': return toFigmaTokens(model.value, 'light')
		case 'json': return toDesignTokens(model.value)
	}
})

const excerptLength = 15
const colorValue = /(oklch\([^)]+\)|#[0-9a-f]{6}\b)/i
const lines = computed(() => {
	const all = content.value.split('\n')
	const format = formats.find(item => item.id === active.value)!
	const start = Math.max(0, all.findIndex(line => line.startsWith(format.anchor)))
	const prefix = active.value === 'css' ? [':root {'] : []
	return [...prefix, ...all.slice(start, start + excerptLength - prefix.length), '  …'].map(text => ({
		text,
		color: text.match(colorValue)?.[1] ?? null,
	}))
})

const reducedMotion = usePreferredReducedMotion()
const visibility = useDocumentVisibility()
const rotation = useIntervalFn(() => {
	if (visibility.value !== 'visible') return
	const index = formats.findIndex(format => format.id === active.value)
	active.value = formats[(index + 1) % formats.length]!.id
}, 4200, { immediate: false })

onMounted(() => {
	if (reducedMotion.value !== 'reduce') rotation.resume()
})

function choose(id: FormatId) {
	rotation.pause()
	active.value = id
}

async function copyFile() {
	await copy(content.value)
	showToast('Copied to clipboard', 'success', { description: formats.find(format => format.id === active.value)!.file })
}
</script>

<template>
	<section class="border-y bg-muted/30">
		<div class="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:py-28">
			<div class="grid gap-8">
				<LandingSectionHeading
					label="Exports"
					title="Paste it where you already work."
					description="The same tokens, written four ways. Copy them or download the files."
				/>
				<div class="grid gap-1.5" role="tablist" aria-label="Export format">
					<button
						v-for="format in formats"
						:key="format.id"
						type="button"
						role="tab"
						:aria-selected="active === format.id"
						class="flex items-center gap-3 rounded-xl p-3 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50"
						:class="active === format.id ? 'bg-background ring-1 ring-foreground/10 dark:bg-card' : 'hover:bg-muted/60'"
						@click="choose(format.id)"
					>
						<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
							<Icon :name="format.icon" class="size-4" />
						</span>
						<span class="min-w-0">
							<span class="block text-sm font-medium">{{ format.label }}</span>
							<span class="block text-sm text-muted-foreground">{{ format.text }}</span>
						</span>
					</button>
				</div>
			</div>

			<LandingReveal :delay="120">
				<div class="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10" role="tabpanel">
					<div class="flex items-center justify-between gap-3 border-b px-4 py-2.5">
						<span class="flex items-center gap-2 text-sm font-medium">
							<Icon :name="formats.find(format => format.id === active)!.icon" class="size-4 text-muted-foreground" />
							{{ formats.find(format => format.id === active)!.file }}
						</span>
						<Button variant="ghost" size="sm" @click="copyFile">
							<Icon name="lucide:copy" data-icon="inline-start" /> Copy
						</Button>
					</div>
					<pre class="h-[25rem] overflow-hidden p-5 font-sans text-[13px]/relaxed tabular-nums" aria-live="polite"><span
						v-for="(line, index) in lines"
						:key="`${active}-${builder.brandHex.value}-${index}`"
						class="flex items-center gap-2 animate-in fade-in slide-in-from-left-1 fill-mode-both duration-300"
						:style="{ animationDelay: `${index * 35}ms` }"
					><span class="whitespace-pre text-muted-foreground" :class="line.color && 'text-foreground'">{{ line.text || ' ' }}</span><span v-if="line.color" class="size-3 shrink-0 rounded-[3px] ring-1 ring-foreground/10 ring-inset" :style="{ background: line.color }" /></span></pre>
				</div>
			</LandingReveal>
		</div>
	</section>
</template>
