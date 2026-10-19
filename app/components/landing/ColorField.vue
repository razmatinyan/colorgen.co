<script setup lang="ts">
import { parseColor, toHex } from '~/lib/color'
import { landingDemoKey, landingSamples } from '~/composables/useLandingDemo'

withDefaults(defineProps<{ showSamples?: boolean }>(), { showSamples: true })

const demo = inject(landingDemoKey)!
const inputId = useId()
const hintId = useId()

const draft = ref(demo.builder.brandHex.value.toUpperCase())
const isEditing = ref(false)
const isInvalid = ref(false)

watch(demo.builder.brandHex, (hex) => {
	if (!isEditing.value) draft.value = hex.toUpperCase()
})

function preview() {
	const parsed = parseColor(draft.value)
	isInvalid.value = false
	if (parsed && toHex(parsed) !== demo.builder.brandHex.value) demo.chooseBrand(parsed)
}

function choose(hex: string) {
	demo.chooseBrand(parseColor(hex)!)
}

async function submit() {
	const parsed = parseColor(draft.value)
	isInvalid.value = !parsed
	if (!parsed) return
	demo.chooseBrand(parsed)
	await navigateTo(demo.builderPath.value)
}
</script>

<template>
	<div class="grid gap-3">
		<form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="submit">
			<div
				class="flex h-12 flex-1 items-center gap-2 rounded-4xl border border-input bg-background pr-4 pl-1.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"
				:class="isInvalid && 'border-destructive ring-3 ring-destructive/20'"
			>
				<Popover>
					<PopoverTrigger as-child>
						<button
							type="button"
							class="size-9 shrink-0 rounded-full ring-1 ring-foreground/10 transition-colors duration-500 outline-none ring-inset focus-visible:ring-3 focus-visible:ring-ring/50"
							:style="{ background: demo.builder.brandHex.value }"
							aria-label="Open color picker"
						/>
					</PopoverTrigger>
					<PopoverContent align="start" class="w-76">
						<ColorPickerPanel :color="demo.builder.settings.value.brand" @update="demo.chooseBrand" />
					</PopoverContent>
				</Popover>
				<label :for="inputId" class="sr-only">Your brand color</label>
				<input
					:id="inputId"
					v-model="draft"
					class="min-w-0 flex-1 bg-transparent text-base tabular-nums outline-none placeholder:text-muted-foreground"
					placeholder="#2F5BEA"
					autocomplete="off"
					spellcheck="false"
					:aria-invalid="isInvalid || undefined"
					:aria-describedby="hintId"
					@focus="isEditing = true"
					@blur="isEditing = false"
					@input="preview"
				/>
			</div>
			<Button type="submit" size="lg" class="h-12 px-6">
				Build my system <Icon name="lucide:arrow-right" data-icon="inline-end" />
			</Button>
		</form>
		<p :id="hintId" class="text-sm" :class="isInvalid ? 'text-destructive' : 'text-muted-foreground'">
			{{
				isInvalid
					? 'Enter a color like #2F5BEA, rgb(47 91 234) or a color name.'
					: 'Paste a HEX, RGB, HSL or OKLCH value, or pick one.'
			}}
		</p>
		<div v-if="showSamples" class="flex flex-wrap items-center gap-2">
			<span class="text-sm text-muted-foreground">No color yet? Try</span>
			<button
				v-for="hex in landingSamples"
				:key="hex"
				type="button"
				class="size-7 rounded-full ring-1 ring-foreground/10 transition-transform ring-inset hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50"
				:class="demo.builder.brandHex.value === hex && 'outline-2 outline-offset-2 outline-foreground'"
				:style="{ background: hex }"
				:aria-label="`Try ${hex.toUpperCase()}`"
				:aria-pressed="demo.builder.brandHex.value === hex"
				@click="choose(hex)"
			/>
		</div>
	</div>
</template>
