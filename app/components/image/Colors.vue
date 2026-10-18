<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { readableTextColor } from '~/lib/color'
import { imageColorsKey } from '~/composables/useImageColors'

const image = inject(imageColorsKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

const shownShare = computed(() => image.colors.value.reduce((sum, color) => sum + color.share, 0) || 1)

function percent(share: number) {
	const value = share * 100
	return value < 1 ? '<1%' : `${Math.round(value)}%`
}

async function copyColor(hex: string, name: string) {
	const value = hex.toUpperCase()
	await copy(value)
	showToast(`Copied ${value}`, 'success', { description: name })
}
</script>

<template>
	<div class="@container grid gap-8">
		<div class="grid gap-2">
			<div
				class="flex h-14 gap-1"
				role="img"
				:aria-label="`Color proportions: ${image.colors.value.map((color) => `${color.hex.toUpperCase()} ${percent(color.share)}`).join(', ')}`"
			>
				<span
					v-for="color in image.colors.value"
					:key="color.hex"
					class="min-w-2 rounded-lg ring-1 ring-foreground/10 transition-[flex-grow] duration-200 ring-inset"
					:style="{ background: color.hex, flexGrow: color.share / shownShare }"
				/>
			</div>
			<p class="text-sm text-muted-foreground">
				How much of the image each color covers. Percentages count every pixel, so close shades may add up to less than
				100%.
			</p>
		</div>

		<ul class="grid grid-cols-2 gap-2 @lg:grid-cols-3 @3xl:grid-cols-5">
			<li v-for="color in image.colors.value" :key="color.hex">
				<button
					type="button"
					class="grid w-full gap-2.5 rounded-2xl bg-card p-1.5 text-left ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
					:aria-label="`Copy ${color.hex.toUpperCase()}, ${color.name}, ${percent(color.share)} of the image`"
					@click="copyColor(color.hex, color.name)"
				>
					<span
						class="flex h-20 items-start justify-end rounded-xl p-2 text-xs ring-1 ring-foreground/10 ring-inset"
						:style="{ background: color.hex, color: readableTextColor(color.hex) }"
					>
						<span
							v-if="image.brand.value?.hex === color.hex && image.isColorful.value"
							class="rounded-full bg-current/15 px-2 py-0.5 font-medium"
							>Brand pick</span
						>
					</span>
					<span class="grid gap-0.5 px-1.5 pb-1">
						<span class="flex items-baseline justify-between gap-2 text-sm">
							<span class="font-medium tabular-nums">{{ color.hex.toUpperCase() }}</span>
							<span class="text-muted-foreground tabular-nums">{{ percent(color.share) }}</span>
						</span>
						<span class="truncate text-sm text-muted-foreground">{{ color.name }}</span>
					</span>
				</button>
			</li>
		</ul>

		<section
			v-if="image.brand.value"
			class="grid gap-4 rounded-2xl bg-muted/50 p-4 ring-1 ring-foreground/10 @2xl:grid-cols-[auto_minmax(0,1fr)_auto] @2xl:items-center"
			aria-labelledby="image-brand"
		>
			<span
				class="size-14 rounded-xl ring-1 ring-foreground/10 ring-inset"
				:style="{ background: image.brand.value.hex }"
				aria-hidden="true"
			/>
			<div class="grid gap-1">
				<h3 id="image-brand" class="text-sm font-medium">
					{{ image.isColorful.value ? 'Suggested brand color' : 'Starting color' }}: {{ image.brand.value.name }}
					{{ image.brand.value.hex.toUpperCase() }}
				</h3>
				<p class="text-sm text-pretty text-muted-foreground">
					{{
						image.isColorful.value
							? 'The most colorful color that still covers a good part of the image. Build a full UI color system from it.'
							: 'This image has almost no color, so the most common one is used. A gray brand still gets a full system.'
					}}
				</p>
			</div>
			<div class="flex flex-wrap gap-2">
				<Button as-child size="sm">
					<NuxtLink :to="image.builderPath.value">
						<Icon name="lucide:blocks" data-icon="inline-start" /> Use in builder
					</NuxtLink>
				</Button>
				<Button as-child variant="outline" size="sm" class="bg-background dark:bg-input/30">
					<NuxtLink :to="`/color/${image.brand.value.hex.slice(1)}`">About this color</NuxtLink>
				</Button>
			</div>
		</section>

		<section class="grid gap-3" aria-labelledby="image-next">
			<h3 id="image-next" class="text-sm font-medium">Keep going</h3>
			<ul class="grid grid-cols-1 gap-2 @xl:grid-cols-2">
				<li>
					<NuxtLink
						:to="image.palettePath.value"
						class="flex h-full items-center gap-3 rounded-xl p-3 ring-1 ring-foreground/10 transition-colors outline-none ring-inset hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"
							><Icon name="lucide:swatch-book" class="size-4"
						/></span>
						<span class="grid min-w-0 gap-0.5">
							<span class="text-sm font-medium">Open as a palette</span>
							<span class="truncate text-xs text-muted-foreground">Up to five colors, with a live UI preview</span>
						</span>
					</NuxtLink>
				</li>
				<li>
					<NuxtLink
						:to="image.scalePath.value"
						class="flex h-full items-center gap-3 rounded-xl p-3 ring-1 ring-foreground/10 transition-colors outline-none ring-inset hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-muted"
							><Icon name="lucide:chart-column" class="size-4"
						/></span>
						<span class="grid min-w-0 gap-0.5">
							<span class="text-sm font-medium">Make shade scales</span>
							<span class="truncate text-xs text-muted-foreground">50–950 for up to six of these colors</span>
						</span>
					</NuxtLink>
				</li>
			</ul>
		</section>
	</div>
</template>
