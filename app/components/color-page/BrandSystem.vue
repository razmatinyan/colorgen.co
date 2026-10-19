<script setup lang="ts">
import {
	parseTokenRef,
	readableTextColor,
	tokenModes,
	wcagRatio,
	type TokenMode,
	type TokenName,
	type TokenRef,
} from '~/lib/color'
import { systemScaleLabels, type ColorPage } from '~/lib/color-page'

const props = defineProps<{ page: ColorPage }>()

const hexLabel = computed(() => props.page.hex.toUpperCase())
const tokens = computed(() => props.page.system.tokens)

const modeLabels: Record<TokenMode, string> = { light: 'Light', dark: 'Dark' }

function refLabel(ref: TokenRef) {
	const parsed = parseTokenRef(ref)
	if (!parsed || parsed === 'white') return 'White'
	return `${systemScaleLabels[parsed.scale]} ${parsed.step}`
}

function token(name: TokenName, mode: TokenMode) {
	return tokens.value[name][mode].hex
}

const facts = computed(() => {
	const { primary } = tokens.value
	const foreground = tokens.value['primary-foreground']
	const lightRatio = wcagRatio(foreground.light.hex, primary.light.hex).toFixed(1)
	const darkRatio = wcagRatio(primary.dark.hex, tokens.value.background.dark.hex).toFixed(1)
	return [
		`Primary buttons use ${refLabel(primary.light.ref)} with ${refLabel(foreground.light.ref).toLowerCase()} text, at ${lightRatio}:1.`,
		primary.dark.ref === primary.light.ref
			? `In dark mode primary stays ${refLabel(primary.dark.ref)}: it already reads on the dark background at ${darkRatio}:1.`
			: `In dark mode primary lifts to ${refLabel(primary.dark.ref)} so it reads on the dark background, at ${darkRatio}:1.`,
		'Neutrals carry a hint of its hue, so grays, borders and surfaces feel related to the brand.',
		'Success, warning, danger and info lean toward its hue and stay easy to tell apart.',
	]
})
</script>

<template>
	<ColorPageSection
		id="brand"
		:title="`${hexLabel} as a brand color`"
		:description="`What a UI color system built from ${hexLabel} looks like: brand, neutral and status scales, with light and dark tokens that pass WCAG.`"
	>
		<template #actions>
			<Button as-child size="sm">
				<NuxtLink :to="`/builder/${page.hex.slice(1)}`">
					<Icon name="lucide:blocks" data-icon="inline-start" /> Open in builder
				</NuxtLink>
			</Button>
		</template>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
			<div class="grid content-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
				<div
					v-for="scale in page.system.scales"
					:key="scale.id"
					class="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3"
				>
					<h3 class="truncate text-sm text-muted-foreground">{{ scale.label }}</h3>
					<ol class="grid grid-cols-11 gap-1" :aria-label="`${scale.label} scale`">
						<li
							v-for="swatch in scale.swatches"
							:key="swatch.step"
							class="grid h-8 place-items-center rounded-md ring-1 ring-foreground/10 ring-inset"
							:style="{ background: swatch.hex }"
							:title="`${scale.label} ${swatch.step} · ${swatch.hex.toUpperCase()}`"
						>
							<span
								v-if="swatch.step === scale.anchorStep"
								class="size-1.5 rounded-full"
								:style="{ background: readableTextColor(swatch.hex) }"
								aria-hidden="true"
							/>
							<span class="sr-only">{{ scale.label }} {{ swatch.step }}, {{ swatch.hex.toUpperCase() }}</span>
						</li>
					</ol>
				</div>
				<ul class="mt-3 grid gap-2 border-t pt-4 text-sm text-muted-foreground">
					<li v-for="fact in facts" :key="fact" class="flex gap-2">
						<Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-foreground" />
						{{ fact }}
					</li>
				</ul>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
				<div
					v-for="mode in tokenModes"
					:key="mode"
					class="grid gap-3 rounded-2xl p-4 ring-1 ring-foreground/10"
					:style="{ background: token('background', mode), color: token('foreground', mode) }"
					:aria-label="`${modeLabels[mode]} mode preview`"
					role="img"
				>
					<div
						class="grid gap-3 rounded-xl border p-4"
						:style="{ background: token('card', mode), borderColor: token('border', mode) }"
					>
						<div class="flex items-center justify-between gap-2">
							<span class="text-sm font-semibold">{{ modeLabels[mode] }} mode</span>
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium"
								:style="{ background: token('success', mode), color: token('success-foreground', mode) }"
								>Active</span
							>
						</div>
						<span class="text-sm" :style="{ color: token('muted-foreground', mode) }"
							>Invite your team to start building.</span
						>
						<span
							class="h-8 rounded-full border px-3 text-sm/8"
							:style="{ borderColor: token('input', mode), color: token('muted-foreground', mode) }"
							>name@company.com</span
						>
						<span class="flex gap-2">
							<span
								class="h-8 rounded-full px-3.5 text-sm/8 font-medium"
								:style="{ background: token('primary', mode), color: token('primary-foreground', mode) }"
								>Send invite</span
							>
							<span
								class="h-8 rounded-full px-3.5 text-sm/8 font-medium"
								:style="{ background: token('secondary', mode), color: token('secondary-foreground', mode) }"
								>Cancel</span
							>
						</span>
					</div>
				</div>
			</div>
		</div>
	</ColorPageSection>
</template>
