<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { readableTextColor } from '~/lib/color'
import { designSystemBuilderKey } from '~/composables/useDesignSystemBuilder'

const builder = inject(designSystemBuilderKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

async function copySwatch(label: string, step: number, hex: string) {
	const value = hex.toUpperCase()
	await copy(value)
	showToast(`Copied ${value}`, 'success', { description: `${label} ${step}` })
}
</script>

<template>
	<div class="@container grid gap-6">
		<section v-for="color in builder.colors.value" :key="color.id" class="grid gap-2.5" :aria-labelledby="`scale-${color.id}`">
			<div class="flex items-baseline justify-between gap-3">
				<h3 :id="`scale-${color.id}`" class="text-sm font-medium">{{ color.label }}</h3>
				<span class="truncate text-sm text-muted-foreground">{{ color.hint }}</span>
			</div>
			<ol class="grid grid-cols-6 gap-1.5 @2xl:grid-cols-11">
				<li v-for="swatch in color.swatches" :key="swatch.step">
					<Tooltip>
						<TooltipTrigger as-child>
							<button
								type="button"
								class="flex h-16 w-full flex-col justify-between rounded-xl p-2 text-left text-xs ring-1 ring-foreground/10 ring-inset outline-none transition-[color,background-color,transform] duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] @4xl:h-20"
								:style="{ background: swatch.hex, color: readableTextColor(swatch.hex) }"
								:aria-label="`Copy ${color.label} ${swatch.step}, ${swatch.hex.toUpperCase()}${swatch.step === color.anchorStep ? ', your color' : ''}`"
								@click="copySwatch(color.label, swatch.step, swatch.hex)"
							>
								<span class="flex items-center justify-between gap-1 font-medium tabular-nums">
									{{ swatch.step }}
									<span v-if="swatch.step === color.anchorStep" class="size-1.5 rounded-full bg-current" aria-hidden="true" />
								</span>
								<span class="hidden tabular-nums opacity-80 @4xl:block">{{ swatch.hex.slice(1).toUpperCase() }}</span>
							</button>
						</TooltipTrigger>
						<TooltipContent>
							{{ swatch.hex.toUpperCase() }}{{ swatch.step === color.anchorStep ? ' · your color' : '' }}
						</TooltipContent>
					</Tooltip>
				</li>
			</ol>
		</section>
		<p class="flex items-center gap-2 text-sm text-muted-foreground">
			<span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
			Marks the step that holds your exact color. Click any step to copy it.
		</p>
	</div>
</template>
