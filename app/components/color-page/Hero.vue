<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { ColorPage } from '~/lib/color-page'

const props = defineProps<{ page: ColorPage, summary: string }>()

const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

const hexLabel = computed(() => props.page.hex.toUpperCase())
const bareHex = computed(() => props.page.hex.slice(1))

async function copyValue(label: string, value: string) {
	await copy(value)
	showToast(`Copied ${value}`, 'success', { description: label })
}
</script>

<template>
	<section class="grid grid-cols-1 items-center gap-10 pt-10 pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:pt-16 lg:pb-16">
		<div class="grid gap-6">
			<div class="grid gap-3">
				<p class="flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
					{{ page.name }}
					<Badge v-for="name in page.cssNames" :key="name" variant="secondary">CSS name: {{ name }}</Badge>
				</p>
				<h1 class="text-4xl font-semibold tracking-(--tracking-display) tabular-nums sm:text-5xl lg:text-6xl">{{ hexLabel }}</h1>
			</div>
			<p class="max-w-xl text-lg text-pretty text-muted-foreground">{{ summary }}</p>
			<div class="flex flex-wrap gap-2">
				<Button as-child>
					<NuxtLink :to="`/builder/${bareHex}`">
						<Icon name="lucide:blocks" data-icon="inline-start" /> Build a color system
					</NuxtLink>
				</Button>
				<Button as-child variant="outline">
					<NuxtLink :to="`/scale/${bareHex}`">
						<Icon name="lucide:chart-column" data-icon="inline-start" /> Shades
					</NuxtLink>
				</Button>
				<Button as-child variant="outline">
					<NuxtLink :to="`/contrast/${bareHex}-ffffff`">
						<Icon name="lucide:contrast" data-icon="inline-start" /> Contrast
					</NuxtLink>
				</Button>
			</div>
		</div>

		<div class="grid gap-2 rounded-2xl bg-card p-2 ring-1 ring-foreground/10">
			<div
				class="flex h-56 items-end justify-between gap-3 rounded-xl p-4 text-sm ring-1 ring-foreground/10 ring-inset sm:h-64"
				:style="{ background: page.hex, color: page.bestTextColor }"
			>
				<span class="font-medium">{{ page.name }}</span>
				<span class="tabular-nums opacity-80">{{ hexLabel }}</span>
			</div>
			<ul class="grid gap-0.5" aria-label="Color values">
				<li v-for="item in page.values" :key="item.id">
					<button
						type="button"
						class="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
						:aria-label="`Copy ${item.label} ${item.value}`"
						@click="copyValue(item.label, item.value)"
					>
						<span class="text-muted-foreground">{{ item.label }}</span>
						<span class="flex min-w-0 items-center gap-2">
							<span class="truncate tabular-nums">{{ item.value }}</span>
							<Icon name="lucide:copy" class="size-3.5 shrink-0 text-muted-foreground" />
						</span>
					</button>
				</li>
			</ul>
			<NuxtLink
				:to="`/convert/${bareHex}`"
				class="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				HWB, OKLab, LCH, Lab and Display P3
				<Icon name="lucide:arrow-right" class="size-4" />
			</NuxtLink>
		</div>
	</section>
</template>
