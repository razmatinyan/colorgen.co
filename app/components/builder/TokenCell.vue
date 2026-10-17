<script setup lang="ts">
import { scaleRef, systemScales, type TokenMode, type TokenName, type TokenRef } from '~/lib/color'
import { designSystemBuilderKey, tokenRefLabel } from '~/composables/useDesignSystemBuilder'

const props = defineProps<{ name: TokenName, mode: TokenMode }>()
const builder = inject(designSystemBuilderKey)!

const open = ref(false)
const token = computed(() => builder.tokens.value[props.name][props.mode])
const modeLabel = computed(() => (props.mode === 'light' ? 'Light' : 'Dark'))

const checks = computed(() => builder.readability.value.filter(result =>
	result.mode === props.mode && (result.pair.foreground === props.name || result.pair.background === props.name)))
const failing = computed(() => checks.value.filter(result => !result.passes && result.pair.foreground === props.name))

const rows = computed(() => systemScales(builder.system.value).map(scale => ({
	id: scale.id,
	label: tokenRefLabel(scaleRef(scale.id, 50)).replace(/ 50$/, ''),
	options: [
		...(scale.id === 'neutral' ? [{ ref: 'white' as TokenRef, hex: '#ffffff' }] : []),
		...scale.swatches.map(swatch => ({ ref: scaleRef(scale.id, swatch.step) as TokenRef, hex: swatch.hex })),
	],
})))

function choose(tokenRef: TokenRef) {
	builder.setToken(props.name, props.mode, tokenRef)
}

function reset() {
	builder.resetToken(props.name, props.mode)
}
</script>

<template>
	<Popover v-model:open="open">
		<PopoverTrigger as-child>
			<button
				type="button"
				class="flex w-full min-w-0 items-center gap-2.5 rounded-xl p-1.5 pr-2.5 text-left ring-1 ring-foreground/10 outline-none transition-colors ring-inset hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted"
				:aria-label="`${name}, ${modeLabel} mode: ${tokenRefLabel(token.ref)}${failing.length ? ', not readable' : ''}. Change`"
			>
				<span class="size-7 shrink-0 rounded-lg ring-1 ring-foreground/10 ring-inset transition-colors duration-300" :style="{ background: token.hex }" />
				<span class="min-w-0 flex-1 truncate text-sm">{{ tokenRefLabel(token.ref) }}</span>
				<span v-if="token.edited" class="size-1.5 shrink-0 rounded-full bg-foreground/60" aria-hidden="true" />
				<Badge v-if="failing.length" variant="secondary" class="shrink-0 bg-destructive/10 text-destructive">
					<Icon name="lucide:triangle-alert" /> {{ failing[0]!.ratio.toFixed(1) }}
				</Badge>
			</button>
		</PopoverTrigger>
		<PopoverContent :align="mode === 'light' ? 'start' : 'end'" :collision-padding="12" class="w-[22.5rem] max-w-[calc(100vw-1.5rem)] gap-4 p-4">
			<div class="flex items-start justify-between gap-3">
				<div class="min-w-0">
					<p class="truncate text-sm font-medium">{{ name }}</p>
					<p class="text-sm text-muted-foreground">{{ modeLabel }} mode · {{ tokenRefLabel(token.ref) }}</p>
				</div>
				<Button v-if="token.edited" variant="ghost" size="sm" class="shrink-0" @click="reset">
					<Icon name="lucide:rotate-ccw" data-icon="inline-start" /> Reset
				</Button>
			</div>

			<div class="grid gap-3">
				<div v-for="row in rows" :key="row.id" class="grid gap-1.5">
					<p class="text-xs text-muted-foreground">{{ row.label }}</p>
					<div class="flex flex-wrap gap-1">
						<button
							v-for="option in row.options"
							:key="option.ref"
							type="button"
							class="size-5.5 rounded-md ring-1 ring-foreground/10 ring-inset outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50"
							:class="option.ref === token.ref && 'ring-2 ring-foreground ring-offset-2 ring-offset-popover'"
							:style="{ background: option.hex }"
							:aria-label="tokenRefLabel(option.ref)"
							:aria-pressed="option.ref === token.ref"
							:title="tokenRefLabel(option.ref)"
							@click="choose(option.ref)"
						/>
					</div>
				</div>
			</div>

			<ul v-if="checks.length" class="grid grid-cols-1 gap-1 rounded-xl bg-muted/50 p-1">
				<li v-for="check in checks" :key="check.pair.id" class="flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-sm">
					<span class="min-w-0 truncate text-muted-foreground">{{ check.pair.label }}</span>
					<span class="flex shrink-0 items-center gap-2">
						<span class="tabular-nums">{{ check.ratio.toFixed(1) }}</span>
						<Badge variant="secondary" :class="check.passes ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'">
							{{ check.passes ? 'Pass' : 'Fail' }}
						</Badge>
					</span>
				</li>
			</ul>
		</PopoverContent>
	</Popover>
</template>
