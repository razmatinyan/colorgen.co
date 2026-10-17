<script setup lang="ts">
import { scaleHexes, toHex } from '~/lib/color'
import { paletteGeneratorKey, type PaletteColor } from '~/composables/usePaletteGenerator'

const props = defineProps<{ color: PaletteColor }>()
const palette = inject(paletteGeneratorKey)!

const hex = computed(() => toHex(props.color).toUpperCase())
const scale = computed(() => scaleHexes(props.color))
const isOpen = computed(() => palette.selectedId.value === props.color.id)
const panelId = useId()
</script>

<template>
	<div class="rounded-xl transition-colors" :class="isOpen ? 'bg-muted' : 'hover:bg-muted/50'">
		<div class="flex items-center gap-1 pr-1.5">
			<button
				type="button"
				class="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
				:aria-expanded="isOpen"
				:aria-controls="panelId"
				@click="palette.toggleOpen(color.id)"
			>
				<span class="size-10 shrink-0 rounded-lg ring-1 ring-foreground/10 ring-inset transition-colors duration-300" :style="{ background: hex }" />
				<span class="min-w-0 flex-1">
					<span class="flex items-baseline justify-between gap-2">
						<span class="text-sm font-medium">{{ color.role }}</span>
						<span class="text-sm text-muted-foreground tabular-nums">{{ hex }}</span>
					</span>
					<span class="block truncate text-sm text-muted-foreground">{{ color.hint }}</span>
				</span>
			</button>

			<span v-if="color.id === 'primary'" class="grid size-8 shrink-0 place-items-center text-muted-foreground">
				<Icon name="lucide:pin" aria-hidden="true" />
				<span class="sr-only">Always kept. Every option is built around it.</span>
			</span>
			<Tooltip v-else>
				<TooltipTrigger as-child>
					<Button
						variant="ghost"
						size="icon-sm"
						:aria-label="color.locked ? `Unlock ${color.role}` : `Keep ${color.role} in every option`"
						:aria-pressed="color.locked"
						:class="color.locked ? 'text-foreground' : 'text-muted-foreground'"
						@click="palette.toggleLock(color.id)"
					>
						<Icon :name="color.locked ? 'lucide:lock' : 'lucide:lock-open'" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>{{ color.locked ? 'Locked. Every option keeps this color' : 'Lock to keep this color in every option' }}</TooltipContent>
			</Tooltip>
		</div>

		<div v-if="isOpen" :id="panelId">
			<div class="mx-2.5 mb-4 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
				<span v-for="step in scale" :key="step" class="flex-1" :style="{ background: step }" />
			</div>
			<PaletteColorEditor :color="color" />
		</div>
	</div>
</template>
