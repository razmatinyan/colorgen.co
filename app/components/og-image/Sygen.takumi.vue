<script setup lang="ts">
import { readableTextColor, scaleSteps } from '~/lib/color'
import { buildOgImage } from '~/lib/og-image'

const props = defineProps<{
	kind?: string
	colors?: string
	tint?: number | string
	hue?: number | string
	type?: string
	angle?: number | string
	space?: string
}>()

const model = computed(() => buildOgImage(props))
const host = computed(() => new URL(useSiteConfig().url).host)
</script>

<template>
	<div data-theme="dark" class="flex h-full w-full bg-background p-14 text-foreground" style="font-family: Inter">
		<div class="flex w-[430px] shrink-0 flex-col justify-between pr-12">
			<div class="flex items-center gap-4">
				<img src="/logo-dark-sm.svg" width="52" height="52" class="rounded-lg" />
				<img src="/logo-dark.svg" width="122" height="35" />
			</div>
			<div class="flex flex-col gap-5">
				<span class="text-[26px] text-muted-foreground">{{ model.label }}</span>
				<span class="text-[54px] leading-[1.08] font-semibold tracking-[-0.022em]">{{ model.title }}</span>
			</div>
			<span class="text-[22px] text-muted-foreground">{{ host }}</span>
		</div>

		<div class="flex min-w-0 flex-1 flex-col gap-4">
			<div
				v-if="model.visual.type === 'scales'"
				class="flex flex-1 flex-col justify-center gap-3 rounded-[28px] bg-card px-7 py-6"
			>
				<div
					v-for="row in model.visual.rows"
					:key="row.label"
					class="flex flex-1 items-center gap-4"
					:class="model.visual.rows.length > 2 ? 'max-h-[96px]' : 'max-h-[400px]'"
				>
					<span
						v-if="model.visual.rows.length > 1"
						class="w-[132px] shrink-0 text-[20px] whitespace-nowrap text-muted-foreground"
						>{{ row.label }}</span
					>
					<div class="flex h-full flex-1 gap-1.5">
						<div
							v-for="(hex, index) in row.hexes"
							:key="index"
							class="flex h-full flex-1 items-center justify-center rounded-lg"
							:style="{ backgroundColor: hex }"
						>
							<div
								v-if="index === row.anchorIndex"
								class="size-3 rounded-full"
								:style="{ backgroundColor: readableTextColor(hex) }"
							/>
						</div>
					</div>
				</div>
				<div class="flex gap-4">
					<span v-if="model.visual.rows.length > 1" class="w-[132px] shrink-0" />
					<div class="flex flex-1 gap-1.5">
						<span
							v-for="step in scaleSteps"
							:key="step"
							class="flex flex-1 justify-center text-[15px] text-muted-foreground"
							>{{ step }}</span
						>
					</div>
				</div>
			</div>

			<div
				v-else-if="model.visual.type === 'colors'"
				class="flex flex-1 flex-col justify-center gap-3 rounded-[28px] bg-card p-6"
			>
				<div
					v-for="(color, index) in model.visual.colors"
					:key="index"
					class="flex max-h-[96px] flex-1 items-center gap-5"
				>
					<div class="h-full w-[150px] shrink-0 rounded-2xl" :style="{ backgroundColor: color.hex }" />
					<div class="flex flex-col">
						<span class="text-[28px] font-semibold tracking-[-0.022em]">{{ color.hex }}</span>
						<span class="text-[20px] text-muted-foreground">{{ color.name }}</span>
					</div>
				</div>
			</div>

			<template v-else-if="model.visual.type === 'contrast'">
				<div
					class="flex flex-1 flex-col justify-center gap-4 rounded-[28px] px-10"
					:style="{ backgroundColor: model.visual.background, color: model.visual.text }"
				>
					<span class="text-[150px] leading-none font-semibold tracking-[-0.022em]">Aa</span>
					<span class="text-[30px] leading-snug">Body text set in this pair.</span>
				</div>
				<div class="flex gap-4">
					<div class="flex flex-1 flex-col rounded-[22px] bg-card px-6 py-4">
						<span class="text-[18px] text-muted-foreground">WCAG 2.2</span>
						<span class="text-[34px] font-semibold tracking-[-0.022em]">{{ model.visual.ratio }}</span>
					</div>
					<div class="flex flex-1 flex-col rounded-[22px] bg-card px-6 py-4">
						<span class="text-[18px] text-muted-foreground">Level</span>
						<span class="text-[34px] font-semibold tracking-[-0.022em]">{{ model.visual.level }}</span>
					</div>
					<div class="flex flex-1 flex-col rounded-[22px] bg-card px-6 py-4">
						<span class="text-[18px] text-muted-foreground">APCA</span>
						<span class="text-[34px] font-semibold tracking-[-0.022em]">{{ model.visual.lc }}</span>
					</div>
				</div>
			</template>

			<template v-else-if="model.visual.type === 'color'">
				<div
					class="flex flex-1 flex-col justify-end rounded-[28px] p-8"
					:style="{ backgroundColor: model.visual.hex, color: model.visual.foreground }"
				>
					<span class="text-[24px]">{{ model.visual.name }}</span>
					<span class="text-[56px] leading-tight font-semibold tracking-[-0.022em]">{{ model.visual.hex }}</span>
				</div>
				<div class="flex h-[52px] gap-1.5">
					<div
						v-for="(hex, index) in model.visual.shades"
						:key="index"
						class="flex-1 rounded-lg"
						:style="{ backgroundColor: hex }"
					/>
				</div>
				<div class="flex flex-wrap gap-3">
					<div
						v-for="value in model.visual.values"
						:key="value.label"
						class="flex w-[48%] grow flex-col rounded-[20px] bg-card px-5 py-3"
					>
						<span class="text-[16px] text-muted-foreground">{{ value.label }}</span>
						<span class="text-[20px] font-medium whitespace-nowrap">{{ value.value }}</span>
					</div>
				</div>
			</template>

			<template v-else-if="model.visual.type === 'gradient'">
				<div class="flex flex-1 rounded-[28px]" :style="{ backgroundImage: model.visual.background }" />
				<div class="flex gap-3">
					<div
						v-for="(hex, index) in model.visual.stops"
						:key="index"
						class="flex flex-1 items-center gap-3 rounded-[20px] bg-card px-4 py-3"
					>
						<div class="size-7 shrink-0 rounded-full" :style="{ backgroundColor: hex }" />
						<span class="text-[22px] font-medium">{{ hex }}</span>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
