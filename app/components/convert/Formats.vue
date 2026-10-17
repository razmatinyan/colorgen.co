<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import type { ConversionFormatId } from '~/lib/color'
import { colorConverterKey } from '~/composables/useColorConverter'

const converter = inject(colorConverterKey)!
const { copy } = useClipboard({ legacy: true })
const { showToast } = useAppToast()

const formatHints: Record<ConversionFormatId, string> = {
	hex: 'CSS, Figma, most tools',
	rgb: 'CSS, 0–255 channels',
	hsl: 'CSS, hue saturation lightness',
	hwb: 'CSS, hue whiteness blackness',
	oklch: 'CSS, even lightness steps',
	oklab: 'CSS, for mixing',
	lch: 'CSS, CIE lightness chroma hue',
	lab: 'CSS, CIE lightness and axes',
	p3: 'CSS, wide-gamut screens',
}

async function copyValue(label: string, value: string) {
	await copy(value)
	showToast(`Copied ${value}`, 'success', { description: label })
}
</script>

<template>
	<div class="grid gap-6">
		<ol class="grid gap-1">
			<li v-for="(item, index) in converter.conversion.value.values" :key="item.id">
				<Tooltip>
					<TooltipTrigger as-child>
						<button
							type="button"
							class="group flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
							:aria-label="`Copy ${item.label}: ${item.value}`"
							@click="copyValue(item.label, item.value)"
						>
							<span class="grid w-28 shrink-0 gap-0.5 sm:w-44">
								<span class="text-sm font-medium">{{ item.label }}</span>
								<span class="hidden truncate text-xs text-muted-foreground sm:block">{{ formatHints[item.id] }}</span>
							</span>
							<span class="min-w-0 flex-1 truncate text-sm tabular-nums">{{ item.value }}</span>
							<Badge v-if="item.isMapped" variant="secondary" class="hidden sm:inline-flex">Closest match</Badge>
							<Icon name="lucide:copy" class="size-4 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100" />
						</button>
					</TooltipTrigger>
					<TooltipContent>Copy <Kbd>{{ index + 1 }}</Kbd></TooltipContent>
				</Tooltip>
			</li>
		</ol>

		<section v-if="converter.conversion.value.names.length" class="grid gap-2" aria-labelledby="css-names">
			<h3 id="css-names" class="text-sm font-medium">CSS name</h3>
			<div class="flex flex-wrap gap-1.5">
				<Button
					v-for="name in converter.conversion.value.names"
					:key="name"
					variant="outline"
					size="sm"
					@click="copyValue('CSS name', name)"
				>
					{{ name }}
				</Button>
			</div>
		</section>
	</div>
</template>
