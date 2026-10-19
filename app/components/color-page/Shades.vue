<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { readableTextColor } from '~/lib/color'
import type { ColorPage } from '~/lib/color-page'
import { toTailwindScales } from '~/lib/export'
import { toScaleName } from '~/lib/scale-url'

const props = defineProps<{ page: ColorPage }>()

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

const hexLabel = computed(() => props.page.hex.toUpperCase())
const scaleName = computed(() => toScaleName(props.page.family))
const snippet = computed(() => toTailwindScales([{ name: scaleName.value, steps: props.page.shades }], 'hex'))

async function copySnippet() {
	await copy(snippet.value)
	showToast('Copied Tailwind theme', 'success', { description: `--color-${scaleName.value}-50 to 950` })
}
</script>

<template>
	<ColorPageSection
		id="shades"
		:title="`${hexLabel} shades and tints`"
		:description="`Eleven steps from 50 to 950 with ${hexLabel} kept exactly at step ${page.anchorStep}. Lightness steps are even to the eye, and intensity tapers toward the lightest and darkest steps.`"
	>
		<template #actions>
			<Button as-child variant="outline" size="sm">
				<NuxtLink :to="`/scale/${page.hex.slice(1)}`">
					Open in shade generator <Icon name="lucide:arrow-right" data-icon="inline-end" />
				</NuxtLink>
			</Button>
		</template>

		<ol class="@container grid grid-cols-6 gap-1.5 sm:grid-cols-11">
			<li v-for="swatch in page.shades" :key="swatch.step">
				<NuxtLink
					:to="`/color/${swatch.hex.slice(1)}`"
					class="flex h-20 w-full flex-col justify-between rounded-xl p-2 text-xs ring-1 ring-foreground/10 transition-transform duration-200 outline-none ring-inset focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] sm:h-28"
					:style="{ background: swatch.hex, color: readableTextColor(swatch.hex) }"
					:aria-label="`${scaleName}-${swatch.step}, ${swatch.hex.toUpperCase()}${swatch.step === page.anchorStep ? ', this color' : ''}`"
					:aria-current="swatch.step === page.anchorStep ? 'page' : undefined"
				>
					<span class="flex items-center justify-between gap-1 font-medium tabular-nums">
						{{ swatch.step }}
						<span v-if="swatch.step === page.anchorStep" class="size-1.5 rounded-full bg-current" aria-hidden="true" />
					</span>
					<span class="truncate tabular-nums opacity-80">{{ swatch.hex.slice(1).toUpperCase() }}</span>
				</NuxtLink>
			</li>
		</ol>

		<div class="grid gap-2 rounded-2xl bg-card ring-1 ring-foreground/10">
			<div class="flex items-center justify-between gap-3 border-b py-2 pr-2 pl-4">
				<p class="text-sm font-medium">Tailwind CSS v4 theme</p>
				<Button variant="ghost" size="sm" @click="copySnippet">
					<Icon name="lucide:copy" data-icon="inline-start" /> Copy
				</Button>
			</div>
			<CodeBlock
				class="max-h-72 overflow-auto px-4 pb-4"
				:code="snippet"
				language="css"
				label="Tailwind theme for these shades"
			/>
		</div>
	</ColorPageSection>
</template>
