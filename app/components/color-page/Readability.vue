<script setup lang="ts">
import type { ColorPage } from '~/lib/color-page'

const props = defineProps<{ page: ColorPage }>()

const hexLabel = computed(() => props.page.hex.toUpperCase())

function contrastPath(text: string, background: string) {
	return `/contrast/${text.slice(1)}-${background.slice(1)}`
}
</script>

<template>
	<ColorPageSection
		id="readability"
		:title="`Is ${hexLabel} readable?`"
		:description="`Contrast for text on ${hexLabel} and for ${hexLabel} used as text. WCAG 2.2 asks for 4.5:1 for body text and 3:1 for large text; APCA Lc rates how comfortable the text is to read.`"
	>
		<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<li
				v-for="row in page.readability"
				:key="row.id"
				class="flex flex-col gap-3 rounded-2xl bg-card p-2 ring-1 ring-foreground/10"
			>
				<div
					class="grid h-32 content-end gap-1 rounded-xl p-4 ring-1 ring-foreground/10 ring-inset"
					:style="{ background: row.background, color: row.text }"
				>
					<span class="text-2xl font-semibold tracking-(--tracking-heading)">Aa</span>
					<span class="text-sm">The quick brown fox</span>
				</div>
				<div class="grid gap-2 px-2">
					<div class="flex items-center justify-between gap-2">
						<h3 class="text-sm font-medium">{{ row.label }}</h3>
						<ColorContrastBadge :ratio="row.check.ratio" />
					</div>
					<p class="text-sm text-muted-foreground">
						APCA Lc <span class="tabular-nums">{{ Math.round(Math.abs(row.check.lc)) }}</span> ·
						{{ row.check.usage.label }}
					</p>
				</div>
				<NuxtLink
					v-if="row.fix"
					:to="`/color/${row.fix.hex.slice(1)}`"
					class="mx-2 flex items-center gap-2.5 rounded-xl bg-muted px-3 py-2 text-sm transition-colors outline-none hover:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					<span
						class="size-5 shrink-0 rounded-md ring-1 ring-foreground/10 ring-inset"
						:style="{ background: row.fix.hex }"
						aria-hidden="true"
					/>
					<span class="min-w-0">
						Closest readable: <span class="tabular-nums">{{ row.fix.hex.toUpperCase() }}</span>
						<span class="text-muted-foreground tabular-nums"> · {{ row.fix.ratio.toFixed(1) }}:1</span>
					</span>
				</NuxtLink>
				<NuxtLink
					:to="contrastPath(row.text, row.background)"
					class="mx-2 mt-auto mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					Check in contrast tool <Icon name="lucide:arrow-right" class="size-3.5" />
				</NuxtLink>
			</li>
		</ul>
	</ColorPageSection>
</template>
